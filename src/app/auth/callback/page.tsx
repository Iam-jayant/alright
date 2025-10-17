'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    console.log('Auth Callback Debug:', info)
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`])
  }

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        addDebugInfo('Starting auth callback process')
        
        // Get the code from URL parameters
        const code = searchParams.get('code')
        addDebugInfo(`Code parameter: ${code ? 'Present' : 'Missing'}`)
        
        if (code) {
          // Exchange code for session
          addDebugInfo('Exchanging code for session')
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            addDebugInfo(`Exchange error: ${exchangeError.message}`)
            setError(`Exchange error: ${exchangeError.message}`)
            return
          }
          
          addDebugInfo('Code exchange successful')
        }

        // Get current session
        addDebugInfo('Getting current session')
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          addDebugInfo(`Session error: ${error.message}`)
          setError(`Session error: ${error.message}`)
          return
        }

        addDebugInfo(`Session data: ${data.session ? 'Present' : 'Missing'}`)
        addDebugInfo(`User: ${data.session?.user ? 'Present' : 'Missing'}`)

        if (data.session?.user) {
          addDebugInfo(`User ID: ${data.session.user.id}`)
          addDebugInfo(`User Email: ${data.session.user.email}`)
          
          // Check if user has a profile
          addDebugInfo('Checking for existing profile')
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError) {
            addDebugInfo(`Profile check error: ${profileError.message}`)
          }

          if (!profile) {
            addDebugInfo('Creating new profile for OAuth user')
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
              addDebugInfo(`Profile creation error: ${profileError.message}`)
              setError(`Profile creation error: ${profileError.message}`)
              return
            }
            addDebugInfo('Profile created successfully')
          } else {
            addDebugInfo(`Existing profile found with role: ${profile.role}`)
          }

          // Redirect based on role
          const userRole = profile?.role || 'customer'
          const redirectPath = getRedirectPath(userRole)
          addDebugInfo(`Redirecting to: ${redirectPath}`)
          
          // Add a small delay to ensure the redirect is visible
          setTimeout(() => {
            router.push(redirectPath)
          }, 1000)
        } else {
          addDebugInfo('No session or user found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (error: any) {
        addDebugInfo(`Unexpected error: ${error.message}`)
        setError(`Unexpected error: ${error.message}`)
      }
    }

    handleAuthCallback()
  }, [router, supabase, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Authentication Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-primary-yellow text-black rounded-md hover:bg-primary-yellow/90"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-yellow" />
            <p className="text-gray-600">Completing sign in...</p>
            <div className="text-xs text-gray-500 space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-left">{info}</div>
              ))}
            </div>
          </div>
        )}
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
