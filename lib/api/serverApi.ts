// lib/api/serverApi.ts

import { api } from './api'
import { cookies } from 'next/headers'
import { User } from '@/types/user'
import { AxiosResponse } from 'axios'

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
export const fetchNotesServer = async (search = '', page = 1, tag?: string): Promise<unknown> => {
  const headers = await getHeadersWithCookies()
  const res = await api.get('/notes', {
    params: { search, page, perPage: 12, tag },
    ...headers,
  })
  return res.data
}

// Отримання нотатки за ID на сервері (SSR)
export const fetchNoteByIdServer = async (id: string): Promise<unknown> => {
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
