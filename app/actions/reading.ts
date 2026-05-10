'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

export async function addBook(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('books').insert({
    user_id: user.id,
    title: (formData.get('title') as string).trim(),
    author: (formData.get('author') as string) || null,
    total_pages: Number(formData.get('total_pages') || 0) || null,
    started_at: format(new Date(), 'yyyy-MM-dd'),
  })
  revalidatePath('/reading')
}

export async function logReadingSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const bookId = formData.get('book_id') as string
  const pages = Number(formData.get('pages') || 0)
  const minutes = Number(formData.get('minutes') || 0)
  const currentPage = Number(formData.get('current_page') || 0)

  await supabase.from('reading_sessions').insert({
    user_id: user.id,
    book_id: bookId,
    date: format(new Date(), 'yyyy-MM-dd'),
    pages,
    minutes,
  })

  if (currentPage > 0) {
    const { data: book } = await supabase.from('books').select('total_pages').eq('id', bookId).single()
    const isFinished = book?.total_pages && currentPage >= book.total_pages
    await supabase.from('books').update({
      current_page: currentPage,
      finished_at: isFinished ? format(new Date(), 'yyyy-MM-dd') : null,
    }).eq('id', bookId).eq('user_id', user.id)
  }
  revalidatePath('/reading')
}

export async function addArticle(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('articles').insert({
    user_id: user.id,
    url: (formData.get('url') as string).trim(),
    title: (formData.get('title') as string) || null,
    source: (formData.get('source') as string) || null,
    minutes_spent: Number(formData.get('minutes_spent') || 0) || null,
    takeaway: (formData.get('takeaway') as string) || null,
  })
  revalidatePath('/reading')
}
