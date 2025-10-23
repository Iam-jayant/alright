'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import * as turf from '@turf/turf'

interface Geofence {
  id: string
  ticket_id: string
  center_lat: number
  center_lng: number
  radius_meters: number
  entry_logged_at?: string
  exit_logged_at?: string
}

interface UseGeofencingOptions {
  enabled: boolean
  currentLocation: { lat: number; lng: number } | null
  activeTicketId?: string
  onEntry?: (geofence: Geofence) => void
  onExit?: (geofence: Geofence) => void
}

export function useGeofencing({
  enabled,
  currentLocation,
  activeTicketId,
  onEntry,
  onExit
}: UseGeofencingOptions) {
  const supabase = createClient()
  const geofencesRef = useRef<Geofence[]>([])
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null)

  // Fetch active geofences for the current ticket
  const fetchGeofences = useCallback(async () => {
    if (!activeTicketId) return

    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('ticket_id', activeTicketId)

      if (error) {
        console.error('Error fetching geofences:', error)
        return
      }

      geofencesRef.current = data || []
    } catch (err) {
      console.error('Error fetching geofences:', err)
    }
  }, [activeTicketId, supabase])

  // Check if point is inside geofence
  const isInsideGeofence = useCallback((point: { lat: number; lng: number }, geofence: Geofence): boolean => {
    const center = turf.point([geofence.center_lng, geofence.center_lat])
    const testPoint = turf.point([point.lng, point.lat])
    const distance = turf.distance(center, testPoint, { units: 'meters' })
    
    return distance <= geofence.radius_meters
  }, [])

  // Check geofence entry/exit
  const checkGeofences = useCallback(async (currentPoint: { lat: number; lng: number }) => {
    if (!enabled || geofencesRef.current.length === 0) return

    const lastLocation = lastLocationRef.current

    for (const geofence of geofencesRef.current) {
      const isCurrentlyInside = isInsideGeofence(currentPoint, geofence)
      const wasInside = lastLocation ? isInsideGeofence(lastLocation, geofence) : false

      // Entry detection
      if (isCurrentlyInside && !wasInside) {
        console.log('Geofence entry detected:', geofence)
        
        try {
          // Update geofence with entry time
          const { error } = await supabase
            .from('geofences')
            .update({
              entry_logged_at: new Date().toISOString()
            })
            .eq('id', geofence.id)

          if (error) {
            console.error('Error updating geofence entry:', error)
          } else {
            onEntry?.(geofence)
          }
        } catch (err) {
          console.error('Error updating geofence entry:', err)
        }
      }

      // Exit detection
      if (!isCurrentlyInside && wasInside) {
        console.log('Geofence exit detected:', geofence)
        
        try {
          // Update geofence with exit time
          const { error } = await supabase
            .from('geofences')
            .update({
              exit_logged_at: new Date().toISOString()
            })
            .eq('id', geofence.id)

          if (error) {
            console.error('Error updating geofence exit:', error)
          } else {
            onExit?.(geofence)
          }
        } catch (err) {
          console.error('Error updating geofence exit:', err)
        }
      }
    }

    lastLocationRef.current = currentPoint
  }, [enabled, isInsideGeofence, supabase, onEntry, onExit])

  // Create geofence for a ticket
  const createGeofence = useCallback(async (
    ticketId: string,
    centerLat: number,
    centerLng: number,
    radiusMeters: number = 100
  ) => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .insert({
          ticket_id: ticketId,
          center_lat: centerLat,
          center_lng: centerLng,
          radius_meters: radiusMeters
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating geofence:', error)
        return null
      }

      geofencesRef.current.push(data)
      return data
    } catch (err) {
      console.error('Error creating geofence:', err)
      return null
    }
  }, [supabase])

  // Remove geofence
  const removeGeofence = useCallback(async (geofenceId: string) => {
    try {
      const { error } = await supabase
        .from('geofences')
        .delete()
        .eq('id', geofenceId)

      if (error) {
        console.error('Error removing geofence:', error)
        return false
      }

      geofencesRef.current = geofencesRef.current.filter(g => g.id !== geofenceId)
      return true
    } catch (err) {
      console.error('Error removing geofence:', err)
      return false
    }
  }, [supabase])

  // Check geofences when location changes
  useEffect(() => {
    if (currentLocation && enabled) {
      checkGeofences(currentLocation)
    }
  }, [currentLocation, enabled, checkGeofences])

  // Fetch geofences when active ticket changes
  useEffect(() => {
    if (activeTicketId) {
      fetchGeofences()
    }
  }, [activeTicketId, fetchGeofences])

  return {
    geofences: geofencesRef.current,
    createGeofence,
    removeGeofence,
    isInsideGeofence: (point: { lat: number; lng: number }, geofence: Geofence) => 
      isInsideGeofence(point, geofence)
  }
}
