import { useState, useEffect } from 'react'

interface DashboardStats {
  totalTickets: number
  activeTechnicians: number
  pendingAssignments: number
  completedToday: number
  completionRate: string
  avgResponseTime: string
  customerRating: string
  revenue: string
}

interface StatusDistribution {
  [key: string]: number
}

interface RecentTicket {
  id: string
  tracking_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  category: string
  description: string
  priority: string
  status: string
  created_at: string
  assignments?: Array<{
    technicians?: {
      profiles: {
        name: string
      }
    }
  }>
}

interface DashboardData {
  stats: DashboardStats
  statusDistribution: StatusDistribution
  recentTickets: RecentTicket[]
}

export function useDashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const statsData = await response.json()
      setData(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchStats
  }
}
