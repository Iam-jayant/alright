import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Sample profiles data
    const profilesData = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Amit Singh',
        email: 'amit.singh@alright.com',
        role: 'technician',
        phone: '+91 98765 43210'
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Suresh Yadav',
        email: 'suresh.yadav@alright.com',
        role: 'technician',
        phone: '+91 98765 43211'
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Ravi Kumar',
        email: 'ravi.kumar@alright.com',
        role: 'technician',
        phone: '+91 98765 43212'
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Manager User',
        email: 'manager@alright.com',
        role: 'manager',
        phone: '+91 98765 43213'
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        role: 'customer',
        phone: '+91 98765 43214'
      }
    ]

    // Sample technicians data
    const techniciansData = [
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        skills: ['AC Repair', 'Electrical', 'Plumbing'],
        vehicle_type: 'bike',
        vehicle_model: 'Honda Activa',
        vehicle_plate: 'MH-31-AB-1234',
        status: 'available',
        current_lat: 21.1458,
        current_lng: 79.0882
      },
      {
        user_id: '00000000-0000-0000-0000-000000000002',
        skills: ['Electrical', 'AC Repair'],
        vehicle_type: 'van',
        vehicle_model: 'Tata Ace',
        vehicle_plate: 'MH-31-CD-5678',
        status: 'busy',
        current_lat: 21.1468,
        current_lng: 79.0892
      },
      {
        user_id: '00000000-0000-0000-0000-000000000003',
        skills: ['Plumbing', 'AC Repair', 'Electrical'],
        vehicle_type: 'bike',
        vehicle_model: 'Bajaj Pulsar',
        vehicle_plate: 'MH-31-EF-9012',
        status: 'available',
        current_lat: 21.1478,
        current_lng: 79.0902
      }
    ]

    // Sample tickets data
    const ticketsData = [
      {
        tracking_number: 'TKT-NAG-001',
        customer_name: 'Rajesh Kumar',
        customer_email: 'rajesh.kumar@email.com',
        customer_phone: '+91 98765 43210',
        address: '206 Beach Blvd, Nagpur, Maharashtra 440001',
        lat: 21.1458,
        lng: 79.0882,
        category: 'AC Repair',
        description: 'AC not cooling properly, making strange noise',
        priority: 'high',
        status: 'assigned'
      },
      {
        tracking_number: 'TKT-NAG-002',
        customer_name: 'Priya Sharma',
        customer_email: 'priya.sharma@email.com',
        customer_phone: '+91 98765 43211',
        address: '102 Collins Ave, Nagpur, Maharashtra 440002',
        lat: 21.1468,
        lng: 79.0892,
        category: 'Plumbing',
        description: 'Leaky faucet in kitchen, water pressure low',
        priority: 'medium',
        status: 'pending'
      },
      {
        tracking_number: 'TKT-NAG-003',
        customer_name: 'Vikram Patel',
        customer_email: 'vikram.patel@email.com',
        customer_phone: '+91 98765 43212',
        address: '45 MG Road, Nagpur, Maharashtra 440003',
        lat: 21.1478,
        lng: 79.0902,
        category: 'Electrical',
        description: 'Power socket not working, needs replacement',
        priority: 'low',
        status: 'completed'
      }
    ]

    // Insert profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilesData, { onConflict: 'id' })

    if (profileError) {
      console.error('Error inserting profiles:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Insert technicians
    const { error: techError } = await supabase
      .from('technicians')
      .upsert(techniciansData, { onConflict: 'user_id' })

    if (techError) {
      console.error('Error inserting technicians:', techError)
      return NextResponse.json({ error: techError.message }, { status: 500 })
    }

    // Insert tickets
    const { error: ticketError } = await supabase
      .from('tickets')
      .upsert(ticketsData, { onConflict: 'tracking_number' })

    if (ticketError) {
      console.error('Error inserting tickets:', ticketError)
      return NextResponse.json({ error: ticketError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Sample data created successfully',
      profiles: profilesData.length,
      technicians: techniciansData.length,
      tickets: ticketsData.length
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
