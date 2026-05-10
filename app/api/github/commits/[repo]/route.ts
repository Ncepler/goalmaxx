import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ repo: string }> }) {
  const { repo } = await params
  const owner = 'Ncepler'
  const cacheKey = `github:${owner}/${repo}`
  const supabase = await createClient()

  const { data: cached } = await supabase
    .from('github_cache')
    .select('payload, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && new Date(cached.expires_at) > new Date()) {
    return NextResponse.json(cached.payload)
  }

  const pat = process.env.GITHUB_PAT
  if (!pat) return NextResponse.json({ commits: [], error: 'No PAT configured' })

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`,
      { headers: { Authorization: `Bearer ${pat}`, 'X-GitHub-Api-Version': '2022-11-28' } }
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const commits = await res.json()

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await supabase.from('github_cache').upsert({ cache_key: cacheKey, payload: { commits }, expires_at: expiresAt })

    return NextResponse.json({ commits })
  } catch {
    if (cached) return NextResponse.json(cached.payload)
    return NextResponse.json({ commits: [], error: 'Failed to fetch commits' })
  }
}
