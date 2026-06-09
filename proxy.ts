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

  // Якщо користувач ВЖЕ залогінений (має діючий accessToken) і намагається зайти на /sign-in чи /sign-up
  if (accessToken && AUTH_ROUTES.includes(pathname)) {
    // Жорстко перенаправляємо його на головну сторінку за ТЗ
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Службові запити Next.js та API пропускаємо без перевірок приватних зон
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const isPrivateRoute = PRIVATE_ROUTES.some(route => pathname.startsWith(route))

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
