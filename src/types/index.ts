// Database types matching the schema
export type UserRole = 'manager' | 'technician' | 'customer'
export type TicketStatus = 'pending' | 'assigned' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TechnicianStatus = 'available' | 'busy' | 'offline'
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed'

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Technician {
  id: string
  user_id: string
  skills: string[]
  vehicle_info: Record<string, any>
  status: TechnicianStatus
  current_lat?: number
  current_lng?: number
  last_seen: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Ticket {
  id: string
  tracking_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  address: string
  lat?: number
  lng?: number
  category: string
  description: string
  image_urls: string[]
  priority: TicketPriority
  status: TicketStatus
  estimated_duration?: number
  created_at: string
  updated_at: string
  assignment?: Assignment
}

export interface Assignment {
  id: string
  ticket_id: string
  technician_id: string
  status: AssignmentStatus
  assigned_at: string
  accepted_at?: string
  started_at?: string
  arrived_at?: string
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
  technician?: Technician
  ticket?: Ticket
}

export interface Location {
  id: string
  technician_id: string
  lat: number
  lng: number
  speed?: number
  heading?: number
  accuracy?: number
  recorded_at: string
}

export interface Geofence {
  id: string
  ticket_id: string
  center_lat: number
  center_lng: number
  radius_meters: number
  entry_logged_at?: string
  exit_logged_at?: string
  created_at: string
}

export interface Rating {
  id: string
  ticket_id: string
  technician_id: string
  customer_email: string
  rating: number
  comment?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  data: Record<string, any>
  read_at?: string
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Form types
export interface CreateTicketForm {
  customer_name: string
  customer_email: string
  customer_phone?: string
  address: string
  category: string
  description: string
  priority: TicketPriority
  images?: File[]
}

export interface CreateAssignmentForm {
  ticket_id: string
  technician_id: string
  notes?: string
}

export interface UpdateLocationForm {
  lat: number
  lng: number
  speed?: number
  heading?: number
  accuracy?: number
}

export interface CreateRatingForm {
  ticket_id: string
  technician_id: string
  customer_email: string
  rating: number
  comment?: string
}

// Filter types
export interface TicketFilters {
  status?: TicketStatus[]
  priority?: TicketPriority[]
  category?: string[]
  date_from?: string
  date_to?: string
  search?: string
  radius_km?: number
  center_lat?: number
  center_lng?: number
}

export interface TechnicianFilters {
  status?: TechnicianStatus[]
  skills?: string[]
  available_only?: boolean
  lat?: number
  lng?: number
  radius_km?: number
}

// Map types
export interface MapMarker {
  id: string
  lat: number
  lng: number
  type: 'ticket' | 'technician'
  data: Ticket | Technician
  status?: string
}

export interface MapRoute {
  from: { lat: number; lng: number }
  to: { lat: number; lng: number }
  distance?: number
  duration?: number
  polyline?: string
}

// Statistics types
export interface DashboardStats {
  total_tickets: number
  active_assignments: number
  completed_today: number
  completion_rate: number
  technician_utilization: number
}

export interface TicketStats {
  by_status: Record<TicketStatus, number>
  by_priority: Record<TicketPriority, number>
  by_category: Record<string, number>
  completion_trend: Array<{ date: string; count: number }>
}

// Realtime types
export interface RealtimeEvent {
  type: 'ticket_created' | 'ticket_updated' | 'assignment_created' | 'location_updated' | 'geofence_entered' | 'geofence_exited'
  data: any
  timestamp: string
}
