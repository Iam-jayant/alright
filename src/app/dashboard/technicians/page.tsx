'use client'

import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Car
} from 'lucide-react'

export default function TechniciansPage() {
  // Mock data for technicians
  const technicians = [
    {
      id: 'TECH-001',
      name: 'Amit Singh',
      email: 'amit.singh@alright.com',
      phone: '+91 98765 43210',
      skills: ['AC Repair', 'Electrical', 'Plumbing'],
      status: 'available',
      currentLocation: 'Nagpur Central',
      lat: 21.1458,
      lng: 79.0882,
      vehicleType: 'bike',
      vehicleModel: 'Honda Activa',
      vehiclePlate: 'MH-31-AB-1234',
      rating: 4.8,
      totalJobs: 156,
      completedToday: 3,
      lastActive: '2 minutes ago'
    },
    {
      id: 'TECH-002',
      name: 'Suresh Yadav',
      email: 'suresh.yadav@alright.com',
      phone: '+91 98765 43211',
      skills: ['Electrical', 'AC Repair'],
      status: 'busy',
      currentLocation: 'Civil Lines, Nagpur',
      lat: 21.1468,
      lng: 79.0892,
      vehicleType: 'van',
      vehicleModel: 'Tata Ace',
      vehiclePlate: 'MH-31-CD-5678',
      rating: 4.6,
      totalJobs: 142,
      completedToday: 2,
      lastActive: '5 minutes ago'
    },
    {
      id: 'TECH-003',
      name: 'Ravi Kumar',
      email: 'ravi.kumar@alright.com',
      phone: '+91 98765 43212',
      skills: ['Plumbing', 'AC Repair', 'Electrical'],
      status: 'available',
      currentLocation: 'MG Road, Nagpur',
      lat: 21.1478,
      lng: 79.0902,
      vehicleType: 'bike',
      vehicleModel: 'Bajaj Pulsar',
      vehiclePlate: 'MH-31-EF-9012',
      rating: 4.9,
      totalJobs: 203,
      completedToday: 4,
      lastActive: '1 minute ago'
    },
    {
      id: 'TECH-004',
      name: 'Vikram Patel',
      email: 'vikram.patel@alright.com',
      phone: '+91 98765 43213',
      skills: ['Electrical', 'Plumbing'],
      status: 'offline',
      currentLocation: 'Dharampeth, Nagpur',
      lat: 21.1488,
      lng: 79.0912,
      vehicleType: 'car',
      vehicleModel: 'Maruti Swift',
      vehiclePlate: 'MH-31-GH-3456',
      rating: 4.7,
      totalJobs: 98,
      completedToday: 0,
      lastActive: '2 hours ago'
    }
  ]

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
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <Select>
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

                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    <SelectItem value="ac">AC Repair</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
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
          {technicians.map((tech) => (
            <Card key={tech.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tech.name}</h3>
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
                    <span className="text-sm font-medium">{tech.rating}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {tech.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {tech.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {tech.currentLocation}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {tech.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-yellow/10 text-primary-yellow text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getVehicleIcon(tech.vehicleType)}
                      <span className="text-sm font-medium text-gray-900 capitalize">{tech.vehicleType}</span>
                    </div>
                    <span className="text-xs text-gray-500">{tech.vehiclePlate}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{tech.vehicleModel}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{tech.totalJobs}</p>
                    <p className="text-xs text-gray-500">Total Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{tech.completedToday}</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>

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
                    Last active: {tech.lastActive}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-sm text-gray-500">Total Technicians</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">2</p>
              <p className="text-sm text-gray-500">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">1</p>
              <p className="text-sm text-gray-500">Busy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">1</p>
              <p className="text-sm text-gray-500">Offline</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
