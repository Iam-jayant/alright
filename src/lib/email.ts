import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface TicketConfirmationEmail {
  customerName: string
  customerEmail: string
  trackingNumber: string
  serviceType: string
  address: string
  priority: string
  estimatedTime?: string
}

export interface AssignmentNotificationEmail {
  technicianName: string
  technicianEmail: string
  ticketNumber: string
  customerName: string
  address: string
  serviceType: string
  priority: string
  estimatedTime?: string
}

export interface CompletionNotificationEmail {
  customerName: string
  customerEmail: string
  ticketNumber: string
  technicianName: string
  serviceType: string
  completedAt: string
  ratingLink: string
}

export class EmailService {
  private static fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@alright.com'
  private static fromName = 'Alright Field Service'

  static async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.warn('SendGrid API key not configured, skipping email')
        return false
      }

      const msg = {
        to: template.to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: template.subject,
        html: template.html,
        text: template.text || this.stripHtml(template.html)
      }

      await sgMail.send(msg)
      console.log(`Email sent successfully to ${template.to}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  static async sendTicketConfirmation(data: TicketConfirmationEmail): Promise<boolean> {
    const subject = `Service Request Confirmed - ${data.trackingNumber}`
    const html = this.generateTicketConfirmationHtml(data)
    
    return this.sendEmail({
      to: data.customerEmail,
      subject,
      html
    })
  }

  static async sendAssignmentNotification(data: AssignmentNotificationEmail): Promise<boolean> {
    const subject = `New Assignment - ${data.ticketNumber}`
    const html = this.generateAssignmentNotificationHtml(data)
    
    return this.sendEmail({
      to: data.technicianEmail,
      subject,
      html
    })
  }

  static async sendCompletionNotification(data: CompletionNotificationEmail): Promise<boolean> {
    const subject = `Service Completed - ${data.ticketNumber}`
    const html = this.generateCompletionNotificationHtml(data)
    
    return this.sendEmail({
      to: data.customerEmail,
      subject,
      html
    })
  }

  private static generateTicketConfirmationHtml(data: TicketConfirmationEmail): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FFD12D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .tracking-number { background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
          .btn { display: inline-block; background: #FFD12D; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .priority-urgent { color: #dc2626; font-weight: bold; }
          .priority-high { color: #ea580c; font-weight: bold; }
          .priority-medium { color: #d97706; font-weight: bold; }
          .priority-low { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #000;">⚡ Alright</h1>
            <p style="margin: 5px 0 0 0; color: #000;">Field Service Management</p>
          </div>
          
          <div class="content">
            <h2>Service Request Confirmed!</h2>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for choosing Alright for your service needs. Your request has been received and will be processed shortly.</p>
            
            <div class="tracking-number">
              <h3 style="margin: 0 0 10px 0;">Tracking Number</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 0; font-family: monospace;">${data.trackingNumber}</p>
            </div>
            
            <h3>Service Details</h3>
            <div class="info-row">
              <strong>Service Type:</strong>
              <span>${data.serviceType}</span>
            </div>
            <div class="info-row">
              <strong>Priority:</strong>
              <span class="priority-${data.priority}">${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}</span>
            </div>
            <div class="info-row">
              <strong>Address:</strong>
              <span>${data.address}</span>
            </div>
            ${data.estimatedTime ? `
            <div class="info-row">
              <strong>Estimated Time:</strong>
              <span>${data.estimatedTime}</span>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/track/${data.trackingNumber}" class="btn">
                Track Your Request
              </a>
            </div>
            
            <p>We'll keep you updated on the progress of your service request. You can track the status anytime using the link above.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              © 2024 Alright Field Service Management. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateAssignmentNotificationHtml(data: AssignmentNotificationEmail): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FFD12D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .assignment-box { background: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .btn { display: inline-block; background: #FFD12D; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .priority-urgent { color: #dc2626; font-weight: bold; }
          .priority-high { color: #ea580c; font-weight: bold; }
          .priority-medium { color: #d97706; font-weight: bold; }
          .priority-low { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #000;">⚡ Alright</h1>
            <p style="margin: 5px 0 0 0; color: #000;">Field Service Management</p>
          </div>
          
          <div class="content">
            <h2>New Assignment</h2>
            <p>Dear ${data.technicianName},</p>
            <p>You have been assigned a new service request. Please review the details below and prepare for the job.</p>
            
            <div class="assignment-box">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">Assignment Details</h3>
              <div class="info-row">
                <strong>Ticket Number:</strong>
                <span style="font-family: monospace; font-weight: bold;">${data.ticketNumber}</span>
              </div>
              <div class="info-row">
                <strong>Customer:</strong>
                <span>${data.customerName}</span>
              </div>
              <div class="info-row">
                <strong>Service Type:</strong>
                <span>${data.serviceType}</span>
              </div>
              <div class="info-row">
                <strong>Priority:</strong>
                <span class="priority-${data.priority}">${data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}</span>
              </div>
              <div class="info-row">
                <strong>Address:</strong>
                <span>${data.address}</span>
              </div>
              ${data.estimatedTime ? `
              <div class="info-row">
                <strong>Estimated Time:</strong>
                <span>${data.estimatedTime}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/technician" class="btn">
                View Assignment
              </a>
            </div>
            
            <p>Please log in to the technician portal to accept this assignment and start your work.</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              © 2024 Alright Field Service Management. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateCompletionNotificationHtml(data: CompletionNotificationEmail): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .completion-box { background: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10B981; }
          .btn { display: inline-block; background: #FFD12D; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #fff;">✅ Service Completed</h1>
            <p style="margin: 5px 0 0 0; color: #fff;">Alright Field Service</p>
          </div>
          
          <div class="content">
            <h2>Service Request Completed!</h2>
            <p>Dear ${data.customerName},</p>
            <p>Great news! Your service request has been completed successfully.</p>
            
            <div class="completion-box">
              <h3 style="margin: 0 0 15px 0; color: #065f46;">Service Summary</h3>
              <div class="info-row">
                <strong>Ticket Number:</strong>
                <span style="font-family: monospace; font-weight: bold;">${data.ticketNumber}</span>
              </div>
              <div class="info-row">
                <strong>Service Type:</strong>
                <span>${data.serviceType}</span>
              </div>
              <div class="info-row">
                <strong>Technician:</strong>
                <span>${data.technicianName}</span>
              </div>
              <div class="info-row">
                <strong>Completed On:</strong>
                <span>${new Date(data.completedAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.ratingLink}" class="btn">
                Rate Your Experience
              </a>
            </div>
            
            <p>We hope you're satisfied with our service! Your feedback helps us improve and serve you better.</p>
            <p>Thank you for choosing Alright!</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">
              © 2024 Alright Field Service Management. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }
}
