import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/track',
    '/api/webhooks',
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || 
    req.nextUrl.pathname.startsWith(route + '/')
  )

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth pages, redirect to appropriate dashboard
  if (session && (req.nextUrl.pathname.startsWith('/auth/'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const redirectPath = getRedirectPath(profile.role)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // Role-based redirects for root path
  if (session && req.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const redirectPath = getRedirectPath(profile.role)
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  return res
}

function getRedirectPath(role: string): string {
  switch (role) {
    case 'manager':
      return '/dashboard'
    case 'technician':
      return '/technician'
    case 'customer':
      return '/customer'
    default:
      return '/dashboard'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
