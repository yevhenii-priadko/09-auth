import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parse } from 'cookie'
import { checkServerSession } from './lib/api/serverApi'

// Приватні маршрути, які вимагають залогіненого користувача за ТЗ
const privateRoutes = ['/profile', '/notes']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 🔴 ГОЛОВНИЙ РЯТІВНИЙ ЗАПОБІЖНИК:
  // Якщо користувач знаходиться на сторінках входу/реєстрації або робить службові запити Next.js,
  // ми ВЗАГАЛІ не перевіряємо токени й просто пропускаємо запит! Це повністю знищує цикл.
  if (
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route))

  // Якщо користувач намагається зайти в приватну зону (/profile або /notes)
  if (isPrivateRoute) {
    if (!accessToken) {
      // Якщо accessToken немає, але є refreshToken — пробуємо тиху автентифікацію з конспекту
      if (refreshToken) {
        try {
          const data = await checkServerSession()
          const setCookie = data.headers['set-cookie']

          if (setCookie) {
            const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie]
            for (const cookieStr of cookieArray) {
              const parsed = parse(cookieStr)
              const options = {
                expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
                path: parsed.Path,
                maxAge: Number(parsed['Max-Age']),
              }
              if (parsed.accessToken) cookieStore.set('accessToken', parsed.accessToken, options)
              if (parsed.refreshToken) cookieStore.set('refreshToken', parsed.refreshToken, options)
            }

            // Успішно оновили токени — пропускаємо в приватну зону
            return NextResponse.next({
              headers: { Cookie: cookieStore.toString() },
            })
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

  // Для всіх інших публічних сторінок — просто даємо зелене світло
  return NextResponse.next()
}

export const config = {
  // Налаштовуємо matcher строго на приватні зони та сторінки входу за ТЗ
  matcher: ['/profile/:path*', '/notes/:path*', '/sign-in', '/sign-up'],
}
