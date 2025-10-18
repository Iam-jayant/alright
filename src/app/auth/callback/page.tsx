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
          // Exchange code for session with retry logic
          addDebugInfo('Exchanging code for session')
          let exchangeAttempts = 0
          const maxAttempts = 3
          
          while (exchangeAttempts < maxAttempts) {
            try {
              const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
              
              if (exchangeError) {
                addDebugInfo(`Exchange error (attempt ${exchangeAttempts + 1}): ${exchangeError.message}`)
                exchangeAttempts++
                if (exchangeAttempts >= maxAttempts) {
                  setError(`Failed to exchange code after ${maxAttempts} attempts: ${exchangeError.message}`)
                  return
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000))
                continue
              }
              
              addDebugInfo('Code exchange successful')
              break
            } catch (retryError: any) {
              addDebugInfo(`Exchange retry error (attempt ${exchangeAttempts + 1}): ${retryError.message}`)
              exchangeAttempts++
              if (exchangeAttempts >= maxAttempts) {
                setError(`Failed to exchange code after ${maxAttempts} attempts: ${retryError.message}`)
                return
              }
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
        }

        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get current session with retry logic
        addDebugInfo('Getting current session')
        let sessionAttempts = 0
        const maxSessionAttempts = 3
        
        while (sessionAttempts < maxSessionAttempts) {
          try {
            const { data, error } = await supabase.auth.getSession()
            
            if (error) {
              addDebugInfo(`Session error (attempt ${sessionAttempts + 1}): ${error.message}`)
              sessionAttempts++
              if (sessionAttempts >= maxSessionAttempts) {
                setError(`Failed to get session after ${maxSessionAttempts} attempts: ${error.message}`)
                return
              }
              await new Promise(resolve => setTimeout(resolve, 1000))
              continue
            }

            addDebugInfo(`Session data: ${data.session ? 'Present' : 'Missing'}`)
            addDebugInfo(`User: ${data.session?.user ? 'Present' : 'Missing'}`)

            if (data.session?.user) {
              addDebugInfo(`User ID: ${data.session.user.id}`)
              addDebugInfo(`User Email: ${data.session.user.email}`)
              
              // Check if user has a profile with retry logic
              addDebugInfo('Checking for existing profile')
              let profileAttempts = 0
              const maxProfileAttempts = 3
              let profile = null
              
              while (profileAttempts < maxProfileAttempts) {
                try {
                  const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.session.user.id)
                    .single()

                  if (profileError && !profileError.message.includes('PGRST116')) {
                    addDebugInfo(`Profile check error (attempt ${profileAttempts + 1}): ${profileError.message}`)
                    profileAttempts++
                    if (profileAttempts >= maxProfileAttempts) {
                      setError(`Failed to check profile after ${maxProfileAttempts} attempts: ${profileError.message}`)
                      return
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    continue
                  }
                  
                  profile = profileData
                  break
                } catch (profileRetryError: any) {
                  addDebugInfo(`Profile check retry error (attempt ${profileAttempts + 1}): ${profileRetryError.message}`)
                  profileAttempts++
                  if (profileAttempts >= maxProfileAttempts) {
                    setError(`Failed to check profile after ${maxProfileAttempts} attempts: ${profileRetryError.message}`)
                    return
                  }
                  await new Promise(resolve => setTimeout(resolve, 1000))
                }
              }

              if (!profile) {
                addDebugInfo('Creating new profile for OAuth user')
                // Create profile for OAuth users with retry logic
                let createAttempts = 0
                const maxCreateAttempts = 3
                
                while (createAttempts < maxCreateAttempts) {
                  try {
                    const { error: profileError } = await supabase
                      .from('profiles')
                      .insert({
                        id: data.session.user.id,
                        email: data.session.user.email!,
                        name: data.session.user.user_metadata?.full_name || data.session.user.email!.split('@')[0],
                        role: 'customer', // Default role for OAuth users
                      })

                    if (profileError) {
                      addDebugInfo(`Profile creation error (attempt ${createAttempts + 1}): ${profileError.message}`)
                      createAttempts++
                      if (createAttempts >= maxCreateAttempts) {
                        setError(`Failed to create profile after ${maxCreateAttempts} attempts: ${profileError.message}`)
                        return
                      }
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      continue
                    }
                    
                    addDebugInfo('Profile created successfully')
                    break
                  } catch (createRetryError: any) {
                    addDebugInfo(`Profile creation retry error (attempt ${createAttempts + 1}): ${createRetryError.message}`)
                    createAttempts++
                    if (createAttempts >= maxCreateAttempts) {
                      setError(`Failed to create profile after ${maxCreateAttempts} attempts: ${createRetryError.message}`)
                      return
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000))
                  }
                }
              } else {
                addDebugInfo(`Existing profile found with role: ${profile.role}`)
              }

              // Redirect based on role
              const userRole = profile?.role || 'customer'
              const redirectPath = getRedirectPath(userRole)
              addDebugInfo(`Redirecting to: ${redirectPath}`)
              
              // Use window.location.href for more reliable redirect
              setTimeout(() => {
                window.location.href = redirectPath
              }, 2000)
              return
            } else {
              addDebugInfo('No session or user found, redirecting to login')
              setTimeout(() => {
                window.location.href = '/auth/login'
              }, 2000)
              return
            }
          } catch (sessionRetryError: any) {
            addDebugInfo(`Session retry error (attempt ${sessionAttempts + 1}): ${sessionRetryError.message}`)
            sessionAttempts++
            if (sessionAttempts >= maxSessionAttempts) {
              setError(`Failed to get session after ${maxSessionAttempts} attempts: ${sessionRetryError.message}`)
              return
            }
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (error: any) {
        addDebugInfo(`Unexpected error: ${error.message}`)
        setError(`Unexpected error: ${error.message}`)
      }
    }

    // Add a small delay to let the page fully load and avoid extension conflicts
    setTimeout(() => {
      handleAuthCallback()
    }, 1000)
  }, [router, supabase, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {error ? (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900">Authentication Error</h2>
            <p className="text-red-600 text-sm">{error}</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="w-full px-4 py-2 bg-primary-yellow text-black rounded-md hover:bg-primary-yellow/90"
              >
                Back to Login
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Retry
              </button>
            </div>
            <details className="text-left text-xs text-gray-500 mt-4">
              <summary className="cursor-pointer">Debug Information</summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-left">{info}</div>
                ))}
              </div>
            </details>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-yellow" />
            <p className="text-gray-600">Completing sign in...</p>
            <p className="text-xs text-gray-500">This may take a moment due to browser extensions</p>
            <details className="text-left text-xs text-gray-500">
              <summary className="cursor-pointer">Debug Information</summary>
              <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="text-left">{info}</div>
                ))}
              </div>
            </details>
            <div className="mt-4">
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Having trouble? Go back to login
              </button>
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
