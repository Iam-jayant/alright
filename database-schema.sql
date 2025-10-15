-- Field Service SaaS MVP Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('manager', 'technician', 'customer');
CREATE TYPE ticket_status AS ENUM ('pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE technician_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'in_progress', 'completed');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians table
CREATE TABLE technicians (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    skills TEXT[] DEFAULT '{}',
    vehicle_info JSONB DEFAULT '{}',
    status technician_status DEFAULT 'offline',
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_number TEXT UNIQUE NOT NULL DEFAULT 'TKT-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    address TEXT NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}',
    priority ticket_priority DEFAULT 'medium',
    status ticket_status DEFAULT 'pending',
    estimated_duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments table
CREATE TABLE assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE NOT NULL,
    status assignment_status DEFAULT 'pending',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    arrived_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (technician location history)
CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2), -- km/h
    heading DECIMAL(5, 2), -- degrees
    accuracy DECIMAL(5, 2), -- meters
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geofences table
CREATE TABLE geofences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    center_lat DECIMAL(10, 8) NOT NULL,
    center_lng DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    entry_logged_at TIMESTAMP WITH TIME ZONE,
    exit_logged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'assignment', 'status_update', 'rating_request', etc.
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_location ON technicians(current_lat, current_lng);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_location ON tickets(lat, lng);
CREATE INDEX idx_assignments_ticket_id ON assignments(ticket_id);
CREATE INDEX idx_assignments_technician_id ON assignments(technician_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_locations_technician_id ON locations(technician_id);
CREATE INDEX idx_locations_recorded_at ON locations(recorded_at);
CREATE INDEX idx_geofences_ticket_id ON geofences(ticket_id);
CREATE INDEX idx_ratings_technician_id ON ratings(technician_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Managers can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

-- Technicians policies
CREATE POLICY "Technicians can view own record" ON technicians FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Technicians can update own record" ON technicians FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Managers can view all technicians" ON technicians FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

-- Tickets policies
CREATE POLICY "Managers can view all tickets" ON tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);
CREATE POLICY "Technicians can view assigned tickets" ON tickets FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assignments a 
        JOIN technicians t ON a.technician_id = t.id 
        WHERE a.ticket_id = tickets.id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "Customers can view own tickets" ON tickets FOR SELECT USING (
    customer_email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Public can view tickets by tracking number" ON tickets FOR SELECT USING (true);

-- Assignments policies
CREATE POLICY "Managers can manage all assignments" ON assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);
CREATE POLICY "Technicians can view own assignments" ON assignments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM technicians t 
        WHERE t.id = assignments.technician_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "Technicians can update own assignments" ON assignments FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM technicians t 
        WHERE t.id = assignments.technician_id AND t.user_id = auth.uid()
    )
);

-- Locations policies
CREATE POLICY "Technicians can manage own locations" ON locations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM technicians t 
        WHERE t.id = locations.technician_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "Managers can view all locations" ON locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

-- Geofences policies
CREATE POLICY "Managers can manage geofences" ON geofences FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);
CREATE POLICY "Technicians can view geofences for assigned tickets" ON geofences FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM assignments a 
        JOIN technicians t ON a.technician_id = t.id 
        WHERE a.ticket_id = geofences.ticket_id AND t.user_id = auth.uid()
    )
);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Customers can create ratings" ON ratings FOR INSERT WITH CHECK (
    customer_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Create functions for common operations

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371000; -- Earth radius in meters
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlng/2) * sin(dlng/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Function to find nearest available technicians
CREATE OR REPLACE FUNCTION find_nearest_technicians(
    ticket_lat DECIMAL,
    ticket_lng DECIMAL,
    required_skills TEXT[],
    max_distance_km DECIMAL DEFAULT 10
) RETURNS TABLE (
    technician_id UUID,
    distance_meters DECIMAL,
    skills TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        calculate_distance(ticket_lat, ticket_lng, t.current_lat, t.current_lng) as distance_meters,
        t.skills
    FROM technicians t
    WHERE t.status = 'available'
    AND t.current_lat IS NOT NULL 
    AND t.current_lng IS NOT NULL
    AND calculate_distance(ticket_lat, ticket_lng, t.current_lat, t.current_lng) <= (max_distance_km * 1000)
    AND (required_skills IS NULL OR t.skills && required_skills)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to create geofence for a ticket
CREATE OR REPLACE FUNCTION create_ticket_geofence(
    p_ticket_id UUID,
    p_radius_meters INTEGER DEFAULT 100
) RETURNS UUID AS $$
DECLARE
    geofence_id UUID;
    ticket_lat DECIMAL;
    ticket_lng DECIMAL;
BEGIN
    -- Get ticket location
    SELECT lat, lng INTO ticket_lat, ticket_lng
    FROM tickets 
    WHERE id = p_ticket_id;
    
    IF ticket_lat IS NULL OR ticket_lng IS NULL THEN
        RAISE EXCEPTION 'Ticket location not found';
    END IF;
    
    -- Create geofence
    INSERT INTO geofences (ticket_id, center_lat, center_lng, radius_meters)
    VALUES (p_ticket_id, ticket_lat, ticket_lng, p_radius_meters)
    RETURNING id INTO geofence_id;
    
    RETURN geofence_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO profiles (id, email, name, role, phone) VALUES
    ('00000000-0000-0000-0000-000000000001', 'manager@alright.com', 'John Manager', 'manager', '+1234567890'),
    ('00000000-0000-0000-0000-000000000002', 'tech1@alright.com', 'Mike Technician', 'technician', '+1234567891'),
    ('00000000-0000-0000-0000-000000000003', 'tech2@alright.com', 'Sarah Technician', 'technician', '+1234567892'),
    ('00000000-0000-0000-0000-000000000004', 'customer@alright.com', 'Jane Customer', 'customer', '+1234567893');

INSERT INTO technicians (user_id, skills, vehicle_info, status, current_lat, current_lng) VALUES
    ('00000000-0000-0000-0000-000000000002', '{"plumbing", "electrical"}', '{"type": "van", "model": "Ford Transit", "plate": "ABC123"}', 'available', 25.2048, 55.2708),
    ('00000000-0000-0000-0000-000000000003', '{"hvac", "plumbing"}', '{"type": "truck", "model": "Chevrolet Silverado", "plate": "XYZ789"}', 'available', 25.2148, 55.2808);

INSERT INTO tickets (customer_name, customer_email, customer_phone, address, lat, lng, category, description, priority, status) VALUES
    ('Alice Johnson', 'alice@example.com', '+1234567894', '206 Beach Blvd, Dubai', 25.2048, 55.2708, 'plumbing', 'Leaky faucet in kitchen', 'medium', 'pending'),
    ('Bob Smith', 'bob@example.com', '+1234567895', '102 Collins Ave, Dubai', 25.2148, 55.2808, 'electrical', 'Power outlet not working', 'high', 'pending'),
    ('Carol Davis', 'carol@example.com', '+1234567896', '305 Marina Walk, Dubai', 25.2248, 55.2908, 'hvac', 'AC not cooling properly', 'low', 'pending');
