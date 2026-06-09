import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getMeServer } from '@/lib/api/serverApi'
import css from './ProfilePage.module.css'

export const metadata: Metadata = {
  title: 'User Profile | NoteHub',
  description: 'View your profile information on NoteHub',
}

// 2. СТОРІНКА Є СЕРВЕРНОЮ (НЕМАЄ 'use client' вгорі)
export default async function ProfilePage() {
  // 3. Завантажуємо дані користувача НА СЕРВЕРІ через менторську функцію
  const user = await getMeServer()

  if (!user) {
    return <p>Loading profile data...</p>
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.title}>My Profile</h1>

        {/* Аватар користувача через next/image */}
        <div className={css.avatarWrapper}>
          <Image
            src={user.avatar || 'https://goit.global'}
            alt={`${user.username || 'User'}'s avatar`}
            width={120}
            height={120}
            className={css.avatar}
            priority
          />
        </div>

        {/* Відображення імені та email */}
        <div className={css.infoGroup}>
          <p className={css.label}>Username:</p>
          <p className={css.value}>{user.username}</p>
        </div>

        <div className={css.infoGroup}>
          <p className={css.label}>Email:</p>
          <p className={css.value}>{user.email}</p>
        </div>

        {/* Посилання на редагування */}
        <div className={css.actions}>
          <Link href='/profile/edit' className={css.editLink}>
            Edit Profile
          </Link>
        </div>
      </div>
    </main>
  )
}
