'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers'

export default function UnauthorizedPage() {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
            
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>Need help? Contact support at support@alright.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

