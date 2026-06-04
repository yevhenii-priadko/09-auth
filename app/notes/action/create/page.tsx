import type { Metadata } from 'next'
import NoteForm from '@/components/NoteForm/NoteForm'
import css from './CreateNote.module.css' // Не забудьте скопіювати файли стилів з репозиторію GoIT

export const metadata: Metadata = {
  title: 'Create Note | NoteHub',
  description: 'Create a new note and organize your thoughts instantly in NoteHub.',
  openGraph: {
    title: 'Create Note | NoteHub',
    description: 'Create a new note and organize your thoughts instantly in NoteHub.',
    url: 'https://08-zustand-six-nu.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        alt: 'Create note page preview',
      },
    ],
  },
}

export default function CreateNotePage() {
  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <NoteForm />
      </div>
    </main>
  )
}
