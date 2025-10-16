import { createClient as createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

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
