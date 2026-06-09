'use client'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api/clientApi'
import { useAuthStore } from '@/lib/store/authStore'
import css from './SignIn.module.css'

export default function SignInPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Исправлено: сохраняем результат в переменную data
      const data = await login({ email, password })
      // Исправлено: передаем строго data.user в ваш стор
      setAuth(data.user)
      router.push('/profile')
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Authentication failed')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor='email'>Email</label>
          <input id='email' type='email' name='email' className={css.input} required />
        </div>

        <div className={css.formGroup}>
          <label htmlFor='password'>Password</label>
          <input id='password' type='password' name='password' className={css.input} required />
        </div>

        <div className={css.actions}>
          <button type='submit' className={css.submitButton}>
            Log in
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  )
}
