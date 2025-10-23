'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Wrench, CheckCircle, AlertCircle } from 'lucide-react'

interface Technician {
  user_id: string
  profiles?: {
    name: string
    email: string
  }
  skills: string[]
  status: 'available' | 'busy' | 'offline'
  current_lat?: number
  current_lng?: number
  vehicle_type: string
  vehicle_model: string
  updated_at: string
}

interface TechnicianStatusProps {
  technicians: Technician[]
}

export default function TechnicianStatus({ technicians }: TechnicianStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'busy': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'offline': return <AlertCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
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

  const formatLastSeen = (updatedAt: string) => {
    const now = new Date()
    const updated = new Date(updatedAt)
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const availableCount = technicians.filter(t => t.status === 'available').length
  const busyCount = technicians.filter(t => t.status === 'busy').length
  const offlineCount = technicians.filter(t => t.status === 'offline').length

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span>Live Technician Status</span>
          <div className="flex space-x-2">
            <Badge className="bg-green-100 text-green-800">
              {availableCount} Available
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800">
              {busyCount} Busy
            </Badge>
            <Badge className="bg-gray-100 text-gray-800">
              {offlineCount} Offline
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {technicians.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No technicians found</p>
            </div>
          ) : (
            technicians.map((technician) => (
              <div
                key={technician.user_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center">
                    <span className="text-black font-medium text-sm">
                      {technician.profiles?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {technician.profiles?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`text-xs ${getStatusColor(technician.status)}`}>
                        {getStatusIcon(technician.status)}
                        <span className="ml-1">{technician.status}</span>
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {getVehicleIcon(technician.vehicle_type)} {technician.vehicle_model}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex flex-wrap gap-1">
                        {technician.skills?.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {technician.skills && technician.skills.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{technician.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  {technician.current_lat && technician.current_lng ? (
                    <div className="flex items-center space-x-1 text-xs text-green-600">
                      <MapPin className="h-3 w-3" />
                      <span>Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>No location</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatLastSeen(technician.updated_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
