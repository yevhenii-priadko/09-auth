import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { fetchNotes } from '@/lib/api/clientApi'
import NotesClient from './Notes.client'
import { Metadata } from 'next'

interface NotesFilterPageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: NotesFilterPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const tagFromUrl = resolvedParams.slug?.[0]

  // Defining the filter name for Title in English
  const isAll = !tagFromUrl || tagFromUrl === 'all'
  const filterName = isAll ? 'All Notes' : `Category "${tagFromUrl}"`

  const title = `${filterName} | NoteHub`
  const description = isAll
    ? 'View all your saved notes in the NoteHub application.'
    : `View and manage notes filtered by category or tag: ${tagFromUrl}.`

  // Fixed the syntax error in template literal (added $ and missing slash)
  const url = `/notes/filter/${resolvedParams.slug?.join('/') || 'all'}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          // Returned the correct OG image from the task requirements
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          alt: `Notes filter: ${filterName}`,
        },
      ],
    },
  }
}

export default async function NotesFilterPage({ params }: NotesFilterPageProps) {
  // Розгортаємо асинхронні параметри (особливість Next.js 15)
  const resolvedParams = await params

  // params.tag — це масив через catch-all [[...tag]]. Беремо перший елемент безпечно.
  const tagFromUrl = resolvedParams.slug?.[0]

  // Якщо в URL написано 'all' або тег відсутній, передаємо undefined на бекенд (за ТЗ)
  const currentTag = tagFromUrl === 'all' ? undefined : tagFromUrl

  const queryClient = new QueryClient()

  // Попередньо завантажуємо дані на сервері, додаючи поточний тег у queryKey та queryFn
  await queryClient.prefetchQuery({
    // Додаємо тег у масив ключів, щоб React Query знав, що це дані під конкретний фільтр
    queryKey: ['notes', '', 1, currentTag],
    queryFn: () => fetchNotes('', 1, currentTag),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={currentTag} />
    </HydrationBoundary>
  )
}
