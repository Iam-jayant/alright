import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const status = searchParams.get('status')
    const skills = searchParams.get('skills')
    const vehicle_type = searchParams.get('vehicle_type')
    const search = searchParams.get('search')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const max_distance = searchParams.get('max_distance') || '10'

    // Build query
    let query = supabase
      .from('technicians')
      .select(`
        *,
        profiles (
          name,
          email,
          phone,
          avatar_url
        )
      `)
      .order('updated_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (vehicle_type && vehicle_type !== 'all') {
      query = query.eq('vehicle_type', vehicle_type)
    }
    
    if (search) {
      query = query.or(`profiles.name.ilike.%${search}%,profiles.email.ilike.%${search}%`)
    }

    const { data: technicians, error } = await query

    if (error) {
      console.error('Error fetching technicians:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by skills if provided
    let filteredTechnicians = technicians || []
    if (skills && skills !== 'all') {
      const skillArray = skills.split(',')
      filteredTechnicians = filteredTechnicians.filter(tech => 
        tech.skills && skillArray.some(skill => tech.skills.includes(skill))
      )
    }

    // Calculate distances if lat/lng provided
    if (lat && lng) {
      filteredTechnicians = filteredTechnicians.map(tech => {
        if (tech.current_lat && tech.current_lng) {
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            tech.current_lat,
            tech.current_lng
          )
          return { ...tech, distance }
        }
        return { ...tech, distance: null }
      })

      // Filter by max distance
      const maxDist = parseFloat(max_distance)
      filteredTechnicians = filteredTechnicians.filter(tech => 
        tech.distance === null || tech.distance <= maxDist
      )

      // Sort by distance
      filteredTechnicians.sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    }

    return NextResponse.json({ technicians: filteredTechnicians })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Haversine formula to calculate distance between two points
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
