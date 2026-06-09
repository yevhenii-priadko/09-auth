import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { fetchNoteById } from '@/lib/api/clientApi'
import NoteDetailsClient from './NoteDetails.client'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

// 1. ФУНКЦІЯ ГЕНЕРАЦІЇ ДИНАМІЧНИХ МЕТАДАНИХ ДЛЯ СЕО
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    // Отримуємо дані нотатки для формування тегів
    const note = await fetchNoteById(id)

    const title = `${note.title} | NoteHub`
    // Обрізаємо опис до 160 символів (стандарт для SEO)
    const description = note.content
      ? note.content.substring(0, 160)
      : 'Детальний перегляд нотатки.'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `/notes/${id}`,
        type: 'article',
        images: [
          {
            url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
            alt: note.title,
          },
        ],
      },
    }
  } catch {
    // Якщо нотатку не знайдено або сталася помилка, повертаємо дефолтні метадані
    return {
      title: 'Нотатка | NoteHub',
      description: 'Перегляд деталей нотатки.',
    }
  }
}

export default async function NoteDetailsPage({ params }: Props) {
  const { id } = await params
  const queryClient = new QueryClient()

  // Попередньо завантажуємо дані конкретної нотатки на сервері
  await queryClient.prefetchQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  )
}
