'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, MapPin, Clock, Phone, MessageSquare, Wrench, CheckCircle } from 'lucide-react'
import { useTechnicians } from '@/hooks/use-technicians'
import { Ticket, Technician } from '@/types'

interface AssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket | null
  onAssign: (technicianId: string) => void
}

export default function AssignmentModal({ isOpen, onClose, ticket, onAssign }: AssignmentModalProps) {
  const [selectedTechnician, setSelectedTechnician] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('available')
  
  const { technicians, loading } = useTechnicians({
    status: statusFilter,
    skills: skillFilter === 'all' ? undefined : skillFilter,
    search: searchTerm
  })

  // Calculate distance for each technician
  const techniciansWithDistance = technicians.map(tech => {
    if (!ticket || !tech.current_lat || !tech.current_lng) {
      return { ...tech, distance: null, eta: null }
    }

    const distance = calculateDistance(
      ticket.lat,
      ticket.lng,
      tech.current_lat,
      tech.current_lng
    )
    
    const eta = calculateETA(distance)
    
    return { ...tech, distance, eta }
  }).sort((a, b) => {
    if (!a.distance || !b.distance) return 0
    return a.distance - b.distance
  })

  const handleAssign = () => {
    if (selectedTechnician) {
      onAssign(selectedTechnician)
      onClose()
    }
  }

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
      case 'offline': return <X className="h-4 w-4 text-gray-600" />
      default: return <X className="h-4 w-4 text-gray-600" />
    }
  }

  if (!isOpen || !ticket) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Technician</h2>
            <p className="text-gray-600 mt-1">Ticket #{ticket.tracking_number} - {ticket.category}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Left Panel - Ticket Info */}
          <div className="w-1/3 p-6 border-r border-gray-200 bg-gray-50">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer</p>
                  <p className="text-sm text-gray-600">{ticket.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600 flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {ticket.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Service Type</p>
                  <p className="text-sm text-gray-600">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Priority</p>
                  <Badge className={`text-xs ${
                    ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Description</p>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Technician List */}
          <div className="flex-1 p-6">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search technicians..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="AC Repair">AC Repair</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Washing Machine Repair">Washing Machine Repair</SelectItem>
                    <SelectItem value="Refrigerator Repair">Refrigerator Repair</SelectItem>
                    <SelectItem value="Geyser Repair">Geyser Repair</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Technician List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading technicians...</p>
                </div>
              ) : techniciansWithDistance.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No technicians found matching your criteria</p>
                </div>
              ) : (
                techniciansWithDistance.map((technician) => (
                  <Card 
                    key={technician.user_id} 
                    className={`cursor-pointer transition-all ${
                      selectedTechnician === technician.user_id 
                        ? 'ring-2 ring-primary-yellow bg-yellow-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTechnician(technician.user_id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-yellow rounded-full flex items-center justify-center">
                            <span className="text-black font-medium text-sm">
                              {technician.profiles?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{technician.profiles?.name}</p>
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getStatusColor(technician.status)}`}>
                                {getStatusIcon(technician.status)}
                                <span className="ml-1">{technician.status}</span>
                              </Badge>
                              {technician.distance && (
                                <span className="text-xs text-gray-500">
                                  {technician.distance.toFixed(1)} km
                                </span>
                              )}
                              {technician.eta && (
                                <span className="text-xs text-gray-500">
                                  ~{technician.eta} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Skills */}
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {technician.skills?.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Wrench className="h-3 w-3 mr-1" />
                          {technician.vehicle_type} - {technician.vehicle_model}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign}
                disabled={!selectedTechnician}
                className="btn-primary"
              >
                Assign Technician
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateETA(distanceKm: number): number {
  // Assuming average speed of 30 km/h in city traffic
  const averageSpeed = 30
  return Math.round((distanceKm / averageSpeed) * 60)
}
