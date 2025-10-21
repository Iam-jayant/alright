'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Bell, 
  Search,
  LogOut,
  User,
  MapPin
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Technicians', href: '/dashboard/technicians', icon: Users },
    { name: 'Live Map', href: '/dashboard/map', icon: MapPin },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Mock user data for development (auth disabled)
  const user = { id: 'dev-user', email: 'manager@alright.dev' }
  const profile = { name: 'Manager User', role: 'manager', phone: '+91 98765 43210' }
  
  const signOut = () => {
    // Mock sign out - just reload the page
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 grid-layout layout-container">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar - Fixed width, no gaps */}
      <div className={`fixed inset-y-0 left-0 z-50 w-48 sm:w-52 lg:w-60 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary-yellow rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">⚡</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Alright</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Flex grow to fill space */}
        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-primary-yellow/10 hover:text-gray-900 transition-colors group"
                  >
                    <Icon className="mr-2.5 h-4 w-4 text-gray-400 group-hover:text-primary-yellow flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{item.name}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User profile section - Fixed at bottom */}
        <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-1.5 text-xs py-1.5 h-8"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main content - Takes remaining space */}
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        {/* Top header - Sticky */}
        <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-2xl font-semibold text-gray-900">Manager Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tickets, technicians..."
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-yellow focus:border-primary-yellow sm:text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profile.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role}</p>
                </div>
                <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-black" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content - Content starts immediately after navbar */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
