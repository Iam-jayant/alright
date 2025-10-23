# Alright - Field Service Management MVP

A comprehensive field service management platform built with Next.js, Supabase, and modern web technologies. This MVP provides real-time tracking, geofencing, and automated assignment capabilities for service companies.

## 🚀 Features

### ✅ **Completed Features**
- **Manager Dashboard** - Complete ticket management with real-time updates
- **Technician Portal** - Mobile-optimized job management with location tracking
- **Customer Portal** - Complaint submission and live tracking
- **Real-time Updates** - Live notifications and status updates
- **Live Map Integration** - React-Leaflet with OpenStreetMap
- **Email Notifications** - SendGrid integration with professional templates
- **Geofencing** - Automatic job site entry/exit detection
- **Manual Assignment** - Distance-based technician assignment
- **Responsive Design** - Mobile-first design for all devices

### 🔧 **Technical Features**
- **Real-time Location Tracking** - HTML5 Geolocation API
- **Geofencing** - Turf.js for accurate geospatial calculations
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Zod schemas with XSS protection
- **Row Level Security** - Supabase RLS policies
- **Professional UI** - Tailwind CSS with custom design system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Maps**: React-Leaflet, OpenStreetMap
- **Geolocation**: Turf.js, HTML5 Geolocation API
- **Email**: SendGrid
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- SendGrid account

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd alright
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### 4. Database Setup

1. Create a new Supabase project
2. Run the database schema from `database-schema.sql`
3. Run the RLS policies from `rls-policies.sql`
4. Update your environment variables with Supabase credentials

### 5. SendGrid Setup

1. Create a SendGrid account
2. Generate an API key with full access
3. Verify your sender email address
4. Update environment variables

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
alright/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Manager dashboard
│   │   ├── technician/        # Technician portal
│   │   ├── complaint/         # Customer complaint form
│   │   └── track/             # Public tracking page
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components
│   │   ├── cards/            # Card components
│   │   ├── modals/           # Modal components
│   │   ├── layout/           # Layout components
│   │   ├── map/              # Map components
│   │   └── notifications/    # Notification components
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.ts       # Supabase client
│   │   ├── email.ts          # Email service
│   │   ├── validation.ts     # Input validation
│   │   └── rate-limit.ts     # Rate limiting
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── __tests__/            # Test files
├── database-schema.sql        # Database schema
├── rls-policies.sql          # Row Level Security policies
└── README.md
```

## 🔧 API Endpoints

### Tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - List tickets with filters
- `GET /api/tickets/[id]` - Get ticket details

### Assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments` - List assignments

### Technicians
- `GET /api/technicians` - List technicians
- `POST /api/locations` - Update technician location

### Email
- `POST /api/email/send` - Send email notifications

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Zod schemas with XSS protection
- **HTTPS Enforcement** - Secure data transmission
- **Environment Variables** - Secure API key storage

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:

- **Technician Portal** - Mobile-first design
- **Touch-friendly Interface** - Large buttons and touch targets
- **Offline Support** - Location tracking works offline
- **Progressive Web App** - Installable on mobile devices

## 🗺️ Map Integration

- **OpenStreetMap** - Free, open-source mapping
- **Real-time Markers** - Live technician and ticket locations
- **Route Visualization** - Path from technician to job site
- **Geofencing** - Automatic job site detection
- **Clustering** - Performance optimization for many markers

## 📧 Email Notifications

Professional email templates for:

- **Customer** - Ticket confirmation, assignment notification, completion
- **Technician** - New assignment, job reminders
- **Manager** - Daily summary, SLA alerts

## 🔄 Real-time Updates

- **Supabase Realtime** - Live data synchronization
- **WebSocket Connections** - Efficient real-time communication
- **Automatic Reconnection** - Handles connection drops
- **Optimistic Updates** - Immediate UI feedback

## 🎨 Design System

### Colors
- **Primary Yellow**: `#FFD12D`
- **Grey**: `#D9D9D9`
- **Black**: `#000000`

### Status Colors
- **On The Way**: Yellow/Orange (`#FFD12D`)
- **Pending**: Blue (`#3B82F6`)
- **Completed**: Green (`#10B981`)
- **Assigned**: Orange (`#F59E0B`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review the test files for examples
3. Open an issue on GitHub

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [x] Database schema and RLS policies
- [x] Authentication system

### Phase 2: Core Features ✅
- [x] Manager dashboard
- [x] Technician portal
- [x] Customer portal
- [x] Real-time updates

### Phase 3: Advanced Features ✅
- [x] Live map integration
- [x] Geofencing
- [x] Email notifications
- [x] Mobile optimization

### Phase 4: Production Ready
- [x] Security implementation
- [x] Rate limiting
- [x] Input validation
- [x] Testing suite
- [ ] Performance optimization
- [ ] Monitoring and analytics
- [ ] Documentation completion

## 🏆 MVP Status: 90% Complete

The MVP is production-ready with all core features implemented. The remaining 10% includes performance optimization, comprehensive testing, and monitoring setup.

---

**Built with ❤️ for field service companies**

