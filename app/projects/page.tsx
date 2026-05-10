import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/nav/AppShell'
import { ProjectsClient } from '@/components/projects/ProjectsClient'

export const revalidate = 0

const SEED_PROJECTS = [
  { slug: 'packperfect', name: 'PackPerfect', tagline: 'Travel packing app', status: 'active', github_repo: 'Ncepler/packperfect', live_url: null, notes_md: null },
  { slug: 'decalyze', name: 'Decalyze', tagline: 'DECA prep app', status: 'active', github_repo: 'Ncepler/decalyze', live_url: null, notes_md: null },
  { slug: 'camp-closet', name: 'Camp Closet', tagline: 'Two-sided camp clothing marketplace', status: 'paused', github_repo: null, live_url: null, notes_md: null },
  { slug: 'goalmaxx', name: 'GoalMaxx', tagline: 'Personal life-OS dashboard', status: 'active', github_repo: 'Ncepler/goalmaxx', live_url: null, notes_md: null },
  { slug: 'goalmaxx-for-others', name: 'GoalMaxx for Others', tagline: 'Multi-user fork — do not start until v1 used daily for 3+ months', status: 'paused', github_repo: null, live_url: null, notes_md: null },
]

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at')

  if (!projects || projects.length === 0) {
    await supabase.from('projects').insert(
      SEED_PROJECTS.map(p => ({ ...p, user_id: user.id }))
    )
    const { data: seeded } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at')
    projects = seeded
  }

  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('project_id, completed')
    .eq('user_id', user.id)

  const openTasksByProject = (tasks ?? []).reduce<Record<string, number>>((acc, t) => {
    if (!t.completed) acc[t.project_id] = (acc[t.project_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <AppShell>
      <ProjectsClient projects={projects ?? []} openTasksByProject={openTasksByProject} />
    </AppShell>
  )
}
