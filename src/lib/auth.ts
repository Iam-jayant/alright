import { createClient } from '@/lib/supabase-client'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

// Client-side auth helpers
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string, userData: {
  name: string
  role: UserRole
  phone?: string
}) {
  const supabase = createClient()
  
  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { data: null, error: authError }
  }

  // Create profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
    })
    .select()
    .single()

  if (profileError) {
    return { data: null, error: profileError }
  }

  // If user is a technician, create technician record
  if (userData.role === 'technician') {
    await supabase
      .from('technicians')
      .insert({
        user_id: authData.user.id,
        skills: [],
        vehicle_info: {},
        status: 'offline',
      })
  }

  return { data: { user: authData.user, profile: profileData }, error: null }
}

// Server-side auth helpers
export async function getServerUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

// Role-based access control
export function requireRole(requiredRole: UserRole) {
  return async function() {
    const user = await getServerUser()
    
    if (!user || !user.profile) {
      redirect('/auth/login')
    }

    if (user.profile.role !== requiredRole) {
      redirect('/unauthorized')
    }

    return user
  }
}

export function requireAuth() {
  return async function() {
    const user = await getServerUser()
    
    if (!user || !user.profile) {
      redirect('/auth/login')
    }

    return user
  }
}

// Redirect based on user role
export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'manager':
      return '/dashboard'
    case 'technician':
      return '/technician'
    case 'customer':
      return '/customer'
    default:
      return '/'
  }
}

// Check if user has permission
export function hasPermission(userRole: UserRole, action: string): boolean {
  const permissions = {
    manager: [
      'view_all_tickets',
      'create_tickets',
      'update_tickets',
      'delete_tickets',
      'assign_technicians',
      'view_all_technicians',
      'view_analytics',
      'manage_settings',
    ],
    technician: [
      'view_assigned_tickets',
      'update_assignment_status',
      'update_location',
      'view_own_profile',
      'update_own_profile',
    ],
    customer: [
      'create_tickets',
      'view_own_tickets',
      'track_tickets',
      'rate_technicians',
      'view_own_profile',
      'update_own_profile',
    ],
  }

  return permissions[userRole]?.includes(action) || false
}

// Auth middleware for API routes
export async function withAuth(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Add user to request context
    req.user = user
    return handler(req, ...args)
  }
}

// Role-based middleware for API routes
export function withRole(requiredRole: UserRole) {
  return async (handler: Function) => {
    return async (req: Request, ...args: any[]) => {
      const supabase = await createServerClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== requiredRole) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Add user and profile to request context
      req.user = user
      req.profile = profile
      return handler(req, ...args)
    }
  }
}
