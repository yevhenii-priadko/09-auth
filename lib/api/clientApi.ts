// lib/api/clientApi.ts

import { api } from './api'
import { User } from '@/types/user'
import { NoteTag, Note } from '@/types/note' // Імпортуємо інтерфейс Note та NoteTag для повної типізації
import axios from 'axios'

// Інтерфейс відповіді для авторизації
export interface AuthResponse {
  user: User
}

// Інтерфейс відповіді для списку нотаток, щоб існували .notes та .totalPages
export interface NotesResponse {
  notes: Note[]
  totalPages: number
}

export const register = async (data: Record<string, string>): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', data)
  return res.data
}

export const login = async (data: Record<string, string>): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', data)
  return res.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const checkSession = async (): Promise<AuthResponse> => {
  // Убираем дженерик <AuthResponse> из самого вызова .get,
  // чтобы TypeScript не ругался на withCredentials в настройках
  const res = await axios.get('https://goit.study', {
    withCredentials: true,
  })

  // Принудительно приводим возвращаемые данные к нужному типу AuthResponse
  return res.data as AuthResponse
}

export const getMe = async (): Promise<User> => {
  const res = await api.get<User>('/users/me')
  return res.data
}

export const updateMe = async (data: Partial<User>): Promise<User> => {
  const res = await api.patch<User>('/users/me', data)
  return res.data
}

// Функції роботи з нотатками (CSR) — ТИПІЗАЦІЯ БЕЗ ANY
export const fetchNotes = async (search = '', page = 1, tag?: string): Promise<NotesResponse> => {
  const res = await api.get<NotesResponse>('/notes', {
    params: { search, page, perPage: 12, tag },
  })
  return res.data
}

export const fetchNoteById = async (id: string) => {
  const res = await api.get(`/notes/${id}`) // б'є на локальний проксі
  return res.data
}

export const createNote = async (data: {
  title: string
  content: string
  tag: NoteTag
}): Promise<Note> => {
  const res = await api.post<Note>('/notes', data)
  return res.data
}

export const deleteNote = async (id: string) => {
  const res = await api.delete(`/notes/${id}`) // б'є на локальний проксі
  return res.data
}
