'use client'

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { checkSession } from '@/lib/api/clientApi'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logoutStore } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await checkSession()

        // Если сессия активна, записываем пользователя в Zustand-стор
        if (res && res.user) {
          setAuth(res.user)
        } else {
          logoutStore()
        }
      } catch (error) {
        // Если сессии нет (ошибка 401), просто чистим локальный стор
        logoutStore()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, []) // Обязательно пустой массив, чтобы запрос выполнился только один раз!

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <h2>Loading session...</h2>
      </div>
    )
  }

  return <>{children}</>
}
