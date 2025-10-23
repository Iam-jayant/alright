import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = params.id
    const supabase = await createClient()

    // Get ticket with assigned technician details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        assignments (
          id,
          assigned_at,
          accepted_at,
          started_at,
          arrived_at,
          completed_at,
          notes,
          technicians (
            user_id,
            skills,
            vehicle_type,
            vehicle_model,
            status,
            current_lat,
            current_lng,
            profiles (
              name,
              email,
              phone
            )
          )
        )
      `)
      .eq('tracking_number', ticketId)
      .single()

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError)
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Transform the data to include assigned technician
    const assignedTechnician = ticket.assignments?.[0]?.technicians
    const transformedTicket = {
      ...ticket,
      assigned_technician: assignedTechnician ? {
        name: assignedTechnician.profiles?.name,
        phone: assignedTechnician.profiles?.phone,
        skills: assignedTechnician.skills,
        vehicle_type: assignedTechnician.vehicle_type,
        vehicle_model: assignedTechnician.vehicle_model,
        status: assignedTechnician.status,
        current_lat: assignedTechnician.current_lat,
        current_lng: assignedTechnician.current_lng
      } : null
    }

    // Remove the assignments array from the response
    delete transformedTicket.assignments

    return NextResponse.json(transformedTicket)

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
