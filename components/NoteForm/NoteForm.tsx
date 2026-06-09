'use client'

import React, { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createNote } from '@/lib/api/clientApi'
import { useNoteStore } from '@/lib/store/noteStore'
import { NoteTag } from '@/types/note'
import css from './NoteForm.module.css'

export default function NoteForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  // Отримуємо поточну чернетку та функції керування з Zustand стору
  const { draft, setDraft, clearDraft } = useNoteStore()

  // Мутація React Query для збереження нотатки на сервері
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // 1. Очищаємо чернетку в Zustand (та localStorage) після успіху
      clearDraft()
      // 2. Оновлюємо кеш нотаток
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      // 3. Повертаємо користувача на попередню сторінку
      router.back()
    },
    onError: error => {
      console.error('Помилка при створенні нотатки:', error)
    },
  })

  // Слідкуємо за змінами в полях та миттєво пишемо в Zustand чернетку
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setDraft({ [name]: value })
  }

  // Обробник сабміту через сучасний HTML formAction
  const handleSubmitAction = (formData: FormData) => {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const tag = formData.get('tag') as NoteTag

    // Загортаємо в transition для коректної роботи асинхронних подій в Next.js 15
    startTransition(() => {
      createNoteMutation.mutate({
        title,
        content: content || '',
        tag,
      })
    })
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    // При скасуванні чернетка НЕ очищається за ТЗ, просто повертаємось назад
    router.back()
  }

  return (
    // Замість Formik використовуємо нативний тег форми з action
    <form action={handleSubmitAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor='title'>Title</label>
        <input
          id='title'
          type='text'
          name='title'
          className={css.input}
          value={draft.title}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={50}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor='content'>Content</label>
        <textarea
          id='content'
          name='content'
          rows={8}
          className={css.textarea}
          value={draft.content}
          onChange={handleChange}
          maxLength={500}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor='tag'>Tag</label>
        <select
          id='tag'
          name='tag'
          className={css.select}
          value={draft.tag}
          onChange={handleChange}
          required
        >
          <option value='Work'>Work</option>
          <option value='Personal'>Personal</option>
          <option value='Meeting'>Meeting</option>
          <option value='Shopping'>Shopping</option>
          <option value='Ideas'>Ideas</option>
          <option value='Travel'>Travel</option>
          <option value='Finance'>Finance</option>
          <option value='Health'>Health</option>
          <option value='Important'>Important</option>
          <option value='Todo'>Todo</option>
        </select>
      </div>

      <div className={css.actions}>
        <button type='button' className={css.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button
          type='submit'
          className={css.submitButton}
          disabled={createNoteMutation.isPending || isPending}
        >
          {createNoteMutation.isPending || isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  )
}
