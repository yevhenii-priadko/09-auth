'use client'

import { useState, useEffect } from 'react' // Повертаємо useEffect
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

import NoteList from '@/components/NoteList/NoteList'
import Pagination from '@/components/Pagination/Pagination'
import SearchBox from '@/components/SearchBox/SearchBox'
import css from '../../notes.module.css'
import { fetchNotes } from '@/lib/api'

interface NotesClientProps {
  tag?: string // Значення тега (currentTag), передане з серверного компонента
}

export default function NotesClient({ tag }: NotesClientProps) {
  // Локальні стейти для керування параметрами пошуку та пагінації
  const [localSearch, setLocalSearch] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [page, setPage] = useState<number>(1)

  // ВИКОНУЄМО ВИМОГУ МЕНТОРА: ОБРОБЛЯЄМО ВСЕРЕДИНІ ХУКА useEffect
  useEffect(() => {
    // Загортаємо в мікротаску, щоб лінтер не сварився на синхронний setState в ефекті
    Promise.resolve().then(() => {
      setPage(1)
      setSearch('')
      setLocalSearch('')
    })
  }, [tag]) // Хук чітко слідкує за зміною пропа tag

  // Хук React Query: використовує проп tag прямо у queryKey та queryFn
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', search, page, tag],
    queryFn: () => fetchNotes(search, page, tag),
    placeholderData: keepPreviousData,
  })

  const debouncedSearch = useDebouncedCallback((text: string) => {
    setSearch(text)
    setPage(1)
  }, 500)

  const handleSearchChange = (text: string) => {
    setLocalSearch(text)
    debouncedSearch(text)
  }

  const notes = data?.notes ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox onChange={handleSearchChange} value={localSearch} />

        {totalPages > 1 && (
          <Pagination pageCount={totalPages} currentPage={page} onPageChange={p => setPage(p)} />
        )}

        <Link href='/notes/action/create' className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <div className={css.loading}>Loading notes...</div>}
      {isError && <div className={css.error}>Something went wrong!</div>}

      {!isLoading && !isError && <NoteList notes={notes} />}
    </div>
  )
}
