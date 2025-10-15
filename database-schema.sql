CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TYPE user_role AS ENUM ('manager', 'technician', 'customer');
CREATE TYPE ticket_status AS ENUM ('pending', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE technician_status AS ENUM ('available', 'busy', 'offline');
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'in_progress', 'completed');
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
    estimated_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    accuracy DECIMAL(5, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE NOT NULL,
    customer_email TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technicians_updated_at BEFORE UPDATE ON technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Managers can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

CREATE POLICY "Technicians can view own record" ON technicians FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Technicians can update own record" ON technicians FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Managers can view all technicians" ON technicians FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

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

CREATE POLICY "Technicians can manage own locations" ON locations FOR ALL USING (
    EXISTS (
        SELECT 1 FROM technicians t 
        WHERE t.id = locations.technician_id AND t.user_id = auth.uid()
    )
);
CREATE POLICY "Managers can view all locations" ON locations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'manager')
);

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

CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Customers can create ratings" ON ratings FOR INSERT WITH CHECK (
    customer_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371000;
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

CREATE OR REPLACE FUNCTION create_ticket_geofence(
    p_ticket_id UUID,
    p_radius_meters INTEGER DEFAULT 100
) RETURNS UUID AS $$
DECLARE
    geofence_id UUID;
    ticket_lat DECIMAL;
    ticket_lng DECIMAL;
BEGIN
    SELECT lat, lng INTO ticket_lat, ticket_lng
    FROM tickets 
    WHERE id = p_ticket_id;
    
    IF ticket_lat IS NULL OR ticket_lng IS NULL THEN
        RAISE EXCEPTION 'Ticket location not found';
    END IF;
    
    INSERT INTO geofences (ticket_id, center_lat, center_lng, radius_meters)
    VALUES (p_ticket_id, ticket_lat, ticket_lng, p_radius_meters)
    RETURNING id INTO geofence_id;
    
    RETURN geofence_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
    new_tracking_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_tracking_number := 'TKT-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || LPAD(counter::TEXT, 3, '0');
        
        IF NOT EXISTS (SELECT 1 FROM tickets WHERE tracking_number = new_tracking_number) THEN
            RETURN new_tracking_number;
        END IF;
        
        counter := counter + 1;
        
        IF counter > 999 THEN
            RAISE EXCEPTION 'Unable to generate unique tracking number';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

INSERT INTO tickets (tracking_number, customer_name, customer_email, customer_phone, address, lat, lng, category, description, priority, status) VALUES
    ('TKT-NAG-001', 'Arjun Singh', 'arjun.singh@gmail.com', '+91-9876543213', 'Plot 45, Civil Lines, Nagpur', 21.1458, 79.0882, 'plumbing', 'Kitchen tap is leaking continuously', 'medium', 'pending'),
    ('TKT-NAG-002', 'Sneha Reddy', 'sneha.reddy@gmail.com', '+91-9876543214', 'Flat 302, Ramdaspeth, Nagpur', 21.1558, 79.0982, 'electrical', 'Power socket not working in bedroom', 'high', 'pending'),
    ('TKT-NAG-003', 'Vikram Joshi', 'vikram.joshi@gmail.com', '+91-9876543215', 'House 12, Dharampeth, Nagpur', 21.1358, 79.0782, 'hvac', 'AC not cooling properly in living room', 'low', 'pending'),
    ('TKT-NAG-004', 'Kavita Desai', 'kavita.desai@gmail.com', '+91-9876543216', 'Shop 8, Sadar Bazaar, Nagpur', 21.1658, 79.1082, 'appliance_repair', 'Washing machine not starting', 'medium', 'pending'),
    ('TKT-NAG-005', 'Rohit Agarwal', 'rohit.agarwal@gmail.com', '+91-9876543217', 'Office 15, IT Park, Nagpur', 21.1258, 79.0682, 'electrical', 'Complete power failure in office', 'urgent', 'pending');
