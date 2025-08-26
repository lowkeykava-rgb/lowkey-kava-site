import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is signed in and the current path is / redirect the user to /menu
  // But don't redirect if they're coming from auth callback
  if (user && request.nextUrl.pathname === '/' && !request.nextUrl.searchParams.has('code')) {
    return NextResponse.redirect(new URL('/menu', request.url))
  }

  // If user is not signed in and trying to access protected routes
  // redirect the user to /login
  if (!user && ['/menu', '/checkout', '/order', '/subscriptions', '/account', '/admin'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  )) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Allow access to public routes for unauthenticated users
  // This includes: /, /login, /signup, /invite, /auth/callback

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (handled separately)
     * - api routes (handled separately)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
