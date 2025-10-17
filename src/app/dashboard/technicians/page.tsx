'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTechnicians } from '@/hooks/use-technicians'
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Bike,
  Car,
  Loader2
} from 'lucide-react'

export default function TechniciansPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    skills: 'all',
    vehicle_type: 'all',
    search: ''
  })

  const { technicians, loading, error } = useTechnicians({
    status: filters.status !== 'all' ? filters.status : undefined,
    skills: filters.skills !== 'all' ? filters.skills : undefined,
    vehicle_type: filters.vehicle_type !== 'all' ? filters.vehicle_type : undefined,
    search: filters.search || undefined
  })

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
      case 'available': return <CheckCircle className="h-4 w-4" />
      case 'busy': return <Clock className="h-4 w-4" />
      case 'offline': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bike': return <Bike className="h-4 w-4" />
      case 'van': return <Car className="h-4 w-4" />
      case 'car': return <Car className="h-4 w-4" />
      default: return <Bike className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-yellow" />
              <p className="text-gray-600">Loading technicians...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading technicians</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Technician Management</h1>
          <p className="text-gray-600 mt-2">Manage your field service technicians and their availability</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search technicians by name, skills, or location..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.skills} onValueChange={(value) => setFilters(prev => ({ ...prev, skills: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="AC Repair">AC Repair</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.vehicle_type} onValueChange={(value) => setFilters(prev => ({ ...prev, vehicle_type: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {/* Add Technician Button */}
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Technician
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {technicians.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No technicians found matching your criteria</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            technicians.map((tech) => (
              <Card key={tech.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tech.profiles.name}</h3>
                        <p className="text-sm text-gray-500">{tech.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tech.status)}`}>
                      {getStatusIcon(tech.status)}
                      <span className="capitalize">{tech.status}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {tech.profiles.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {tech.profiles.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {tech.current_lat && tech.current_lng ? 'Location Available' : 'Location Unknown'}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {tech.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-primary-yellow/10 text-primary-yellow text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      )) || <span className="text-xs text-gray-500">No skills listed</span>}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getVehicleIcon(tech.vehicle_type)}
                        <span className="text-sm font-medium text-gray-900 capitalize">{tech.vehicle_type}</span>
                      </div>
                      <span className="text-xs text-gray-500">{tech.vehicle_plate}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{tech.vehicle_model}</p>
                  </div>

                  {/* Distance */}
                  {tech.distance && (
                    <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 text-center">
                        {tech.distance.toFixed(1)} km away
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Location
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Assign Job
                    </Button>
                  </div>

                  {/* Last Active */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Updated: {new Date(tech.updated_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{technicians.length}</p>
              <p className="text-sm text-gray-500">Total Technicians</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {technicians.filter(t => t.status === 'available').length}
              </p>
              <p className="text-sm text-gray-500">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {technicians.filter(t => t.status === 'busy').length}
              </p>
              <p className="text-sm text-gray-500">Busy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {technicians.filter(t => t.status === 'offline').length}
              </p>
              <p className="text-sm text-gray-500">Offline</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
