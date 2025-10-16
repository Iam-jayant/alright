import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/auth-server'

export default async function HomePage() {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Redirect based on user role
  const redirectPath = getRedirectPath(user.profile?.role || 'customer')
  redirect(redirectPath)
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