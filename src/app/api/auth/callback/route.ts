import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const code = formData.get('code') as string
    
    console.log('OAuth callback received code:', code ? 'Present' : 'Missing')
    
    if (!code) {
      console.error('No code found in callback')
      return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
    }

    const supabase = await createClient()
    
    console.log('Supabase client created, attempting code exchange...')
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('OAuth callback error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        code: error.code
      })
      return NextResponse.redirect(new URL(`/auth/login?error=exchange_failed&details=${encodeURIComponent(error.message)}`, request.url))
    }
    
    console.log('Code exchange successful, session data:', {
      hasSession: !!data.session,
      hasUser: !!data.session?.user,
      userId: data.session?.user?.id
    })

    if (!data.session?.user) {
      return NextResponse.redirect(new URL('/auth/login?error=no_session', request.url))
    }

    // Check if user has a profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single()

    if (!profile) {
      // Create profile for OAuth users
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || data.session.user.email!.split('@')[0],
          role: 'customer', // Default role for OAuth users
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Continue anyway, user can update profile later
      }
    }

    // Redirect based on role
    const userRole = profile?.role || 'customer'
    let redirectPath = '/customer'
    
    switch (userRole) {
      case 'manager':
        redirectPath = '/dashboard'
        break
      case 'technician':
        redirectPath = '/technician'
        break
      case 'customer':
        redirectPath = '/customer'
        break
      default:
        redirectPath = '/dashboard'
    }

    // Set the session cookie and redirect
    const response = NextResponse.redirect(new URL(redirectPath, request.url))
    
    // Set the session cookie
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      
      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }

    return response

  } catch (error) {
    console.error('Unexpected OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=unexpected', request.url))
  }
}
