'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import LiveMap from '@/components/map/live-map'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Filter,
  Settings
} from 'lucide-react'

export default function MapPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    showRoutes: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch tickets
      const ticketsResponse = await fetch('/api/tickets')
      const ticketsData = await ticketsResponse.json()
      setTickets(ticketsData.tickets || [])

      // Fetch technicians
      const techniciansResponse = await fetch('/api/technicians')
      const techniciansData = await techniciansResponse.json()
      setTechnicians(techniciansData.technicians || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket)
    setSelectedTechnician(null)
  }

  const handleTechnicianClick = (technician: any) => {
    setSelectedTechnician(technician)
    setSelectedTicket(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'en_route': return 'bg-yellow-100 text-yellow-800'
      case 'arrived': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status !== 'all' && ticket.status !== filters.status) return false
    if (filters.priority !== 'all' && ticket.priority !== filters.priority) return false
    return true
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-yellow mx-auto mb-4" />
            <p className="text-gray-600">Loading map data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Map View</h1>
              <p className="text-gray-600">Monitor tickets and technicians in real-time</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map */}
          <div className="lg:col-span-3">
            <LiveMap
              tickets={filteredTickets}
              technicians={technicians}
              onTicketClick={handleTicketClick}
              onTechnicianClick={handleTechnicianClick}
              className="h-full"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Ticket Details */}
            {selectedTicket && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selected Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedTicket.tracking_number}</p>
                    <p className="text-sm text-gray-600">{selectedTicket.customer_name}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </Badge>
                    <span className={`text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="text-sm text-gray-900">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-900">{selectedTicket.address}</p>
                  </div>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Selected Technician Details */}
            {selectedTechnician && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selected Technician</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedTechnician.profiles?.name}</p>
                    <p className="text-sm text-gray-600">{selectedTechnician.vehicle_type}</p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(selectedTechnician.status)}`}>
                    {selectedTechnician.status}
                  </Badge>
                  <div>
                    <p className="text-xs text-gray-500">Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTechnician.skills?.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Map Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Map Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Tickets</span>
                  <span className="text-sm font-medium">{tickets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Technicians</span>
                  <span className="text-sm font-medium">
                    {technicians.filter(t => t.current_lat && t.current_lng).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Tickets</span>
                  <span className="text-sm font-medium">
                    {tickets.filter(t => t.status === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Center on Tickets
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Center on Technicians
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Show Routes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
