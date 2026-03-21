-- Create users table for auth
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('student', 'clerk', 'dsw', 'admin')) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email LIKE '%@gndec.ac.in'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT
    USING (auth.uid()::text = user_id OR auth.uid() IN (
        SELECT user_id FROM public.users WHERE role IN ('admin', 'dsw')
    ));

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE
    USING (auth.uid()::text = user_id);

-- Create policy for admin to manage all records
CREATE POLICY "Admins can do anything" ON public.users
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = auth.uid()::text AND role = 'admin'
        )
    );

-- Create index on user_id and email for faster lookups
CREATE INDEX idx_users_user_id ON public.users(user_id);
CREATE INDEX idx_users_email ON public.users(email);

-- ==========================================
-- Pre-populate with 50 entries (demo data)
-- All passwords set to '123456'
-- ==========================================

-- 20 Student accounts (S001-S020)
INSERT INTO public.users (id, user_id, password, role, email, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'S001', '123456', 'student', 'student1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000002', 'S002', '123456', 'student', 'student2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000003', 'S003', '123456', 'student', 'student3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000004', 'S004', '123456', 'student', 'student4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('00000000-0000-0000-0000-000000000005', 'S005', '123456', 'student', 'student5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('00000000-0000-0000-0000-000000000006', 'S006', '123456', 'student', 'student6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000007', 'S007', '123456', 'student', 'student7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('00000000-0000-0000-0000-000000000008', 'S008', '123456', 'student', 'student8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('00000000-0000-0000-0000-000000000009', 'S009', '123456', 'student', 'student9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('00000000-0000-0000-0000-000000000010', 'S010', '123456', 'student', 'student10@gndec.ac.in', NOW() - INTERVAL '21 days'),
('00000000-0000-0000-0000-000000000011', 'S011', '123456', 'student', 'student11@gndec.ac.in', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000012', 'S012', '123456', 'student', 'student12@gndec.ac.in', NOW() - INTERVAL '19 days'),
('00000000-0000-0000-0000-000000000013', 'S013', '123456', 'student', 'student13@gndec.ac.in', NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000014', 'S014', '123456', 'student', 'student14@gndec.ac.in', NOW() - INTERVAL '17 days'),
('00000000-0000-0000-0000-000000000015', 'S015', '123456', 'student', 'student15@gndec.ac.in', NOW() - INTERVAL '16 days'),
('00000000-0000-0000-0000-000000000016', 'S016', '123456', 'student', 'student16@gndec.ac.in', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000017', 'S017', '123456', 'student', 'student17@gndec.ac.in', NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0000-000000000018', 'S018', '123456', 'student', 'student18@gndec.ac.in', NOW() - INTERVAL '13 days'),
('00000000-0000-0000-0000-000000000019', 'S019', '123456', 'student', 'student19@gndec.ac.in', NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000020', 'S020', '123456', 'student', 'student20@gndec.ac.in', NOW() - INTERVAL '11 days');

-- 15 Clerk accounts (C001-C015)
INSERT INTO public.users (id, user_id, password, role, email, created_at) VALUES
('00000000-0000-0000-0000-000000000021', 'C001', '123456', 'clerk', 'clerk1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000022', 'C002', '123456', 'clerk', 'clerk2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000023', 'C003', '123456', 'clerk', 'clerk3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000024', 'C004', '123456', 'clerk', 'clerk4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('00000000-0000-0000-0000-000000000025', 'C005', '123456', 'clerk', 'clerk5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('00000000-0000-0000-0000-000000000026', 'C006', '123456', 'clerk', 'clerk6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000027', 'C007', '123456', 'clerk', 'clerk7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('00000000-0000-0000-0000-000000000028', 'C008', '123456', 'clerk', 'clerk8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('00000000-0000-0000-0000-000000000029', 'C009', '123456', 'clerk', 'clerk9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('00000000-0000-0000-0000-000000000030', 'C010', '123456', 'clerk', 'clerk10@gndec.ac.in', NOW() - INTERVAL '21 days'),
('00000000-0000-0000-0000-000000000031', 'C011', '123456', 'clerk', 'clerk11@gndec.ac.in', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000032', 'C012', '123456', 'clerk', 'clerk12@gndec.ac.in', NOW() - INTERVAL '19 days'),
('00000000-0000-0000-0000-000000000033', 'C013', '123456', 'clerk', 'clerk13@gndec.ac.in', NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000034', 'C014', '123456', 'clerk', 'clerk14@gndec.ac.in', NOW() - INTERVAL '17 days'),
('00000000-0000-0000-0000-000000000035', 'C015', '123456', 'clerk', 'clerk15@gndec.ac.in', NOW() - INTERVAL '16 days');

-- 10 DSW accounts (D001-D010)
INSERT INTO public.users (id, user_id, password, role, email, created_at) VALUES
('00000000-0000-0000-0000-000000000036', 'D001', '123456', 'dsw', 'dsw1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000037', 'D002', '123456', 'dsw', 'dsw2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000038', 'D003', '123456', 'dsw', 'dsw3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000039', 'D004', '123456', 'dsw', 'dsw4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('00000000-0000-0000-0000-000000000040', 'D005', '123456', 'dsw', 'dsw5@gndec.ac.in', NOW() - INTERVAL '26 days'),
('00000000-0000-0000-0000-000000000041', 'D006', '123456', 'dsw', 'dsw6@gndec.ac.in', NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000042', 'D007', '123456', 'dsw', 'dsw7@gndec.ac.in', NOW() - INTERVAL '24 days'),
('00000000-0000-0000-0000-000000000043', 'D008', '123456', 'dsw', 'dsw8@gndec.ac.in', NOW() - INTERVAL '23 days'),
('00000000-0000-0000-0000-000000000044', 'D009', '123456', 'dsw', 'dsw9@gndec.ac.in', NOW() - INTERVAL '22 days'),
('00000000-0000-0000-0000-000000000045', 'D010', '123456', 'dsw', 'dsw10@gndec.ac.in', NOW() - INTERVAL '21 days');

-- 5 Admin accounts (A001-A005)
INSERT INTO public.users (id, user_id, password, role, email, created_at) VALUES
('00000000-0000-0000-0000-000000000046', 'A001', '123456', 'admin', 'admin1@gndec.ac.in', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000047', 'A002', '123456', 'admin', 'admin2@gndec.ac.in', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000048', 'A003', '123456', 'admin', 'admin3@gndec.ac.in', NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000049', 'A004', '123456', 'admin', 'admin4@gndec.ac.in', NOW() - INTERVAL '27 days'),
('00000000-0000-0000-0000-000000000050', 'A005', '123456', 'admin', 'admin5@gndec.ac.in', NOW() - INTERVAL '26 days'); 