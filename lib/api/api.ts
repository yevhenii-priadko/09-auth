// lib/api/api.ts
import axios from 'axios'

// 1. Формуємо базовий URL строго за методичкою ТЗ
const clientBaseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api'

// 2. Перевіряємо, чи ми зараз на сервері (в Node.js середовищі роутів менторів).
// Якщо на сервері — базовий URL має вести НАПРЯМУ на GoIT.
// Якщо в браузері — використовуємо адресу з методички (clientBaseURL).
const baseURL = typeof window === 'undefined' ? 'https://notehub-api.goit.study' : clientBaseURL

export const api = axios.create({
  baseURL,
  withCredentials: true,
})
