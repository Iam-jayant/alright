import { NextResponse } from 'next/server'
import { EmailService } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or data' }, { status: 400 })
    }

    let success = false

    switch (type) {
      case 'ticket_confirmation':
        success = await EmailService.sendTicketConfirmation(data)
        break
      case 'assignment_notification':
        success = await EmailService.sendAssignmentNotification(data)
        break
      case 'completion_notification':
        success = await EmailService.sendCompletionNotification(data)
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({ message: 'Email sent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
