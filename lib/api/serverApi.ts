// lib/api/serverApi.ts

import { api } from './api'
import { cookies } from 'next/headers'
import { User } from '@/types/user'
import { AxiosResponse } from 'axios'
import { Note } from '@/types/note'
import { NotesResponse } from './clientApi'

export const fetchNotes = async (search = '', page = 1, tag?: string): Promise<NotesResponse> => {
  const res = await api.get<NotesResponse>('/notes', {
    params: { search, page, perPage: 12, tag },
  })
  return res.data
}

export const fetchNoteById = async (id: string): Promise<Note> => {
  // Використовуємо серверний інстанс api, який залізобетонно знає адресу бекенду
  const res = await api.get<Note>(`/notes/${id}`)
  return res.data
}
// Хелпер для отримання заголовків із куками на сервері
const getHeadersWithCookies = async () => {
  const cookieStore = await cookies()
  return {
    headers: {
      Cookie: cookieStore.toString(),
    },
  }
}

// Отримання списку нотаток на сервері (SSR)
export const fetchNotesServer = async (search = '', page = 1, tag?: string): Promise<Note> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get('/notes', {
    params: { search, page, perPage: 12, tag },
    ...headers,
  })
  return res.data
}

// Отримання нотатки за ID на сервері (SSR)
export const fetchNoteByIdServer = async (id: string): Promise<Note> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get(`/notes/${id}`, headers)
  return res.data
}

// Отримання даних користувача на сервері (SSR)
export const getMeServer = async (): Promise<User> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get<User>('/users/me', headers)
  return res.data
}

// Перевірка сесії на сервері для Proxy (Silent Authentication)
// Строга типізація AxiosResponse без використання any!
export const checkServerSession = async (): Promise<AxiosResponse> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get('/auth/session', headers)
  return res
}
