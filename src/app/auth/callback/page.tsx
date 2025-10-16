'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (data.session?.user) {
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
            }
          }

          // Redirect based on role
          const userRole = profile?.role || 'customer'
          const redirectPath = getRedirectPath(userRole)
          router.push(redirectPath)
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
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
