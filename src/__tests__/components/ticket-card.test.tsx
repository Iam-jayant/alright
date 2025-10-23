import { render, screen } from '@testing-library/react'
import { TicketCard } from '@/components/cards/ticket-card'

// Mock the ticket data
const mockTicket = {
  id: '1',
  tracking_number: 'TKT-NAG-123456-ABC',
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+91 98765 43210',
  address: '123 Main Street, Mumbai',
  lat: 19.0760,
  lng: 72.8777,
  category: 'AC Repair & Maintenance',
  description: 'AC not cooling properly',
  priority: 'high',
  status: 'pending',
  created_at: '2024-01-01T10:00:00Z',
  assigned_technician: null
}

describe('TicketCard', () => {
  it('renders ticket information correctly', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    expect(screen.getByText('TKT-NAG-123456-ABC')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('AC Repair & Maintenance')).toBeInTheDocument()
    expect(screen.getByText('AC not cooling properly')).toBeInTheDocument()
  })

  it('displays correct priority badge', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    const priorityBadge = screen.getByText('High')
    expect(priorityBadge).toBeInTheDocument()
    expect(priorityBadge).toHaveClass('text-orange-600')
  })

  it('displays correct status badge', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    const statusBadge = screen.getByText('Pending')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('shows customer contact information', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument()
  })

  it('displays address correctly', () => {
    render(<TicketCard ticket={mockTicket} />)
    
    expect(screen.getByText('123 Main Street, Mumbai')).toBeInTheDocument()
  })
})

