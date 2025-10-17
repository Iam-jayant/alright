'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ticket, MapPin, Clock, Phone, Mail, Search, Filter, Plus, Eye, Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/providers'
import RatingDisplay from '@/components/rating/rating-display'

interface CustomerTicket {
  id: string
  tracking_number: string
  customer_name: string
  category: string
  description: string
  status: string
  priority: string
  created_at: string
  address: string
  before_image_url?: string
  after_image_url?: string
  assignments?: Array<{
    id: string
    technicians: {
      profiles: {
        name: string
        email: string
        phone: string
      }
    }
    completed_at?: string
  }>
}

export default function CustomerPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<CustomerTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratings, setRatings] = useState([])

  useEffect(() => {
    fetchTickets()
    fetchRatings()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        // Filter tickets for current user
        const userTickets = data.tickets.filter((ticket: CustomerTicket) => 
          ticket.customer_email === user?.email
        )
        setTickets(userTickets)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/ratings')
      if (response.ok) {
        const data = await response.json()
        setRatings(data.ratings)
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-yellow"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Service Requests</h1>
              <p className="text-gray-600">Track and manage your service tickets</p>
            </div>
            <Button asChild className="bg-primary-yellow hover:bg-yellow-500 text-black">
              <Link href="/complaint">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Ticket className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {ratings.length > 0 
                      ? (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(1)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by tracking number or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'You haven\'t created any service requests yet'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button asChild className="bg-primary-yellow hover:bg-yellow-500 text-black">
                    <Link href="/complaint">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Request
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.tracking_number}
                        </h3>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">{ticket.category}</h4>
                        <p className="text-gray-600 text-sm">{ticket.description}</p>
                      </div>
                      
                      {ticket.assignments?.[0]?.technicians && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Assigned Technician: {ticket.assignments[0].technicians.profiles.name}
                          </p>
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {ticket.assignments[0].technicians.profiles.phone}
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {ticket.assignments[0].technicians.profiles.email}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {ticket.address}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Images */}
                      {(ticket.before_image_url || ticket.after_image_url) && (
                        <div className="mt-3 flex space-x-2">
                          {ticket.before_image_url && (
                            <div className="text-xs text-gray-600">
                              <img 
                                src={ticket.before_image_url} 
                                alt="Before" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <p>Before</p>
                            </div>
                          )}
                          {ticket.after_image_url && (
                            <div className="text-xs text-gray-600">
                              <img 
                                src={ticket.after_image_url} 
                                alt="After" 
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <p>After</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/track/${ticket.tracking_number}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Track
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Ratings Section */}
        {ratings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Ratings</h2>
            <Card>
              <CardContent className="p-6">
                <RatingDisplay ratings={ratings} showTicketInfo={true} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}