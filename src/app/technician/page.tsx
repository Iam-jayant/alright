'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  Navigation,
  Camera,
  MessageSquare,
  Map,
  Loader2
} from 'lucide-react'
import { useLocationTracking } from '@/hooks/use-location-tracking'
import { useGeofencing } from '@/hooks/use-geofencing'
import PhotoUpload from '@/components/upload/photo-upload'

export default function TechnicianPage() {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [currentJob, setCurrentJob] = useState<any>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Mock technician ID for development
  const technicianId = '00000000-0000-0000-0000-000000000001'

  // Location tracking hook
  const { location, isTracking, error, startTracking, stopTracking } = useLocationTracking({
    enabled: isLocationEnabled,
    technicianId,
    onLocationUpdate: (locationData) => {
      console.log('Location updated:', locationData)
    },
    onError: (error) => {
      setLocationError(error.message)
    }
  })

  // Geofencing hook
  const { createGeofence, isInsideGeofence } = useGeofencing({
    enabled: isLocationEnabled && !!currentJob,
    currentLocation: location,
    activeTicketId: currentJob?.id,
    onEntry: (geofence) => {
      console.log('Entered job site geofence:', geofence)
      // Auto-update status to "Arrived"
      handleStatusUpdate('arrived')
    },
    onExit: (geofence) => {
      console.log('Exited job site geofence:', geofence)
    }
  })

  // Mock data for technician dashboard
  const assignedJobs = [
    {
      id: 'TKT-NAG-001',
      customer: 'Rajesh Kumar',
      service: 'AC Repair',
      address: '206 Beach Blvd, Nagpur',
      status: 'assigned',
      priority: 'high',
      estimatedTime: '2 hours',
      description: 'AC not cooling properly, making strange noise',
      customerPhone: '+91 98765 43210',
      customerEmail: 'rajesh.kumar@email.com'
    },
    {
      id: 'TKT-NAG-002',
      customer: 'Priya Sharma',
      service: 'Plumbing',
      address: '102 Collins Ave, Nagpur',
      status: 'in-progress',
      priority: 'medium',
      estimatedTime: '1.5 hours',
      description: 'Leaky faucet in kitchen, water pressure low',
      customerPhone: '+91 98765 43211',
      customerEmail: 'priya.sharma@email.com'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-yellow-100 text-yellow-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const handleComplete = (jobId: string) => {
    console.log(`Technician completed job: ${jobId}`)
    // In a real app, update job status in DB
    setCurrentJob(null)
  }

  const handleStatusUpdate = (status: string) => {
    if (currentJob) {
      console.log(`Job ${currentJob.id} status updated to: ${status}`)
      // In a real app, update job status in DB
    }
  }

  const handleStartJob = (job: any) => {
    setCurrentJob(job)
    setIsLocationEnabled(true)
    
    // Create geofence for job site
    if (job.lat && job.lng) {
      createGeofence(job.id, job.lat, job.lng, 100) // 100m radius
    }
  }

  const handleStopTracking = () => {
    setIsLocationEnabled(false)
    setCurrentJob(null)
  }

  const toggleLocationTracking = () => {
    if (isLocationEnabled) {
      handleStopTracking()
    } else {
      setIsLocationEnabled(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-yellow rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Alright</h1>
                <p className="text-sm text-gray-500">Technician Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Location Tracking Status */}
              <div className="flex items-center space-x-2">
                {isTracking ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Tracking</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs">Offline</span>
                  </div>
                )}
                <Button
                  onClick={toggleLocationTracking}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Map className="h-3 w-3 mr-1" />
                  {isTracking ? 'Stop' : 'Start'} Tracking
                </Button>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Amit Singh</p>
                <p className="text-xs text-gray-500">
                  {isTracking ? 'Tracking Location' : 'Available'}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-yellow rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">AS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isTracking ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {isTracking ? (
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Status: {isTracking ? 'On Job' : 'Available'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isTracking ? 'Location tracking active' : 'Ready to accept new assignments'}
                  </p>
                  {location && (
                    <p className="text-xs text-gray-400 mt-1">
                      Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  )}
                  {locationError && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {locationError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={toggleLocationTracking}
                  variant={isTracking ? "outline" : "default"}
                  className={isTracking ? "" : "btn-primary"}
                >
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Button>
                {currentJob && (
                  <Button
                    onClick={handleStopTracking}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    End Job
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Jobs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assigned Jobs</h2>
          <div className="space-y-4">
            {assignedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">{job.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{job.customer} • {job.service}</h3>
                      <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Est. {job.estimatedTime}
                      </div>
                    </div>
                  </div>

                  {/* Customer Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {job.customerPhone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {job.customerEmail}
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Section - Only show for active job */}
                  {currentJob?.id === job.id && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        Job Photos
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PhotoUpload
                          ticketId={job.id}
                          type="before"
                          onUploadSuccess={(url) => console.log('Before photo uploaded:', url)}
                        />
                        <PhotoUpload
                          ticketId={job.id}
                          type="after"
                          onUploadSuccess={(url) => console.log('After photo uploaded:', url)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {currentJob?.id === job.id ? (
                      <>
                        <Button 
                          onClick={() => handleStatusUpdate('en_route')}
                          variant="outline" 
                          size="sm"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          En Route
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate('arrived')}
                          variant="outline" 
                          size="sm"
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Arrived
                        </Button>
                        <Button 
                          onClick={() => handleStatusUpdate('in_progress')}
                          variant="outline" 
                          size="sm"
                        >
                          <Wrench className="h-4 w-4 mr-1" />
                          In Progress
                        </Button>
                        <Button 
                          onClick={() => handleComplete(job.id)}
                          className="btn-primary" 
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => handleStartJob(job)}
                          className="btn-primary" 
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Start Job
                        </Button>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-1" />
                          Photo
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-gray-900">2</p>
              <p className="text-sm text-gray-500">Assigned Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-yellow-600">4.8</p>
              <p className="text-sm text-gray-500">Average Rating</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}