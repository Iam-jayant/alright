// App constants
export const APP_NAME = 'Alright'
export const APP_DESCRIPTION = 'Field Service Management Platform'

// API endpoints
export const API_ROUTES = {
  TICKETS: '/api/tickets',
  ASSIGNMENTS: '/api/assignments',
  TECHNICIANS: '/api/technicians',
  LOCATIONS: '/api/locations',
  RATINGS: '/api/ratings',
  GEOCODING: '/api/geocoding',
  NOTIFICATIONS: '/api/notifications',
} as const

// External API URLs
export const EXTERNAL_APIS = {
  NOMINATIM: 'https://nominatim.openstreetmap.org',
  OPENROUTE: 'https://api.openrouteservice.org',
} as const

// Map configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 21.1458, lng: 79.0882 }, // Nagpur, India
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 8,
  CLUSTER_RADIUS: 50,
} as const

// Geofencing configuration
export const GEOFENCE_CONFIG = {
  DEFAULT_RADIUS_METERS: 100,
  MIN_RADIUS_METERS: 50,
  MAX_RADIUS_METERS: 500,
  CHECK_INTERVAL_MS: 30000, // 30 seconds
} as const

// Location tracking configuration
export const LOCATION_CONFIG = {
  UPDATE_INTERVAL_MS: 30000, // 30 seconds
  HIGH_ACCURACY: true,
  MAX_AGE: 60000, // 1 minute
  TIMEOUT: 10000, // 10 seconds
  ENABLE_HIGH_ACCURACY: true,
} as const

// Auto-assignment configuration
export const AUTO_ASSIGN_CONFIG = {
  MAX_DISTANCE_KM: 10,
  SKILL_MATCH_REQUIRED: true,
  AVAILABILITY_REQUIRED: true,
  TIMEOUT_MINUTES: 5, // Auto-accept after 5 minutes
} as const

// Pagination configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// File upload configuration
export const FILE_CONFIG = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES_PER_TICKET: 5,
} as const

// Notification configuration
export const NOTIFICATION_CONFIG = {
  TYPES: {
    ASSIGNMENT: 'assignment',
    STATUS_UPDATE: 'status_update',
    RATING_REQUEST: 'rating_request',
    SYSTEM_ALERT: 'system_alert',
  },
  PERSIST_DAYS: 30,
} as const

// Ticket categories (Indian context)
export const TICKET_CATEGORIES = [
  'plumbing',
  'electrical',
  'hvac',
  'appliance_repair',
  'carpentry',
  'painting',
  'cleaning',
  'security',
  'water_tank',
  'inverter_repair',
  'gas_connection',
  'other',
] as const

// Technician skills (Indian context)
export const TECHNICIAN_SKILLS = [
  'plumbing',
  'electrical',
  'hvac',
  'appliance_repair',
  'carpentry',
  'painting',
  'cleaning',
  'security',
  'water_tank',
  'inverter_repair',
  'gas_connection',
  'general_repair',
] as const

// Vehicle types (Indian context)
export const VEHICLE_TYPES = [
  'bike',
  'scooter',
  'auto_rickshaw',
  'car',
  'van',
  'truck',
] as const

// Status mappings
export const STATUS_LABELS = {
  // Ticket statuses
  pending: 'Pending',
  assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  
  // Technician statuses
  available: 'Available',
  busy: 'Busy',
  offline: 'Offline',
  
  // Assignment statuses
  accepted: 'Accepted',
  rejected: 'Rejected',
} as const

// Priority labels
export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
} as const

// Color schemes
export const COLORS = {
  PRIMARY: {
    YELLOW: '#FFD12D',
    GREY: '#D9D9D9',
    BLACK: '#000000',
  },
  STATUS: {
    ON_THE_WAY: '#FFD12D',
    PENDING: '#3B82F6',
    COMPLETED: '#10B981',
    ASSIGNED: '#F59E0B',
  },
  PRIORITY: {
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#EF4444',
    URGENT: '#DC2626',
  },
} as const

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  LOCATION_DENIED: 'Location access denied. Please enable location services.',
  LOCATION_UNAVAILABLE: 'Location is currently unavailable.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  TECHNICIAN_UNAVAILABLE: 'No technicians available in your area.',
  ASSIGNMENT_FAILED: 'Failed to assign technician. Please try again.',
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  TICKET_CREATED: 'Ticket created successfully!',
  TICKET_UPDATED: 'Ticket updated successfully!',
  ASSIGNMENT_CREATED: 'Technician assigned successfully!',
  ASSIGNMENT_ACCEPTED: 'Assignment accepted!',
  LOCATION_UPDATED: 'Location updated successfully!',
  RATING_SUBMITTED: 'Thank you for your feedback!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const

// Realtime channels
export const REALTIME_CHANNELS = {
  TICKETS: 'tickets',
  ASSIGNMENTS: 'assignments',
  LOCATIONS: 'locations',
  NOTIFICATIONS: 'notifications',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  MAP_SETTINGS: 'map_settings',
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME: 'theme',
} as const
