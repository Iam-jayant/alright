import { useState, useEffect } from 'react'

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
  image_url?: string
  created_at: string
  updated_at: string
  assignments?: Array<{
    id: string
    technician_id: string
    assigned_at: string
    accepted_at?: string
    started_at?: string
    arrived_at?: string
    completed_at?: string
    notes?: string
    technicians?: {
      profiles: {
        name: string
        email: string
        phone: string
      }
    }
  }>
}

interface TicketsResponse {
  tickets: Ticket[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseTicketsOptions {
  status?: string
  priority?: string
  category?: string
  search?: string
  page?: number
  limit?: number
}

export function useTickets(options: UseTicketsOptions = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.append('status', options.status)
      if (options.priority) params.append('priority', options.priority)
      if (options.category) params.append('category', options.category)
      if (options.search) params.append('search', options.search)
      if (options.page) params.append('page', options.page.toString())
      if (options.limit) params.append('limit', options.limit.toString())

      const response = await fetch(`/api/tickets?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets')
      }

      const data: TicketsResponse = await response.json()
      setTickets(data.tickets)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [options.status, options.priority, options.category, options.search, options.page, options.limit])

  return {
    tickets,
    loading,
    error,
    pagination,
    refetch: fetchTickets
  }
}
