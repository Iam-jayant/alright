'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AssignmentModal from '@/components/modals/assignment-modal'
import RealtimeNotification from '@/components/notifications/realtime-notification'
import TechnicianStatus from '@/components/live/technician-status'
import { useRealtimeSubscriptions } from '@/hooks/use-realtime-subscriptions'
// import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  TrendingUp,
  Plus,
  Loader2,
  Search,
  Phone,
  MessageSquare
} from 'lucide-react'

export default function DashboardPage() {
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [notifications, setNotifications] = useState<any[]>([])

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const handleClearAll = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const addNotification = (type: string, title: string, message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [notification, ...prev])
  }

  // Real-time subscriptions
  useRealtimeSubscriptions({
    onTicketUpdate: (payload) => {
      console.log('Ticket update received:', payload)
      setLastUpdate(new Date())
      
      if (payload.eventType === 'INSERT') {
        // New ticket added
        setTickets(prev => [payload.new, ...prev])
        addNotification(
          'ticket_created',
          'New Ticket Created',
          `Ticket #${payload.new.tracking_number} has been created`
        )
      } else if (payload.eventType === 'UPDATE') {
        // Ticket updated
        setTickets(prev => prev.map(ticket => 
          ticket.id === payload.new.id ? payload.new : ticket
        ))
        
        // Add notification for status changes
        if (payload.old.status !== payload.new.status) {
          addNotification(
            'ticket_updated',
            'Ticket Status Updated',
            `Ticket #${payload.new.tracking_number} status changed to ${payload.new.status}`
          )
        }
      } else if (payload.eventType === 'DELETE') {
        // Ticket deleted
        setTickets(prev => prev.filter(ticket => ticket.id !== payload.old.id))
      }
    },
    onTechnicianUpdate: (payload) => {
      console.log('Technician update received:', payload)
      setLastUpdate(new Date())
      
      if (payload.eventType === 'UPDATE') {
        // Technician location or status updated
        setTechnicians(prev => prev.map(tech => 
          tech.user_id === payload.new.user_id ? payload.new : tech
        ))
        
        // Add notification for status changes
        if (payload.old.status !== payload.new.status) {
          addNotification(
            'technician_arrived',
            'Technician Status Updated',
            `${payload.new.profiles?.name} is now ${payload.new.status}`
          )
        }
      }
    },
    onAssignmentUpdate: (payload) => {
      console.log('Assignment update received:', payload)
      setLastUpdate(new Date())
      
      if (payload.eventType === 'INSERT') {
        // New assignment created
        setTickets(prev => prev.map(ticket => 
          ticket.id === payload.new.ticket_id 
            ? { ...ticket, status: 'assigned' }
            : ticket
        ))
        
        addNotification(
          'technician_assigned',
          'Technician Assigned',
          `A technician has been assigned to ticket #${payload.new.ticket_id}`
        )
      }
    },
    onLocationUpdate: (payload) => {
      console.log('Location update received:', payload)
      setLastUpdate(new Date())
      
      // Update technician location
      setTechnicians(prev => prev.map(tech => 
        tech.user_id === payload.new.technician_id 
          ? { 
              ...tech, 
              current_lat: payload.new.lat, 
              current_lng: payload.new.lng 
            }
          : tech
      ))
    }
  })

  // Mock data for development (auth disabled)
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

  const handleAssignTechnician = (ticket: any) => {
    setSelectedTicket(ticket)
    setAssignmentModalOpen(true)
  }

  const handleAssignmentComplete = (technicianId: string) => {
    console.log(`Assigning technician ${technicianId} to ticket ${selectedTicket?.id}`)
    // In a real app, this would call the API to create the assignment
    setAssignmentModalOpen(false)
    setSelectedTicket(null)
  }

  // Removed loading and error states for development

  return (
    <DashboardLayout>
      <div className="p-2 sm:p-3 lg:p-4 min-h-full w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Monitor your field service operations in real-time</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <RealtimeNotification
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAll}
              />
              
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              <div className="text-xs text-gray-400">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Fluid responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 w-full">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600 truncate">{stat.name}</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
                      <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-yellow" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search and Add Task Bar */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Ticket Number or Customer Details"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow text-sm"
                />
              </div>
            </div>
            <Button className="btn-primary px-3 py-2 w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Main Content Grid - Fluid responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3 sm:gap-4 lg:gap-6 w-full">
          {/* Tickets List */}
          <div className="min-w-0">
            <div className="space-y-4">
              {recentTickets.map((ticket, index) => (
                <Card key={ticket.id} className={`hover:shadow-lg transition-all duration-200 ${index === 0 ? 'ring-2 ring-primary-yellow bg-yellow-50/30' : ''}`}>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    {/* Header with ID and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">📦</span>
                          </div>
                          <span className="font-bold text-base sm:text-lg text-gray-900">#{ticket.id}</span>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status === 'assigned' ? 'On The Way' : 
                           ticket.status === 'pending' ? 'Technician Assigned' :
                           ticket.status === 'completed' ? 'Completed' : ticket.status}
                        </span>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500">Estimated Time</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">03:50 PM</p>
                        <p className="text-xs text-gray-500">Dec 12, 2023</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary-yellow rounded-full"></div>
                          <span className="text-xs sm:text-sm text-gray-600">Start</span>
                        </div>
                        <div className="flex-1 mx-2 sm:mx-4">
                          <div className="h-0.5 bg-gray-200 relative">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-primary-yellow rounded-full flex items-center justify-center">
                              <span className="text-xs">🏍️</span>
                            </div>
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                          <span className="text-xs sm:text-sm text-gray-600">End</span>
                        </div>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">From</p>
                        <p className="text-xs sm:text-sm text-gray-600">206 Beach Blvd, Nagpur, MH, 440001</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">To</p>
                        <p className="text-xs sm:text-sm text-gray-600">{ticket.address}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-xs sm:text-sm">
                            {ticket.customer.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base text-gray-900">{ticket.customer}</p>
                          <p className="text-xs sm:text-sm text-gray-500">Customer</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="w-8 h-8 sm:w-10 sm:h-10 p-0">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="w-8 h-8 sm:w-10 sm:h-10 p-0">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Service Type</p>
                        <p className="text-xs sm:text-sm text-gray-600">{ticket.service}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Priority</p>
                        <span className={`text-xs sm:text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Status</p>
                        <p className="text-xs sm:text-sm text-gray-600">{ticket.time}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {ticket.status === 'pending' && (
                        <Button 
                          onClick={() => handleAssignTechnician(ticket)}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Assign Technician
                        </Button>
                      )}
                      {ticket.status === 'assigned' && (
                        <Button 
                          onClick={() => handleAssignTechnician(ticket)}
                          variant="outline" 
                          className="text-xs px-3 py-1.5"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Reassign
                        </Button>
                      )}
                      <Button variant="outline" className="text-xs px-3 py-1.5">
                        <MapPin className="h-3 w-3 mr-1" />
                        View on Map
                      </Button>
                      <Button variant="outline" className="text-xs px-3 py-1.5">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
            {/* Live Technician Status */}
            <TechnicianStatus technicians={technicians} />
            
            {/* Service Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Service Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Tracking number</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-xs sm:text-sm">#TKT-NAG-001</span>
                    <Button variant="outline" size="sm" className="w-5 h-5 sm:w-6 sm:h-6 p-0">
                      <span className="text-xs">📋</span>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Customer Name</span>
                  <span className="font-medium text-xs sm:text-sm">Rajesh Kumar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Service Type</span>
                  <span className="font-medium text-xs sm:text-sm">AC Repair</span>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Rating Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Skills & Rating</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-xs sm:text-sm">AS</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-gray-900">Amit Singh</p>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs sm:text-sm text-gray-500">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <Button variant="outline" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-6 h-6 sm:w-8 sm:h-8 p-0">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {['AC Repair', 'Electrical', 'Plumbing'].map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-primary-yellow/20 text-primary-yellow text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">4.5</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm sm:text-base">★</span>
                      ))}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">2,256,896</span>
                  </div>
                  
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 w-3 sm:w-4">{rating}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-primary-yellow h-1 rounded-full" 
                            style={{ width: `${rating === 5 ? '80' : rating === 4 ? '15' : '5'}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600">"Excellent Service"</p>
                  <p className="text-xs text-gray-500">- Mr. Hasan</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                    <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 40 * 0.4}`} strokeDashoffset="0"/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 40 * 0.3}`} strokeDashoffset={`-${2 * Math.PI * 40 * 0.4}`}/>
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" 
                              strokeDasharray={`${2 * Math.PI * 40 * 0.3}`} strokeDashoffset={`-${2 * Math.PI * 40 * 0.7}`}/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm sm:text-lg font-bold text-gray-900">24</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">40%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-600">Tasks Assigned</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                      <span className="text-xs sm:text-sm text-gray-600">Completed</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium">30%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assignment Modal */}
        <AssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          ticket={selectedTicket}
          onAssign={handleAssignmentComplete}
        />
      </div>
    </DashboardLayout>
  )
}
