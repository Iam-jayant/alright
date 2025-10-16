import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get total tickets count
    const { count: totalTickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    // Get active technicians count
    const { count: activeTechnicians } = await supabase
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available')

    // Get pending assignments count
    const { count: pendingAssignments } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get completed today count
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { count: completedToday } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('updated_at', today.toISOString())
      .lt('updated_at', tomorrow.toISOString())

    // Get tickets by status for distribution
    const { data: statusDistribution } = await supabase
      .from('tickets')
      .select('status')
      .not('status', 'is', null)

    const statusCounts = statusDistribution?.reduce((acc: any, ticket: any) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1
      return acc
    }, {}) || {}

    // Get recent tickets (last 5)
    const { data: recentTickets } = await supabase
      .from('tickets')
      .select(`
        *,
        assignments (
          id,
          technician_id,
          assigned_at,
          technicians (
            profiles (
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    // Calculate completion rate
    const totalCompleted = statusCounts.completed || 0
    const totalProcessed = totalTickets || 0
    const completionRate = totalProcessed > 0 ? (totalCompleted / totalProcessed * 100).toFixed(1) : '0'

    // Calculate average response time (mock for now - would need assignment timestamps)
    const avgResponseTime = '12' // minutes

    // Calculate customer rating (mock for now - would need ratings table)
    const customerRating = '4.7'

    // Calculate revenue (mock for now - would need pricing data)
    const revenue = '240000' // ₹2.4L

    return NextResponse.json({
      stats: {
        totalTickets: totalTickets || 0,
        activeTechnicians: activeTechnicians || 0,
        pendingAssignments: pendingAssignments || 0,
        completedToday: completedToday || 0,
        completionRate: `${completionRate}%`,
        avgResponseTime: `${avgResponseTime} min`,
        customerRating: customerRating,
        revenue: `₹${(parseInt(revenue) / 100000).toFixed(1)}L`
      },
      statusDistribution,
      recentTickets: recentTickets || []
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
