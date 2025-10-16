'use client'

import { useAuth } from '@/components/providers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, User, Smartphone } from 'lucide-react'

export default function TechnicianPage() {
  const { user, profile, signOut } = useAuth()

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alright</h1>
              <p className="text-sm text-gray-600">Technician Portal</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                  <p className="text-xs text-gray-500">Technician</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Technician Dashboard</h2>
          <p className="text-gray-600 mt-2">
            Welcome, {profile.name}! This is your mobile-optimized technician portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Mobile Ready</span>
              </CardTitle>
              <CardDescription>Optimized for mobile devices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This dashboard is designed to work seamlessly on mobile devices for technicians in the field.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Phase 3 features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">🔄 Job assignments</p>
                <p className="text-sm">🔄 Location tracking</p>
                <p className="text-sm">🔄 Status updates</p>
                <p className="text-sm">🔄 Geofencing</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
