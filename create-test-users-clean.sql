-- Clean test users creation script
-- This script handles existing data and creates unique test users

-- First, clean up any existing test data (optional - comment out if you want to keep existing data)
-- DELETE FROM assignments WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');
-- DELETE FROM tickets WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
-- DELETE FROM technicians WHERE id IN ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');
-- DELETE FROM profiles WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008');
-- DELETE FROM auth.users WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008');

-- Create auth users (use ON CONFLICT to handle existing users)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'manager@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Rajesh Kumar", "phone": "+91-9876543210"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'technician1@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Ravi Kumar", "phone": "+91-9876543211"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'technician2@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Priya Sharma", "phone": "+91-9876543212"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'customer1@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Amit Singh", "phone": "+91-9876543213"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000005',
    'authenticated',
    'authenticated',
    'customer2@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sneha Patel", "phone": "+91-9876543214"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000006',
    'authenticated',
    'authenticated',
    'customer3@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Vikram Joshi", "phone": "+91-9876543215"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000007',
    'authenticated',
    'authenticated',
    'customer4@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Kavita Reddy", "phone": "+91-9876543216"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000008',
    'authenticated',
    'authenticated',
    'customer5@alright.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Rohit Agarwal", "phone": "+91-9876543217"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- Create profiles (use ON CONFLICT to handle existing profiles)
INSERT INTO profiles (
    id,
    email,
    name,
    phone,
    role,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'manager@alright.com',
    'Rajesh Kumar',
    '+91-9876543210',
    'manager',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    'technician1@alright.com',
    'Ravi Kumar',
    '+91-9876543211',
    'technician',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    'technician2@alright.com',
    'Priya Sharma',
    '+91-9876543212',
    'technician',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000004',
    'customer1@alright.com',
    'Amit Singh',
    '+91-9876543213',
    'customer',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000005',
    'customer2@alright.com',
    'Sneha Patel',
    '+91-9876543214',
    'customer',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000006',
    'customer3@alright.com',
    'Vikram Joshi',
    '+91-9876543215',
    'customer',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000007',
    'customer4@alright.com',
    'Kavita Reddy',
    '+91-9876543216',
    'customer',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000008',
    'customer5@alright.com',
    'Rohit Agarwal',
    '+91-9876543217',
    'customer',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create technician records (use ON CONFLICT to handle existing technicians)
INSERT INTO technicians (
    id,
    user_id,
    skills,
    vehicle_info,
    status,
    current_lat,
    current_lng,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    ARRAY['AC Repair', 'Plumbing', 'Electrical'],
    '{"type": "Motorcycle", "number": "MH-12-AB-1234", "license": "DL123456789", "employee_id": "TECH001"}',
    'available',
    21.1458,
    79.0882,
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    ARRAY['Plumbing', 'Carpentry', 'Painting'],
    '{"type": "Van", "number": "MH-12-CD-5678", "license": "DL987654321", "employee_id": "TECH002"}',
    'available',
    21.1500,
    79.0900,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample tickets with unique tracking numbers
INSERT INTO tickets (
    id,
    tracking_number,
    customer_name,
    customer_email,
    customer_phone,
    address,
    lat,
    lng,
    category,
    description,
    priority,
    status,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'TKT-TEST-001',
    'Amit Singh',
    'customer1@alright.com',
    '+91-9876543213',
    '123 MG Road, Nagpur',
    21.1458,
    79.0882,
    'AC Repair',
    'AC not cooling properly, making strange noise',
    'high',
    'pending',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    'TKT-TEST-002',
    'Sneha Patel',
    'customer2@alright.com',
    '+91-9876543214',
    '456 Civil Lines, Nagpur',
    21.1500,
    79.0900,
    'Plumbing',
    'Leaky faucet in kitchen, water pressure low',
    'medium',
    'assigned',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    'TKT-TEST-003',
    'Vikram Joshi',
    'customer3@alright.com',
    '+91-9876543215',
    '789 Dharampeth, Nagpur',
    21.1400,
    79.0850,
    'Electrical',
    'Power socket not working, needs repair',
    'high',
    'in_progress',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create assignments (use ON CONFLICT to handle existing assignments)
INSERT INTO assignments (
    id,
    ticket_id,
    technician_id,
    assigned_at,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    NOW(),
    'accepted',
    'High priority AC repair job',
    NOW(),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    NOW(),
    'in_progress',
    'Electrical repair in progress',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;
