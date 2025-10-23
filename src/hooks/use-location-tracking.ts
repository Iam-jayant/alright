'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

interface LocationData {
  lat: number
  lng: number
  speed?: number
  heading?: number
  accuracy?: number
}

interface UseLocationTrackingOptions {
  enabled: boolean
  interval?: number // in milliseconds
  technicianId?: string
  onLocationUpdate?: (location: LocationData) => void
  onError?: (error: GeolocationPositionError) => void
}

export function useLocationTracking({
  enabled,
  interval = 30000, // 30 seconds default
  technicianId,
  onLocationUpdate,
  onError
}: UseLocationTrackingOptions) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt')
  
  const supabase = createClient()

  // Check geolocation permission
  const checkPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
        setPermissionStatus(permission.state)
        return permission.state === 'granted'
      } catch (err) {
        console.warn('Permission API not supported:', err)
        return true // Assume granted if API not available
      }
    }
    return true
  }, [])

  // Get current position
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // Accept cached position up to 1 minute old
        }
      )
    })
  }, [])

  // Update location in database
  const updateLocationInDB = useCallback(async (locationData: LocationData) => {
    if (!technicianId) return

    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          technician_id: technicianId,
          lat: locationData.lat,
          lng: locationData.lng,
          speed: locationData.speed || null,
          heading: locationData.heading || null,
          recorded_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating location in database:', error)
      }
    } catch (err) {
      console.error('Error updating location:', err)
    }
  }, [technicianId, supabase])

  // Update technician's current location
  const updateTechnicianLocation = useCallback(async (locationData: LocationData) => {
    if (!technicianId) return

    try {
      const { error } = await supabase
        .from('technicians')
        .update({
          current_lat: locationData.lat,
          current_lng: locationData.lng,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', technicianId)

      if (error) {
        console.error('Error updating technician location:', error)
      }
    } catch (err) {
      console.error('Error updating technician location:', err)
    }
  }, [technicianId, supabase])

  // Start tracking
  const startTracking = useCallback(async () => {
    if (!enabled || isTracking) return

    const hasPermission = await checkPermission()
    if (!hasPermission) {
      setError('Location permission denied')
      return
    }

    try {
      const position = await getCurrentPosition()
      const locationData: LocationData = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed || undefined,
        heading: position.coords.heading || undefined,
        accuracy: position.coords.accuracy || undefined
      }

      setLocation(locationData)
      setError(null)
      setIsTracking(true)

      // Update database
      await updateLocationInDB(locationData)
      await updateTechnicianLocation(locationData)

      // Notify parent component
      onLocationUpdate?.(locationData)

    } catch (err) {
      const geoError = err as GeolocationPositionError
      setError(geoError.message)
      onError?.(geoError)
      setIsTracking(false)
    }
  }, [enabled, isTracking, checkPermission, getCurrentPosition, updateLocationInDB, updateTechnicianLocation, onLocationUpdate, onError])

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false)
    setError(null)
  }, [])

  // Set up interval for continuous tracking
  useEffect(() => {
    if (!isTracking || !enabled) return

    const intervalId = setInterval(async () => {
      try {
        const position = await getCurrentPosition()
        const locationData: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          accuracy: position.coords.accuracy || undefined
        }

        setLocation(locationData)
        await updateLocationInDB(locationData)
        await updateTechnicianLocation(locationData)
        onLocationUpdate?.(locationData)

      } catch (err) {
        const geoError = err as GeolocationPositionError
        console.error('Location tracking error:', geoError)
        onError?.(geoError)
      }
    }, interval)

    return () => clearInterval(intervalId)
  }, [isTracking, enabled, interval, getCurrentPosition, updateLocationInDB, updateTechnicianLocation, onLocationUpdate, onError])

  // Auto-start tracking when enabled
  useEffect(() => {
    if (enabled && !isTracking) {
      startTracking()
    } else if (!enabled && isTracking) {
      stopTracking()
    }
  }, [enabled, isTracking, startTracking, stopTracking])

  return {
    location,
    isTracking,
    error,
    permissionStatus,
    startTracking,
    stopTracking
  }
}
