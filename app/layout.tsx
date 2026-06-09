import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import TanStackProvider from '@/components/TanStackProvider/TanStackProvider'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'
import AuthProvider from '@/components/AuthProvider/AuthProvider'

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://08-zustand-six-nu.vercel.app'),
  title: 'NoteHub — Your convenient space for notes',
  description: 'Save, filter, and manage your notes easily and quickly with NoteHub.',
  openGraph: {
    title: 'NoteHub — Your convenient space for notes',
    description: 'Save, filter, and manage your notes easily and quickly with NoteHub.',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'NoteHub app preview',
      },
    ],
    type: 'website',
  },
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    <html lang='en' className={roboto.variable}>
      <body className={roboto.className}>
        <TanStackProvider>
          <AuthProvider>
            <Header />
            <main> {children}</main>

            {/* Рендеримо модалку всередині провайдера під головним контентом */}
            {modal}

            <Footer />
          </AuthProvider>
        </TanStackProvider>
      </body>
    </html>
  )
}
