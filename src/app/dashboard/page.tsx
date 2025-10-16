'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  TrendingUp,
  Plus
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for dashboard overview
  const stats = [
    { name: 'Total Tickets', value: '24', change: '+4.75%', changeType: 'positive', icon: Ticket },
    { name: 'Active Technicians', value: '8', change: '+2', changeType: 'positive', icon: Users },
    { name: 'Pending Assignments', value: '5', change: '-1', changeType: 'negative', icon: Clock },
    { name: 'Completed Today', value: '12', change: '+8.2%', changeType: 'positive', icon: CheckCircle },
  ]

  const recentTickets = [
    {
      id: 'TKT-NAG-001',
      customer: 'Rajesh Kumar',
      service: 'AC Repair',
      address: '206 Beach Blvd, Nagpur',
      status: 'assigned',
      priority: 'high',
      assignedTo: 'Amit Singh',
      time: '2 hours ago'
    },
    {
      id: 'TKT-NAG-002',
      customer: 'Priya Sharma',
      service: 'Plumbing',
      address: '102 Collins Ave, Nagpur',
      status: 'pending',
      priority: 'medium',
      assignedTo: null,
      time: '4 hours ago'
    },
    {
      id: 'TKT-NAG-003',
      customer: 'Vikram Patel',
      service: 'Electrical',
      address: '45 MG Road, Nagpur',
      status: 'completed',
      priority: 'low',
      assignedTo: 'Suresh Yadav',
      time: '6 hours ago'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-status-assigned text-white'
      case 'pending': return 'bg-status-pending text-white'
      case 'completed': return 'bg-status-completed text-white'
      case 'on-the-way': return 'bg-status-on-the-way text-black'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Monitor your field service operations in real-time</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-yellow/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary-yellow" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Tickets</CardTitle>
                  <CardDescription>Latest service requests and their status</CardDescription>
                </div>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">{ticket.id}</span>
                          <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{ticket.customer} • {ticket.service}</p>
                          <p className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {ticket.address}
                          </p>
                          {ticket.assignedTo && (
                            <p className="mt-1">Assigned to: <span className="font-medium">{ticket.assignedTo}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{ticket.time}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Map Preview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Ticket
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Technicians
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Auto-Assign Toggle
                </Button>
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Live Map</CardTitle>
                <CardDescription>Real-time technician locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Map integration coming soon</p>
                    <p className="text-xs text-gray-400">React-Leaflet + OpenStreetMap</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
