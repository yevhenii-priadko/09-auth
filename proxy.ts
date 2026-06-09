import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parse } from 'cookie'
import { checkServerSession } from './lib/api/serverApi'

const AUTH_ROUTES = ['/sign-in', '/sign-up']
const PRIVATE_ROUTES = ['/profile', '/notes']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const cookieStore = await cookies()

  // Дістаємо токени із кук
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  // 1. Захист публічних маршрутів від залогінених користувачів (Вимога ментора №1)
  if (accessToken && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const isPrivateRoute = PRIVATE_ROUTES.some(route => pathname.startsWith(route))

  // 2. Перевірка приватної зони (/profile або /notes)
  if (isPrivateRoute) {
    if (!accessToken) {
      // Якщо accessToken немає, але є refreshToken — пробуємо тиху автентифікацію
      if (refreshToken) {
        try {
          const data = await checkServerSession()
          const setCookie = data.headers['set-cookie']

          if (setCookie) {
            const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie]

            for (const cookieStr of cookieArray) {
              const parsed = parse(cookieStr)

              // ІСПРАВЛЕНО: Прибрали зламаний парсинг атрибутів expires/maxAge.
              // Встановлюємо куки через правильний API Next.js, передаючи тільки чисті значення токенів
              if (parsed.accessToken) {
                cookieStore.set('accessToken', parsed.accessToken, { path: '/' })
              }
              if (parsed.refreshToken) {
                cookieStore.set('refreshToken', parsed.refreshToken, { path: '/' })
              }
            }

            // ІСПРАВЛЕНО: Прибрали ручне встановлення headers: { Cookie: ... }.
            // Просто повертаємо NextResponse.next() — Next.js сам збереже куки у відповіді!
            return NextResponse.next()
          }
        } catch (error) {
          // Якщо рефреш-токен застарів або впав — видаляємо куки й кидаємо на логін
          cookieStore.delete('accessToken')
          cookieStore.delete('refreshToken')
          return NextResponse.redirect(new URL('/sign-in', request.url))
        }
      }

      // Взагалі немає токенів — жорсткий редірект на сторінку входу
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Налаштовуємо matcher строго на приватні зони та сторінки входу за ТЗ
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
}
