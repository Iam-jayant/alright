import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
export const requiredString = z.string().min(1, 'This field is required')

// User profile validation
export const profileSchema = z.object({
  name: requiredString.min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['manager', 'technician', 'customer']),
})

// Technician validation
export const technicianSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  vehicle_info: z.object({
    type: z.enum(['van', 'truck', 'car', 'motorcycle', 'bicycle']),
    model: z.string().optional(),
    plate: z.string().optional(),
  }).optional(),
})

// Ticket creation validation
export const createTicketSchema = z.object({
  customer_name: requiredString.min(2, 'Name must be at least 2 characters'),
  customer_email: emailSchema,
  customer_phone: phoneSchema.optional(),
  address: requiredString.min(5, 'Please provide a complete address'),
  category: z.string().min(1, 'Please select a category'),
  description: requiredString.min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  images: z.array(z.instanceof(File)).max(5, 'Maximum 5 images allowed').optional(),
})

// Ticket update validation
export const updateTicketSchema = z.object({
  status: z.enum(['pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  estimated_duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
})

// Assignment validation
export const createAssignmentSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  technician_id: z.string().uuid('Invalid technician ID'),
  notes: z.string().optional(),
})

export const updateAssignmentSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed']),
  notes: z.string().optional(),
})

// Location validation
export const locationSchema = z.object({
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lng: z.number().min(-180).max(180, 'Invalid longitude'),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
})

// Rating validation
export const ratingSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  technician_id: z.string().uuid('Invalid technician ID'),
  customer_email: emailSchema,
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
})

// Geofence validation
export const geofenceSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  center_lat: z.number().min(-90).max(90, 'Invalid latitude'),
  center_lng: z.number().min(-180).max(180, 'Invalid longitude'),
  radius_meters: z.number().min(50).max(500, 'Radius must be between 50 and 500 meters'),
})

// Filter validation schemas
export const ticketFiltersSchema = z.object({
  status: z.array(z.enum(['pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'])).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  category: z.array(z.string()).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  search: z.string().optional(),
  radius_km: z.number().min(0.1).max(100).optional(),
  center_lat: z.number().min(-90).max(90).optional(),
  center_lng: z.number().min(-180).max(180).optional(),
})

export const technicianFiltersSchema = z.object({
  status: z.array(z.enum(['available', 'busy', 'offline'])).optional(),
  skills: z.array(z.string()).optional(),
  available_only: z.boolean().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  radius_km: z.number().min(0.1).max(100).optional(),
})

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.record(z.any()).optional(),
})

// Notification validation
export const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.string().min(1, 'Type is required'),
  data: z.record(z.any()).optional(),
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be an image (JPEG, PNG, or WebP)'
    ),
})

// Geocoding validation
export const geocodingSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
})

// Auto-assignment validation
export const autoAssignmentSchema = z.object({
  ticket_id: z.string().uuid('Invalid ticket ID'),
  max_distance_km: z.number().min(0.1).max(50).default(10),
  required_skills: z.array(z.string()).optional(),
})

// Settings validation
export const userSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  location: z.object({
    auto_update: z.boolean().default(true),
    update_interval: z.number().min(10000).max(300000).default(30000),
  }),
  map: z.object({
    default_zoom: z.number().min(1).max(20).default(12),
    show_traffic: z.boolean().default(false),
  }),
})

// Type exports for TypeScript
export type ProfileFormData = z.infer<typeof profileSchema>
export type TechnicianFormData = z.infer<typeof technicianSchema>
export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>
export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>
export type LocationFormData = z.infer<typeof locationSchema>
export type RatingFormData = z.infer<typeof ratingSchema>
export type GeofenceFormData = z.infer<typeof geofenceSchema>
export type TicketFiltersFormData = z.infer<typeof ticketFiltersSchema>
export type TechnicianFiltersFormData = z.infer<typeof technicianFiltersSchema>
export type PaginationFormData = z.infer<typeof paginationSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type NotificationFormData = z.infer<typeof notificationSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type GeocodingFormData = z.infer<typeof geocodingSchema>
export type AutoAssignmentFormData = z.infer<typeof autoAssignmentSchema>
export type UserSettingsFormData = z.infer<typeof userSettingsSchema>
