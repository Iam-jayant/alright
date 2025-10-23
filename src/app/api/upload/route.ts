import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting for file uploads
  const rateLimitResponse = rateLimit(rateLimitConfigs.assignments)(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createClient()
    const formData = await request.formData()
    const file = formData.get('file') as File
    const ticketId = formData.get('ticketId') as string
    const type = formData.get('type') as string // 'before' or 'after'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 })
    }

    if (!type || !['before', 'after'].includes(type)) {
      return NextResponse.json({ error: 'Type must be "before" or "after"' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${ticketId}_${type}_${timestamp}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('ticket-images')
      .getPublicUrl(fileName)

    // Update ticket with image URL
    const updateField = type === 'before' ? 'before_image_url' : 'after_image_url'
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ [updateField]: publicUrl })
      .eq('id', ticketId)

    if (updateError) {
      console.error('Error updating ticket with image URL:', updateError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: uploadData.path
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

