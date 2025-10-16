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
  Clock, 
  User, 
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export default function TicketsPage() {
  // Mock data for tickets
  const tickets = [
    {
      id: 'TKT-NAG-001',
      customer: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 98765 43210',
      service: 'AC Repair',
      address: '206 Beach Blvd, Nagpur, Maharashtra 440001',
      lat: 21.1458,
      lng: 79.0882,
      status: 'assigned',
      priority: 'high',
      assignedTo: 'Amit Singh',
      createdAt: '2024-01-15T10:30:00Z',
      estimatedTime: '2 hours',
      description: 'AC not cooling properly, making strange noise'
    },
    {
      id: 'TKT-NAG-002',
      customer: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43211',
      service: 'Plumbing',
      address: '102 Collins Ave, Nagpur, Maharashtra 440002',
      lat: 21.1468,
      lng: 79.0892,
      status: 'pending',
      priority: 'medium',
      assignedTo: null,
      createdAt: '2024-01-15T08:15:00Z',
      estimatedTime: '1.5 hours',
      description: 'Leaky faucet in kitchen, water pressure low'
    },
    {
      id: 'TKT-NAG-003',
      customer: 'Vikram Patel',
      email: 'vikram.patel@email.com',
      phone: '+91 98765 43212',
      service: 'Electrical',
      address: '45 MG Road, Nagpur, Maharashtra 440003',
      lat: 21.1478,
      lng: 79.0902,
      status: 'completed',
      priority: 'low',
      assignedTo: 'Suresh Yadav',
      createdAt: '2024-01-15T06:00:00Z',
      estimatedTime: '1 hour',
      description: 'Power socket not working, needs replacement'
    },
    {
      id: 'TKT-NAG-004',
      customer: 'Anita Desai',
      email: 'anita.desai@email.com',
      phone: '+91 98765 43213',
      service: 'AC Repair',
      address: '78 Civil Lines, Nagpur, Maharashtra 440004',
      lat: 21.1488,
      lng: 79.0912,
      status: 'on-the-way',
      priority: 'high',
      assignedTo: 'Ravi Kumar',
      createdAt: '2024-01-15T14:20:00Z',
      estimatedTime: '3 hours',
      description: 'AC completely stopped working, emergency repair needed'
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
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all service requests</p>
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
                    placeholder="Search tickets, customers, or addresses..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="on-the-way">On The Way</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="ac">AC Repair</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {/* New Ticket Button */}
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-900">{ticket.id}</span>
                        <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">{ticket.customer}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {ticket.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {ticket.phone}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">{ticket.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-600">Est. {ticket.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Service</p>
                          <p className="text-sm text-gray-600">{ticket.service}</p>
                        </div>
                        {ticket.assignedTo && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Assigned To</p>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm text-gray-600">{ticket.assignedTo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Description:</span> {ticket.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          Assign Technician
                        </Button>
                        <Button variant="outline" size="sm">
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of{' '}
            <span className="font-medium">4</span> results
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary-yellow text-black">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
