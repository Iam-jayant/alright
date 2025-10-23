'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Settings
} from 'lucide-react'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false })

interface Ticket {
  id: string
  tracking_number: string
  customer_name: string
  address: string
  lat: number
  lng: number
  category: string
  priority: string
  status: string
  created_at: string
  assigned_technician?: {
    name: string
    current_lat?: number
    current_lng?: number
  }
}

interface Technician {
  user_id: string
  profiles?: {
    name: string
  }
  current_lat?: number
  current_lng?: number
  status: string
  skills: string[]
  vehicle_type: string
}

interface LiveMapProps {
  tickets: Ticket[]
  technicians: Technician[]
  onTicketClick?: (ticket: Ticket) => void
  onTechnicianClick?: (technician: Technician) => void
  className?: string
}

// Custom marker components
const TicketMarker = ({ ticket, onClick }: { ticket: Ticket; onClick?: () => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6B7280' // gray
      case 'assigned': return '#3B82F6' // blue
      case 'en_route': return '#F59E0B' // yellow
      case 'arrived': return '#8B5CF6' // purple
      case 'in_progress': return '#F97316' // orange
      case 'completed': return '#10B981' // green
      default: return '#6B7280'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟠'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="relative">
      <div
        className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: getStatusColor(ticket.status) }}
        onClick={onClick}
      >
        <span className="text-white text-xs font-bold">T</span>
      </div>
      <div className="absolute -top-1 -right-1 text-xs">
        {getPriorityIcon(ticket.priority)}
      </div>
    </div>
  )
}

const TechnicianMarker = ({ technician, onClick }: { technician: Technician; onClick?: () => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981' // green
      case 'busy': return '#F59E0B' // yellow
      case 'offline': return '#6B7280' // gray
      default: return '#6B7280'
    }
  }

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'bike': return '🏍️'
      case 'scooter': return '🛵'
      case 'van': return '🚐'
      case 'car': return '🚗'
      default: return '🚗'
    }
  }

  return (
    <div className="relative">
      <div
        className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: getStatusColor(technician.status) }}
        onClick={onClick}
      >
        <span className="text-white text-sm font-bold">T</span>
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-lg">
        {getVehicleIcon(technician.vehicle_type)}
      </div>
    </div>
  )
}

// Map controls component
const MapControls = ({ 
  isFullscreen, 
  onToggleFullscreen, 
  onRefresh, 
  onSettings 
}: {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onRefresh: () => void
  onSettings: () => void
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="bg-white shadow-md"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFullscreen}
        className="bg-white shadow-md"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSettings}
        className="bg-white shadow-md"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Legend component
const MapLegend = () => {
  const legendItems = [
    { status: 'pending', label: 'Pending', color: '#6B7280' },
    { status: 'assigned', label: 'Assigned', color: '#3B82F6' },
    { status: 'en_route', label: 'En Route', color: '#F59E0B' },
    { status: 'arrived', label: 'Arrived', color: '#8B5CF6' },
    { status: 'in_progress', label: 'In Progress', color: '#F97316' },
    { status: 'completed', label: 'Completed', color: '#10B981' }
  ]

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-md p-4">
      <h4 className="font-semibold text-sm text-gray-900 mb-2">Ticket Status</h4>
      <div className="space-y-1">
        {legendItems.map((item) => (
          <div key={item.status} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LiveMap({ 
  tickets, 
  technicians, 
  onTicketClick, 
  onTechnicianClick,
  className = ''
}: LiveMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [mapKey, setMapKey] = useState(0)

  // Default center to Nagpur, India
  const defaultCenter: [number, number] = [21.1458, 79.0882]
  const defaultZoom = 12

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleRefresh = () => {
    setMapKey(prev => prev + 1)
  }

  const handleSettings = () => {
    // TODO: Implement map settings
    console.log('Map settings clicked')
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    onTicketClick?.(ticket)
  }

  const handleTechnicianClick = (technician: Technician) => {
    setSelectedTechnician(technician)
    onTechnicianClick?.(technician)
  }

  // Calculate routes for assigned tickets
  const routes = tickets
    .filter(ticket => ticket.assigned_technician?.current_lat && ticket.assigned_technician?.current_lng)
    .map(ticket => ({
      id: ticket.id,
      from: [ticket.assigned_technician!.current_lat!, ticket.assigned_technician!.current_lng!] as [number, number],
      to: [ticket.lat, ticket.lng] as [number, number]
    }))

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <Card className={isFullscreen ? 'h-screen' : 'h-96'}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary-yellow" />
              <span>Live Map View</span>
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {tickets.length} Tickets
              </Badge>
              <Badge variant="outline" className="text-xs">
                {technicians.filter(t => t.current_lat && t.current_lng).length} Technicians
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div className="relative h-full">
            <MapContainer
              key={mapKey}
              center={defaultCenter}
              zoom={defaultZoom}
              className="h-full w-full"
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Ticket Markers */}
              {tickets.map((ticket) => (
                <Marker
                  key={`ticket-${ticket.id}`}
                  position={[ticket.lat, ticket.lng]}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold text-sm">{ticket.tracking_number}</h4>
                      <p className="text-xs text-gray-600">{ticket.customer_name}</p>
                      <p className="text-xs text-gray-500">{ticket.category}</p>
                      <Badge className={`text-xs mt-1 ${ticket.status === 'pending' ? 'bg-gray-100 text-gray-800' : 
                        ticket.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'en_route' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'arrived' ? 'bg-purple-100 text-purple-800' :
                        ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Technician Markers */}
              {technicians
                .filter(tech => tech.current_lat && tech.current_lng)
                .map((technician) => (
                  <Marker
                    key={`tech-${technician.user_id}`}
                    position={[technician.current_lat!, technician.current_lng!]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-semibold text-sm">{technician.profiles?.name}</h4>
                        <p className="text-xs text-gray-600">{technician.vehicle_type}</p>
                        <Badge className={`text-xs mt-1 ${technician.status === 'available' ? 'bg-green-100 text-green-800' :
                          technician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                          {technician.status}
                        </Badge>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              {/* Routes */}
              {routes.map((route) => (
                <Polyline
                  key={`route-${route.id}`}
                  positions={[route.from, route.to]}
                  color="#FFD12D"
                  weight={3}
                  opacity={0.7}
                />
              ))}
            </MapContainer>

            {/* Map Controls */}
            <MapControls
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              onRefresh={handleRefresh}
              onSettings={handleSettings}
            />

            {/* Legend */}
            <MapLegend />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
