import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticket_id')
    const technicianId = searchParams.get('technician_id')

    let query = supabase
      .from('ratings')
      .select(`
        *,
        tickets (
          tracking_number,
          customer_name
        )
      `)
      .order('created_at', { ascending: false })

    if (ticketId) {
      query = query.eq('ticket_id', ticketId)
    }

    if (technicianId) {
      query = query.eq('technician_id', technicianId)
    }

    const { data: ratings, error } = await query

    if (error) {
      console.error('Error fetching ratings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ratings })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for rating creation
  const rateLimitResponse = rateLimit(rateLimitConfigs.assignments)(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      ticket_id,
      technician_id,
      customer_email,
      rating,
      comment
    } = body

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if ticket exists and is completed
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('status, customer_email')
      .eq('id', ticket_id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    if (ticket.status !== 'completed') {
      return NextResponse.json({ error: 'Can only rate completed tickets' }, { status: 400 })
    }

    if (ticket.customer_email !== customer_email) {
      return NextResponse.json({ error: 'Unauthorized to rate this ticket' }, { status: 403 })
    }

    // Check if already rated
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('ticket_id', ticket_id)
      .single()

    if (existingRating) {
      return NextResponse.json({ error: 'Ticket already rated' }, { status: 400 })
    }

    const { data: newRating, error } = await supabase
      .from('ratings')
      .insert({
        ticket_id,
        technician_id,
        customer_email,
        rating,
        comment
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating rating:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rating: newRating }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

