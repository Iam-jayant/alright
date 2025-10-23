import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// =============================================
// VALIDATION SCHEMAS
// =============================================

// Email validation with proper regex
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(255, 'Email too long')

// Phone validation for Indian numbers
export const phoneSchema = z
  .string()
  .regex(/^(\+91|91)?[6-9]\d{9}$/, 'Invalid Indian phone number')
  .min(10, 'Phone number too short')
  .max(15, 'Phone number too long')

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

// Address validation
export const addressSchema = z
  .string()
  .min(10, 'Address must be at least 10 characters')
  .max(500, 'Address too long')

// Description validation
export const descriptionSchema = z
  .string()
  .min(10, 'Description must be at least 10 characters')
  .max(2000, 'Description too long')

// Priority validation
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])

// Status validation
export const statusSchema = z.enum(['pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled'])

// Category validation
export const categorySchema = z.enum([
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
])

// Rating validation
export const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5')

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Coordinates validation
export const coordinateSchema = z
  .number()
  .min(-90, 'Invalid latitude')
  .max(90, 'Invalid latitude')

export const longitudeSchema = z
  .number()
  .min(-180, 'Invalid longitude')
  .max(180, 'Invalid longitude')

// =============================================
// COMPOSITE SCHEMAS
// =============================================

// Ticket creation schema
export const ticketCreateSchema = z.object({
  customer_name: nameSchema,
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  address: addressSchema,
  lat: coordinateSchema,
  lng: longitudeSchema,
  category: categorySchema,
  description: descriptionSchema,
  priority: prioritySchema,
  image_url: z.string().url().optional()
})

// Ticket update schema
export const ticketUpdateSchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  description: descriptionSchema.optional(),
  image_url: z.string().url().optional()
})

// Assignment creation schema
export const assignmentCreateSchema = z.object({
  ticket_id: uuidSchema,
  technician_id: uuidSchema,
  notes: z.string().max(1000, 'Notes too long').optional()
})

// Location update schema
export const locationUpdateSchema = z.object({
  technician_id: uuidSchema,
  lat: coordinateSchema,
  lng: longitudeSchema,
  speed: z.number().min(0).max(200).optional(),
  heading: z.number().min(0).max(360).optional()
})

// Rating creation schema
export const ratingCreateSchema = z.object({
  ticket_id: uuidSchema,
  technician_id: uuidSchema.optional(),
  rating: ratingSchema,
  comment: z.string().max(500, 'Comment too long').optional()
})

// User profile schema
export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  role: z.enum(['manager', 'technician', 'customer']),
  avatar_url: z.string().url().optional()
})

// =============================================
// SANITIZATION FUNCTIONS
// =============================================

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// Sanitize text input
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Sanitize file name
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 100) // Limit length
}

// =============================================
// VALIDATION HELPERS
// =============================================

// Validate and sanitize input
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files are allowed (JPEG, PNG, GIF, WebP)' }
  }

  // Check file name
  const sanitizedName = sanitizeFileName(file.name)
  if (sanitizedName !== file.name) {
    return { valid: false, error: 'Invalid file name' }
  }

  return { valid: true }
}

// Validate coordinates
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  )
}

// =============================================
// API RESPONSE HELPERS
// =============================================

export function createValidationErrorResponse(errors: string[]) {
  return {
    error: 'Validation failed',
    details: errors,
    status: 400
  }
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message
  }
}

// =============================================
// SECURITY HELPERS
// =============================================

// Check if string contains malicious content
export function containsMaliciousContent(text: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /<style/i
  ]

  return maliciousPatterns.some(pattern => pattern.test(text))
}

// Validate and sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return sanitizeText(query)
    .substring(0, 100) // Limit length
    .replace(/[^\w\s]/g, '') // Remove special characters
}

