'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase-client'
import { Loader2, User, Wrench, Users } from 'lucide-react'

export default function DevLoginPage() {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'manager' | 'technician' | 'customer'>('manager')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDevLogin = async () => {
    try {
      setLoading(true)

      // Generate a unique email if not provided
      const devEmail = email || `${selectedRole}@alright.dev`
      const devName = name || `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} User`

      // Sign in with a test account (this will create the user if it doesn't exist)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: 'password123'
      })

      if (authError && authError.message.includes('Invalid login credentials')) {
        // User doesn't exist, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: devEmail,
          password: 'password123',
          options: {
            data: {
              name: devName,
              role: selectedRole
            }
          }
        })

        if (signUpError) {
          console.error('Sign up error:', signUpError)
          return
        }

        // Create profile
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              name: devName,
              email: devEmail,
              role: selectedRole,
              phone: '+91 98765 43210'
            })

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          // Create technician profile if role is technician
          if (selectedRole === 'technician') {
            const { error: techError } = await supabase
              .from('technicians')
              .insert({
                user_id: signUpData.user.id,
                skills: ['AC Repair', 'Electrical', 'Plumbing'],
                vehicle_type: 'bike',
                vehicle_model: 'Honda Activa',
                vehicle_plate: 'MH-31-AB-1234',
                status: 'available',
                current_lat: 21.1458,
                current_lng: 79.0882
              })

            if (techError) {
              console.error('Technician creation error:', techError)
            }
          }
        }
      }

      // Redirect based on role
      switch (selectedRole) {
        case 'manager':
          router.push('/dashboard')
          break
        case 'technician':
          router.push('/technician')
          break
        case 'customer':
          router.push('/customer')
          break
      }
    } catch (error) {
      console.error('Dev login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSampleData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/seed', { method: 'POST' })
      const result = await response.json()
      console.log('Sample data created:', result)
      alert('Sample data created successfully!')
    } catch (error) {
      console.error('Error creating sample data:', error)
      alert('Error creating sample data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary-yellow rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">⚡</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Alright</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Development Login</h1>
          <p className="text-gray-600 mt-2">Quick access to different dashboards for testing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Role & Login</CardTitle>
            <CardDescription>Choose a role to access the corresponding dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Manager Dashboard</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="technician">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4" />
                      <span>Technician Portal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="customer">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Customer Portal</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                placeholder={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} User`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder={`${selectedRole}@alright.dev`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Login Button */}
            <Button
              onClick={handleDevLogin}
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Development Tools</span>
              </div>
            </div>

            {/* Sample Data Button */}
            <Button
              onClick={createSampleData}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Sample Data
            </Button>

            {/* Info */}
            <div className="text-xs text-gray-500 text-center">
              <p>This creates test users and sample data for development.</p>
              <p>Default password: <code className="bg-gray-100 px-1 rounded">password123</code></p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRole('manager')
              handleDevLogin()
            }}
            disabled={loading}
          >
            Manager
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRole('technician')
              handleDevLogin()
            }}
            disabled={loading}
          >
            Technician
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRole('customer')
              handleDevLogin()
            }}
            disabled={loading}
          >
            Customer
          </Button>
        </div>
      </div>
    </div>
  )
}
