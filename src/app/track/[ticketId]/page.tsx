'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Wrench, 
  CheckCircle, 
  AlertCircle,
  Navigation,
  Star,
  Loader2
} from 'lucide-react'

interface Ticket {
  id: string
  tracking_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  lat: number
  lng: number
  category: string
  description: string
  priority: string
  status: string
  created_at: string
  estimated_time?: string
  assigned_technician?: {
    name: string
    phone: string
    skills: string[]
    vehicle_type: string
    vehicle_model: string
    current_lat?: number
    current_lng?: number
    status: string
  }
}

const statusTimeline = [
  { key: 'pending', label: 'Request Submitted', icon: AlertCircle, color: 'bg-gray-500' },
  { key: 'assigned', label: 'Technician Assigned', icon: User, color: 'bg-blue-500' },
  { key: 'en_route', label: 'Technician En Route', icon: Navigation, color: 'bg-yellow-500' },
  { key: 'arrived', label: 'Technician Arrived', icon: MapPin, color: 'bg-purple-500' },
  { key: 'in_progress', label: 'Work In Progress', icon: Wrench, color: 'bg-orange-500' },
  { key: 'completed', label: 'Work Completed', icon: CheckCircle, color: 'bg-green-500' }
]

export default function TrackPage() {
  const params = useParams()
  const ticketId = params.ticketId as string
  
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eta, setEta] = useState<string | null>(null)

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error('Ticket not found')
      }
      const data = await response.json()
      setTicket(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket')
    } finally {
      setLoading(false)
    }
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

  const getCurrentStatusIndex = (status: string) => {
    return statusTimeline.findIndex(item => item.key === status)
  }

  const calculateETA = (technicianLat?: number, technicianLng?: number, jobLat?: number, jobLng?: number) => {
    if (!technicianLat || !technicianLng || !jobLat || !jobLng) return null
    
    // Simple distance calculation (Haversine formula)
    const R = 6371 // Earth's radius in kilometers
    const dLat = (jobLat - technicianLat) * Math.PI / 180
    const dLon = (jobLng - technicianLng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(technicianLat * Math.PI / 180) * Math.cos(jobLat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    // Assuming average speed of 30 km/h in city traffic
    const etaMinutes = Math.round((distance / 30) * 60)
    return etaMinutes > 60 ? `${Math.round(etaMinutes / 60)}h ${etaMinutes % 60}m` : `${etaMinutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-yellow mx-auto mb-4" />
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || 'The ticket you are looking for does not exist or has been removed.'}
            </p>
            <Button onClick={() => window.location.href = '/complaint'} className="btn-primary">
              Submit New Request
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStatusIndex = getCurrentStatusIndex(ticket.status)
  const etaValue = calculateETA(
    ticket.assigned_technician?.current_lat,
    ticket.assigned_technician?.current_lng,
    ticket.lat,
    ticket.lng
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-yellow rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Alright</h1>
                <p className="text-gray-600">Track Your Service Request</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-mono font-bold text-lg">{ticket.tracking_number}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Service Status</span>
              <Badge className={`${getStatusColor(ticket.status)}`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Status Timeline */}
            <div className="flex items-center justify-between mb-6">
              {statusTimeline.map((status, index) => {
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex
                const Icon = status.icon
                
                return (
                  <div key={status.key} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? status.color : 'bg-gray-200'
                    } ${isCurrent ? 'ring-4 ring-primary-yellow ring-opacity-50' : ''}`}>
                      <Icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-xs text-center ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {status.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* ETA Display */}
            {ticket.status === 'en_route' && etaValue && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Estimated arrival: {etaValue}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Service Type</p>
                <p className="text-sm text-gray-600">{ticket.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Priority</p>
                <p className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Description</p>
                <p className="text-sm text-gray-600">{ticket.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-sm text-gray-600 flex items-start">
                  <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  {ticket.address}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Requested On</p>
                <p className="text-sm text-gray-600">
                  {new Date(ticket.created_at).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technician Details */}
          {ticket.assigned_technician ? (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Technician</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                    <span className="text-black font-bold">
                      {ticket.assigned_technician.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ticket.assigned_technician.name}</p>
                    <Badge className={`text-xs ${getStatusColor(ticket.assigned_technician.status)}`}>
                      {ticket.assigned_technician.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{ticket.assigned_technician.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {ticket.assigned_technician.vehicle_type} - {ticket.assigned_technician.vehicle_model}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {ticket.assigned_technician.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Technician Assigned</h3>
                <p className="text-sm text-gray-600">
                  We're working on finding the right technician for your service request.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/complaint'}
            variant="outline"
            className="mr-4"
          >
            Submit Another Request
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  )
}
