'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSubscriptionsOptions {
  onTicketUpdate?: (payload: any) => void
  onTechnicianUpdate?: (payload: any) => void
  onAssignmentUpdate?: (payload: any) => void
  onLocationUpdate?: (payload: any) => void
  onGeofenceUpdate?: (payload: any) => void
}

export function useRealtimeSubscriptions({
  onTicketUpdate,
  onTechnicianUpdate,
  onAssignmentUpdate,
  onLocationUpdate,
  onGeofenceUpdate
}: RealtimeSubscriptionsOptions) {
  const supabase = createClient()
  const channelsRef = useRef<RealtimeChannel[]>([])

  useEffect(() => {
    // Subscribe to ticket updates
    if (onTicketUpdate) {
      const ticketChannel = supabase
        .channel('ticket-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets'
          },
          (payload) => {
            console.log('Ticket update received:', payload)
            onTicketUpdate(payload)
          }
        )
        .subscribe()

      channelsRef.current.push(ticketChannel)
    }

    // Subscribe to technician updates
    if (onTechnicianUpdate) {
      const technicianChannel = supabase
        .channel('technician-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'technicians'
          },
          (payload) => {
            console.log('Technician update received:', payload)
            onTechnicianUpdate(payload)
          }
        )
        .subscribe()

      channelsRef.current.push(technicianChannel)
    }

    // Subscribe to assignment updates
    if (onAssignmentUpdate) {
      const assignmentChannel = supabase
        .channel('assignment-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'assignments'
          },
          (payload) => {
            console.log('Assignment update received:', payload)
            onAssignmentUpdate(payload)
          }
        )
        .subscribe()

      channelsRef.current.push(assignmentChannel)
    }

    // Subscribe to location updates
    if (onLocationUpdate) {
      const locationChannel = supabase
        .channel('location-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'locations'
          },
          (payload) => {
            console.log('Location update received:', payload)
            onLocationUpdate(payload)
          }
        )
        .subscribe()

      channelsRef.current.push(locationChannel)
    }

    // Subscribe to geofence updates
    if (onGeofenceUpdate) {
      const geofenceChannel = supabase
        .channel('geofence-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'geofences'
          },
          (payload) => {
            console.log('Geofence update received:', payload)
            onGeofenceUpdate(payload)
          }
        )
        .subscribe()

      channelsRef.current.push(geofenceChannel)
    }

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
      channelsRef.current = []
    }
  }, [supabase, onTicketUpdate, onTechnicianUpdate, onAssignmentUpdate, onLocationUpdate, onGeofenceUpdate])

  return {
    channels: channelsRef.current
  }
}
