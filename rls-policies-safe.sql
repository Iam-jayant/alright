-- Safe RLS Policies Setup for Alright Field Service Management
-- This script only creates policies that don't already exist

-- =============================================
-- ENABLE RLS ON ALL TABLES (safe to run multiple times)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE POLICIES ONLY IF THEY DON'T EXIST
-- =============================================

-- PROFILES TABLE POLICIES
DO $$ 
BEGIN
    -- Managers can view all profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Managers can view all profiles" ON profiles
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Users can view own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Users can update own profile
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Allow profile creation
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow profile creation' AND tablename = 'profiles') THEN
        CREATE POLICY "Allow profile creation" ON profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- TECHNICIANS TABLE POLICIES
DO $$ 
BEGIN
    -- Managers can view all technicians
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all technicians' AND tablename = 'technicians') THEN
        CREATE POLICY "Managers can view all technicians" ON technicians
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Technicians can view own data
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can view own data' AND tablename = 'technicians') THEN
        CREATE POLICY "Technicians can view own data" ON technicians
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Technicians can update own data
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can update own data' AND tablename = 'technicians') THEN
        CREATE POLICY "Technicians can update own data" ON technicians
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Allow technician creation
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow technician creation' AND tablename = 'technicians') THEN
        CREATE POLICY "Allow technician creation" ON technicians
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- TICKETS TABLE POLICIES
DO $$ 
BEGIN
    -- Managers can view all tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all tickets' AND tablename = 'tickets') THEN
        CREATE POLICY "Managers can view all tickets" ON tickets
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can insert tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can insert tickets' AND tablename = 'tickets') THEN
        CREATE POLICY "Managers can insert tickets" ON tickets
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can update tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can update tickets' AND tablename = 'tickets') THEN
        CREATE POLICY "Managers can update tickets" ON tickets
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Customers can view own tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view own tickets' AND tablename = 'tickets') THEN
        CREATE POLICY "Customers can view own tickets" ON tickets
            FOR SELECT USING (
                customer_email = (
                    SELECT email FROM profiles 
                    WHERE id = auth.uid()
                )
            );
    END IF;

    -- Public can view tickets by tracking
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view tickets by tracking' AND tablename = 'tickets') THEN
        CREATE POLICY "Public can view tickets by tracking" ON tickets
            FOR SELECT USING (true);
    END IF;

    -- Allow public ticket creation
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public ticket creation' AND tablename = 'tickets') THEN
        CREATE POLICY "Allow public ticket creation" ON tickets
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- ASSIGNMENTS TABLE POLICIES
DO $$ 
BEGIN
    -- Managers can view all assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Managers can view all assignments" ON assignments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can create assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can create assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Managers can create assignments" ON assignments
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can update assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can update assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Managers can update assignments" ON assignments
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Technicians can view own assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can view own assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Technicians can view own assignments" ON assignments
            FOR SELECT USING (auth.uid() = technician_id);
    END IF;

    -- Technicians can update own assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can update own assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Technicians can update own assignments" ON assignments
            FOR UPDATE USING (auth.uid() = technician_id);
    END IF;

    -- Customers can view ticket assignments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can view ticket assignments' AND tablename = 'assignments') THEN
        CREATE POLICY "Customers can view ticket assignments" ON assignments
            FOR SELECT USING (
                ticket_id IN (
                    SELECT id FROM tickets 
                    WHERE customer_email = (
                        SELECT email FROM profiles 
                        WHERE id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- LOCATIONS TABLE POLICIES
DO $$ 
BEGIN
    -- Technicians can insert own locations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can insert own locations' AND tablename = 'locations') THEN
        CREATE POLICY "Technicians can insert own locations" ON locations
            FOR INSERT WITH CHECK (auth.uid() = technician_id);
    END IF;

    -- Managers can view all locations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all locations' AND tablename = 'locations') THEN
        CREATE POLICY "Managers can view all locations" ON locations
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Technicians can view own locations
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can view own locations' AND tablename = 'locations') THEN
        CREATE POLICY "Technicians can view own locations" ON locations
            FOR SELECT USING (auth.uid() = technician_id);
    END IF;
END $$;

-- GEOFENCES TABLE POLICIES
DO $$ 
BEGIN
    -- Managers can view all geofences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can view all geofences' AND tablename = 'geofences') THEN
        CREATE POLICY "Managers can view all geofences" ON geofences
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can create geofences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can create geofences' AND tablename = 'geofences') THEN
        CREATE POLICY "Managers can create geofences" ON geofences
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Managers can update geofences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Managers can update geofences' AND tablename = 'geofences') THEN
        CREATE POLICY "Managers can update geofences" ON geofences
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM profiles p 
                    WHERE p.id = auth.uid() 
                    AND p.role = 'manager'
                )
            );
    END IF;

    -- Technicians can view assignment geofences
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Technicians can view assignment geofences' AND tablename = 'geofences') THEN
        CREATE POLICY "Technicians can view assignment geofences" ON geofences
            FOR SELECT USING (
                ticket_id IN (
                    SELECT ticket_id FROM assignments 
                    WHERE technician_id = auth.uid()
                )
            );
    END IF;
END $$;

-- RATINGS TABLE POLICIES
DO $$ 
BEGIN
    -- Everyone can view ratings
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can view ratings' AND tablename = 'ratings') THEN
        CREATE POLICY "Everyone can view ratings" ON ratings
            FOR SELECT USING (true);
    END IF;

    -- Customers can rate their tickets
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can rate their tickets' AND tablename = 'ratings') THEN
        CREATE POLICY "Customers can rate their tickets" ON ratings
            FOR INSERT WITH CHECK (
                ticket_id IN (
                    SELECT id FROM tickets 
                    WHERE customer_email = (
                        SELECT email FROM profiles 
                        WHERE id = auth.uid()
                    )
                )
            );
    END IF;

    -- Allow public rating
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public rating' AND tablename = 'ratings') THEN
        CREATE POLICY "Allow public rating" ON ratings
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- =============================================
-- CREATE/UPDATE HELPER FUNCTIONS
-- =============================================

-- Create function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'manager'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is technician
CREATE OR REPLACE FUNCTION is_technician()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'technician'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'customer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION is_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION is_technician() TO authenticated;
GRANT EXECUTE ON FUNCTION is_customer() TO authenticated;

-- =============================================
-- VERIFICATION
-- =============================================

-- Check that RLS is enabled on all tables
SELECT 'RLS Status:' as info, schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'technicians', 'tickets', 'assignments', 'locations', 'geofences', 'ratings')
ORDER BY tablename;

-- Check that policies exist
SELECT 'Policies:' as info, schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
