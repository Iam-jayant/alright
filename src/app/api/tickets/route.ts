import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('tickets')
      .select(`
        *,
        assignments (
          id,
          technician_id,
          assigned_at,
          accepted_at,
          started_at,
          arrived_at,
          completed_at,
          notes,
          technicians (
            id,
            profiles (
              name,
              email,
              phone
            )
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`tracking_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data: tickets, error, count } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      address, 
      lat, 
      lng, 
      category, 
      description, 
      priority = 'medium',
      image_url 
    } = body

    // Generate tracking number
    const { data: trackingData } = await supabase.rpc('generate_tracking_number')
    const tracking_number = trackingData || `TKT-${Date.now()}`

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        tracking_number,
        customer_name,
        customer_email,
        customer_phone,
        address,
        lat,
        lng,
        category,
        description,
        priority,
        status: 'pending',
        image_url
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ticket }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
