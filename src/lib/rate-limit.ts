import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string
  skipSuccessfulRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {}

export function rateLimit(config: RateLimitConfig) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const key = `rate_limit:${ip}`
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up expired entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    })

    // Get or create rate limit entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }

    // Increment counter
    store[key].count++

    // Check if limit exceeded
    if (store[key].count > config.maxRequests) {
      return NextResponse.json(
        { 
          error: config.message || 'Too many requests, please try again later',
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((store[key].resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.maxRequests - store[key].count).toString(),
            'X-RateLimit-Reset': store[key].resetTime.toString()
          }
        }
      )
    }

    return null // No rate limit exceeded
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict rate limiting for ticket creation (prevent spam)
  ticketCreation: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 tickets per 15 minutes
    message: 'Too many ticket requests. Please wait before submitting another request.'
  },
  
  // Moderate rate limiting for general API calls
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many requests. Please slow down.'
  },
  
  // Strict rate limiting for location updates
  locationUpdates: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 location updates per minute
    message: 'Too many location updates. Please slow down.'
  },
  
  // Very strict rate limiting for assignment operations
  assignments: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 assignments per 5 minutes
    message: 'Too many assignment requests. Please wait before making another assignment.'
  },
  
  // Rate limiting for email sending
  emailSending: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 emails per minute
    message: 'Too many email requests. Please wait before sending another email.'
  }
}

// Helper function to apply rate limiting to API routes
export function withRateLimit(config: RateLimitConfig) {
  return function(handler: Function) {
    return async function(req: NextRequest, ...args: any[]) {
      const rateLimitResponse = rateLimit(config)(req)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
      return handler(req, ...args)
    }
  }
}

