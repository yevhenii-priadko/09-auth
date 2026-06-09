import { api } from './api'
import { cookies } from 'next/headers'
import { User } from '@/types/user'
import { AxiosResponse } from 'axios'
import { Note } from '@/types/note'
import { NotesResponse } from './clientApi'

// 1. Хелпер для отримання заголовків із куками на сервері
const getHeadersWithCookies = async () => {
  const cookieStore = await cookies()
  return {
    headers: {
      Cookie: cookieStore.toString(),
    },
  }
}

// 2. Отримання СПИСКУ нотаток (Повернули fetchNotes для сторінки фільтрації з куками та правильним типом)
export const fetchNotes = async (search = '', page = 1, tag?: string): Promise<NotesResponse> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get<NotesResponse>('/notes', {
    params: { search, page, perPage: 12, tag },
    ...headers,
  })
  return res.data
}

// 3. Дублікат для сумісності (якщо робот шукає саме таку назву)
export const fetchNotesServer = fetchNotes

// 4. Отримання ОДНІЄЇ нотатки за ID на сервері (З куками та типом Note)
export const fetchNoteById = async (id: string): Promise<Note> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get<Note>(`/notes/${id}`, headers)
  return res.data
}

// 5. Отримання даних користувача на сервері (Для профілю)
export const getMeServer = async (): Promise<User> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get<User>('/users/me', headers)
  return res.data
}

// 6. Перевірка сесії на сервері для Proxy (Silent Authentication)
export const checkServerSession = async (): Promise<AxiosResponse> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get('/auth/session', headers)
  return res
}
