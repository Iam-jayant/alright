import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

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
  // Apply rate limiting for ticket creation
  const rateLimitResponse = rateLimit(rateLimitConfigs.ticketCreation)(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('Received ticket data:', body)
    
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
      image_url,
      tracking_number: providedTrackingNumber
    } = body

    // Use provided tracking number or generate one
    let tracking_number = providedTrackingNumber
    if (!tracking_number) {
      try {
        const { data: trackingData, error: trackingError } = await supabase.rpc('generate_tracking_number')
        if (trackingError) {
          console.error('Error generating tracking number:', trackingError)
          tracking_number = `TKT-${Date.now()}`
        } else {
          tracking_number = trackingData || `TKT-${Date.now()}`
        }
      } catch (error) {
        console.error('Error calling generate_tracking_number function:', error)
        tracking_number = `TKT-${Date.now()}`
      }
    }

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
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Failed to create ticket', 
        details: error.message 
      }, { status: 500 })
    }

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ticket_confirmation',
          data: {
            customerName: ticket.customer_name,
            customerEmail: ticket.customer_email,
            trackingNumber: ticket.tracking_number,
            serviceType: ticket.category,
            address: ticket.address,
            priority: ticket.priority
          }
        })
      })
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
      // Don't fail the ticket creation if email fails
    }

    return NextResponse.json({ ticket }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
