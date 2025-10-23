import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function middleware(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  const { pathname } = req.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/complaint',
    '/track',
    '/auth/login',
    '/auth/signup',
    '/auth/callback'
  ]
  
  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    // Redirect root to landing page
    if (pathname === '/') {
      return NextResponse.next()
    }
    return NextResponse.next()
  }
  
  // If no user and trying to access protected route, redirect to login
  if (!user || error) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  
  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  
  // Role-based redirects
  const role = profile.role
  
  // Manager routes
  if (pathname.startsWith('/dashboard') && role !== 'manager') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  // Technician routes
  if (pathname.startsWith('/technician') && role !== 'technician') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  // Customer routes
  if (pathname.startsWith('/customer') && role !== 'customer') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  // Redirect based on role if accessing root dashboard
  if (pathname === '/dashboard' && role !== 'manager') {
    if (role === 'technician') {
      return NextResponse.redirect(new URL('/technician', req.url))
    } else if (role === 'customer') {
      return NextResponse.redirect(new URL('/customer', req.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
