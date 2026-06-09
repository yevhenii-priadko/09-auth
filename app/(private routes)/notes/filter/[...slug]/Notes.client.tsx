'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'

import NoteList from '@/components/NoteList/NoteList'
import Pagination from '@/components/Pagination/Pagination'
import SearchBox from '@/components/SearchBox/SearchBox'
import css from '../../notes.module.css'
import { fetchNotes } from '@/lib/api/clientApi'

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
    Promise.resolve().then(() => {
      setPage(1)
      setSearch('')
      setLocalSearch('')
    })
  }, [tag]) // Хук чітко слідкує за зміною пропа tag

  // Хук React Query: захищаємо від нескінченного спаму в терміналі через параметри безпеки
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', search, page, tag],
    queryFn: () => fetchNotes(search, page, tag),
    placeholderData: keepPreviousData,

    // 🔥 НАДВАЖЛИВІ НАЛАШТУВАННЯ ДЛЯ ЗУПИНКИ СПАМУ:
    retry: false, // Вимикає нескінченні спроби запиту, якщо користувач неавторизований (401)
    staleTime: 1000 * 60 * 5, // Дані вважаються свіжими 5 хвилин, React Query не смикає сервер щомиті
    refetchOnWindowFocus: false, // Забороняє робити повторний GET, коли ви просто клікаєте по екрану чи VS Code
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

        {/* Додали prefetch={false} строго за правилами оптимізації та ТЗ */}
        <Link href='/notes/action/create' prefetch={false} className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <div className={css.loading}>Loading notes...</div>}
      {isError && <div className={css.error}>Something went wrong!</div>}

      {!isLoading && !isError && notes.length > 0 && <NoteList notes={notes} />}
    </div>
  )
}
