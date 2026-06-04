import css from './page.module.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page not found | NoteHub',
  description:
    'Unfortunately, this page does not exist. The link may be outdated or the address was entered with an error.',
  openGraph: {
    title: 'Page not found | NoteHub',
    description: 'Unfortunately, this page does not exist. Please return to the NoteHub home page.',
    url: '/404',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        alt: 'Page not found',
      },
    ],
  },
}

const NotFound = () => {
  return (
    <>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>Sorry, the page you are looking for does not exist.</p>
      <Link href='/'>Back Home</Link>
    </>
  )
}

export default NotFound
