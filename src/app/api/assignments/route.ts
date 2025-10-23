import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

export async function POST(request: Request) {
  // Apply rate limiting for assignment creation
  const rateLimitResponse = rateLimit(rateLimitConfigs.assignments)(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { ticket_id, technician_id, notes } = await request.json()

    if (!ticket_id || !technician_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .insert({
        ticket_id,
        technician_id,
        notes,
        assigned_at: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError)
      return NextResponse.json({ error: assignmentError.message }, { status: 500 })
    }

    // Update ticket status
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ 
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', ticket_id)

    if (ticketError) {
      console.error('Error updating ticket status:', ticketError)
      return NextResponse.json({ error: ticketError.message }, { status: 500 })
    }

    // Send assignment notification email
    try {
      // Get technician details
      const { data: technicianData } = await supabase
        .from('technicians')
        .select(`
          profiles (
            name,
            email
          )
        `)
        .eq('user_id', technician_id)
        .single()

      // Get ticket details
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('tracking_number, customer_name, address, category, priority')
        .eq('id', ticket_id)
        .single()

      if (technicianData?.profiles?.email && ticketData) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'assignment_notification',
            data: {
              technicianName: technicianData.profiles.name,
              technicianEmail: technicianData.profiles.email,
              ticketNumber: ticketData.tracking_number,
              customerName: ticketData.customer_name,
              address: ticketData.address,
              serviceType: ticketData.category,
              priority: ticketData.priority
            }
          })
        })
      }
    } catch (emailError) {
      console.error('Error sending assignment notification email:', emailError)
      // Don't fail the assignment creation if email fails
    }

    return NextResponse.json({ 
      message: 'Assignment created successfully',
      assignment 
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticket_id = searchParams.get('ticket_id')
  const technician_id = searchParams.get('technician_id')
  const status = searchParams.get('status')

  try {
    const supabase = await createClient()
    let query = supabase
      .from('assignments')
      .select(`
        *,
        tickets (
          tracking_number,
          customer_name,
          address,
          category,
          priority,
          status
        ),
        technicians (
          profiles (
            name,
            email,
            phone
          ),
          skills,
          vehicle_type,
          vehicle_model,
          status
        )
      `)

    if (ticket_id) {
      query = query.eq('ticket_id', ticket_id)
    }
    if (technician_id) {
      query = query.eq('technician_id', technician_id)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching assignments:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ assignments: data })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
