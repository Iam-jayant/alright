'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Wrench,
  CheckCircle,
  AlertCircle,
  Navigation
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
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  assigned_technician?: {
    name: string
    phone: string
    skills: string[]
  } | null
}

interface TicketCardProps {
  ticket: Ticket
  onAssign?: (ticketId: string) => void
  onView?: (ticketId: string) => void
  onCall?: (phone: string) => void
  onMessage?: (email: string) => void
}

export function TicketCard({ 
  ticket, 
  onAssign, 
  onView, 
  onCall, 
  onMessage 
}: TicketCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-orange-100 text-orange-800'
      case 'en_route': return 'bg-yellow-100 text-yellow-800'
      case 'arrived': return 'bg-purple-100 text-purple-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'assigned': return <User className="h-4 w-4" />
      case 'en_route': return <Navigation className="h-4 w-4" />
      case 'arrived': return <MapPin className="h-4 w-4" />
      case 'in_progress': return <Wrench className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{ticket.tracking_number}</h3>
              <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">
                  {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                </span>
              </Badge>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">{ticket.customer_name}</h4>
            <p className="text-sm text-gray-600 mb-2">{ticket.category}</p>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(ticket.created_at)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {ticket.description}
        </p>

        {/* Address */}
        <div className="flex items-start space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">{ticket.address}</p>
        </div>

        {/* Customer Contact */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{ticket.customer_phone}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{ticket.customer_email}</span>
          </div>
        </div>

        {/* Assigned Technician */}
        {ticket.assigned_technician && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Assigned Technician
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-1">
              {ticket.assigned_technician.name}
            </p>
            <div className="flex flex-wrap gap-1">
              {ticket.assigned_technician.skills?.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-primary-yellow text-black px-2 py-0.5 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {onView && (
            <Button
              onClick={() => onView(ticket.id)}
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
          )}
          {onAssign && ticket.status === 'pending' && (
            <Button
              onClick={() => onAssign(ticket.id)}
              className="btn-primary"
              size="sm"
            >
              Assign Technician
            </Button>
          )}
          {onCall && (
            <Button
              onClick={() => onCall(ticket.customer_phone)}
              variant="outline"
              size="sm"
            >
              <Phone className="h-4 w-4 mr-1" />
              Call
            </Button>
          )}
          {onMessage && (
            <Button
              onClick={() => onMessage(ticket.customer_email)}
              variant="outline"
              size="sm"
            >
              <Mail className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

