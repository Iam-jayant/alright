import { useState, useEffect } from 'react'

interface Technician {
  id: string
  user_id: string
  skills: string[]
  vehicle_type: string
  vehicle_model: string
  vehicle_plate: string
  status: string
  current_lat?: number
  current_lng?: number
  updated_at: string
  distance?: number
  profiles: {
    name: string
    email: string
    phone: string
    avatar_url?: string
  }
}

interface UseTechniciansOptions {
  status?: string
  skills?: string
  vehicle_type?: string
  search?: string
  lat?: number
  lng?: number
  max_distance?: number
}

export function useTechnicians(options: UseTechniciansOptions = {}) {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.status) params.append('status', options.status)
      if (options.skills) params.append('skills', options.skills)
      if (options.vehicle_type) params.append('vehicle_type', options.vehicle_type)
      if (options.search) params.append('search', options.search)
      if (options.lat) params.append('lat', options.lat.toString())
      if (options.lng) params.append('lng', options.lng.toString())
      if (options.max_distance) params.append('max_distance', options.max_distance.toString())

      const response = await fetch(`/api/technicians?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch technicians')
      }

      const data = await response.json()
      setTechnicians(data.technicians)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechnicians()
  }, [options.status, options.skills, options.vehicle_type, options.search, options.lat, options.lng, options.max_distance])

  return {
    technicians,
    loading,
    error,
    refetch: fetchTechnicians
  }
}
