'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Upload, CheckCircle, AlertCircle, Phone, Mail, User, Wrench } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const complaintSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
  category: z.string().min(1, 'Please select a service category'),
  priority: z.string().min(1, 'Please select a priority level'),
  description: z.string().min(10, 'Please provide a detailed description'),
  image: z.any().optional()
})

type ComplaintFormData = z.infer<typeof complaintSchema>

const serviceCategories = [
  'AC Repair & Maintenance',
  'Plumbing Services',
  'Electrical Work',
  'Washing Machine Repair',
  'Refrigerator Repair',
  'Geyser Repair',
  'RO Water Purifier',
  'Microwave Repair',
  'TV Repair',
  'Other'
]

const priorityLevels = [
  { value: 'low', label: 'Low - Can wait 2-3 days' },
  { value: 'medium', label: 'Medium - Within 24 hours' },
  { value: 'high', label: 'High - Same day service' },
  { value: 'urgent', label: 'Urgent - Emergency service' }
]

export default function ComplaintPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema)
  })

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      // Geocode address to get lat/lng
      const geocodedLocation = await geocodeAddress(data.address)
      
      // Generate tracking number
      const trackingNum = generateTrackingNumber()
      
      // Create ticket data
      const ticketData = {
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        address: data.address,
        lat: geocodedLocation.lat,
        lng: geocodedLocation.lng,
        category: data.category,
        description: data.description,
        priority: data.priority,
        status: 'pending',
        tracking_number: trackingNum
      }

      // Submit to API
      console.log('Submitting ticket data:', ticketData)
      const response = await fetch('/api/tickets/bypass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData)
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        let errorMessage = 'Failed to submit complaint'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      setTrackingNumber(trackingNum)
      setIsSuccess(true)
      reset()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
      const data = await response.json()
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      
      // Fallback to Nagpur coordinates if geocoding fails
      return { lat: 21.1458, lng: 79.0882 }
    } catch (error) {
      console.error('Geocoding failed:', error)
      return { lat: 21.1458, lng: 79.0882 }
    }
  }

  const generateTrackingNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `TKT-NAG-${timestamp}-${random}`
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your service request has been received and will be processed shortly.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
              <p className="text-lg font-mono font-bold text-gray-900">{trackingNumber}</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = `/track/${trackingNumber}`}
                className="w-full btn-primary"
              >
                Track Your Request
              </Button>
              <Button 
                onClick={() => {
                  setIsSuccess(false)
                  setTrackingNumber('')
                }}
                variant="outline"
                className="w-full"
              >
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-yellow rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Alright</h1>
              <p className="text-gray-600">Field Service Management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit Service Request</h2>
          <p className="text-gray-600">Tell us about your service needs and we'll connect you with the right technician</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-primary-yellow" />
              <span>Service Request Form</span>
            </CardTitle>
            <CardDescription>
              Please fill in all the details below. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name *</span>
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address *</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your.email@example.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone Number *</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Service Address *</span>
                  </Label>
                  <Input
                    id="address"
                    {...register('address')}
                    placeholder="Enter complete address with area, city, pincode"
                    className="mt-1"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category">Service Category *</Label>
                  <Select onValueChange={(value) => setValue('category', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select onValueChange={(value) => setValue('priority', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Problem Description *</Label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  placeholder="Please describe the problem in detail. Include any symptoms, when it started, and what you've tried so far."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Attach Image (Optional)</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-black" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Response</h3>
            <p className="text-gray-600 text-sm">Get assigned to a technician within hours</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-black" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Live Tracking</h3>
            <p className="text-gray-600 text-sm">Track your technician's location in real-time</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-6 w-6 text-black" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expert Technicians</h3>
            <p className="text-gray-600 text-sm">Skilled professionals for all your needs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
