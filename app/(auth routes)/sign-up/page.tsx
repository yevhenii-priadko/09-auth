'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/api/clientApi'
import { useAuthStore } from '@/lib/store/authStore'
import css from './SignUp.module.css'
import { isAxiosError } from 'axios'

export default function SignUpPage() {
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
      const res = await register({ email, password })
      setAuth(res.user)
      router.push('/profile')
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Authentication failed')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Registration failed')
      }
    }
  }

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>
      <form className={css.form} onSubmit={handleSubmit}>
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
            Register
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  )
}
