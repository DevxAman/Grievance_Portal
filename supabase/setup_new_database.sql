-- ============================================
-- COMBINED MIGRATION SCRIPT FOR GRIEVANCE PORTAL
-- Run this entire script in the Supabase SQL Editor
-- ============================================

-- Enable UUID extension (needed for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: Create users table
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('student', 'clerk', 'dsw', 'admin')) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================
-- STEP 2: Create grievances table
-- ============================================
CREATE TABLE IF NOT EXISTS public.grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'in-progress', 'resolved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_to UUID REFERENCES users(id),
    documents TEXT[],
    feedback TEXT
);

-- ============================================
-- STEP 3: Create responses table
-- ============================================
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grievance_id UUID NOT NULL REFERENCES grievances(id),
    admin_id UUID NOT NULL REFERENCES users(id),
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 4: Create statistics table
-- ============================================
CREATE TABLE IF NOT EXISTS public.statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resolution_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    avg_response_time INTEGER NOT NULL DEFAULT 0,
    grievances_resolved INTEGER NOT NULL DEFAULT 0,
    user_satisfaction DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 5: Create emails table
-- ============================================
CREATE TABLE IF NOT EXISTS public.emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "isRead" BOOLEAN DEFAULT FALSE,
    "isStarred" BOOLEAN DEFAULT FALSE,
    "isOutbound" BOOLEAN DEFAULT TRUE,
    "messageId" TEXT,
    "cc" TEXT,
    "bcc" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 6: Add student-specific fields to users
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS crn VARCHAR(10),
ADD COLUMN IF NOT EXISTS branch VARCHAR(20),
ADD COLUMN IF NOT EXISTS year SMALLINT,
ADD COLUMN IF NOT EXISTS day_scholar BOOLEAN;

-- ============================================
-- STEP 7: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_grievances_user_id ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_responses_grievance_id ON responses(grievance_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_crn ON users(crn);

-- ============================================
-- STEP 8: Create triggers
-- ============================================

-- Auto-update grievance timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_grievances_updated_at ON grievances;
CREATE TRIGGER set_grievances_updated_at
BEFORE UPDATE ON grievances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Auto-update statistics when grievances are resolved
CREATE OR REPLACE FUNCTION update_statistics_on_resolution()
RETURNS TRIGGER AS $$
DECLARE
  total_resolved INTEGER;
  total_grievances INTEGER;
  avg_time NUMERIC;
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    SELECT COUNT(*) INTO total_resolved FROM grievances WHERE status = 'resolved';
    SELECT COUNT(*) INTO total_grievances FROM grievances;
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) INTO avg_time
    FROM grievances WHERE status = 'resolved';
    
    UPDATE statistics
    SET 
      resolution_rate = CASE WHEN total_grievances > 0 THEN (total_resolved::NUMERIC / total_grievances) * 100 ELSE 0 END,
      avg_response_time = COALESCE(avg_time, 0),
      grievances_resolved = total_resolved,
      last_updated = now();
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_resolution ON grievances;
CREATE TRIGGER update_stats_on_resolution
AFTER UPDATE ON grievances
FOR EACH ROW
EXECUTE FUNCTION update_statistics_on_resolution();

-- ============================================
-- STEP 9: Disable RLS (using service role key) 
-- We use service_role key so RLS is bypassed.
-- If you want RLS, re-enable it later.
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 10: Insert initial statistics record
-- ============================================
INSERT INTO statistics (resolution_rate, avg_response_time, grievances_resolved, user_satisfaction)
VALUES (0, 0, 0, 0);

-- ============================================
-- STEP 11: Insert demo user accounts (50 users)
-- All passwords: 123456
-- ============================================

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

-- Update student accounts with sample CRN, branch, year, day_scholar data
UPDATE public.users
SET 
    crn = CONCAT('221', LPAD(SUBSTRING(id::text FROM 1 FOR 4), 4, '0')),
    branch = CASE MOD(ASCII(SUBSTRING(email FROM 1 FOR 1)), 6)
        WHEN 0 THEN 'CSE'
        WHEN 1 THEN 'IT'
        WHEN 2 THEN 'ECE'
        WHEN 3 THEN 'ME'
        WHEN 4 THEN 'CE'
        WHEN 5 THEN 'EE'
    END,
    year = 1 + MOD(ASCII(SUBSTRING(email FROM 2 FOR 1)), 4),
    day_scholar = (MOD(ASCII(SUBSTRING(email FROM 3 FOR 1)), 2) = 0)
WHERE role = 'student';

-- ============================================
-- STEP 12: Insert sample emails
-- ============================================
INSERT INTO emails ("from", "to", subject, body, "sentAt", "isRead", "isStarred", "isOutbound", "messageId", "cc", "bcc") VALUES
('student1@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Library Book Availability Issue', 
'Dear Sir/Madam,

I am writing to bring to your attention the issue of limited availability of reference books in the library. Many students are finding it difficult to access essential course materials.

Please look into this matter at the earliest.

Regards,
Student 1',
NOW() - INTERVAL '1 hour', false, false, false, 'msg-001', NULL, NULL),

('student2@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Hostel Maintenance Request', 
'Respected Sir/Madam,

The water supply in Hostel Block A has been inconsistent for the past three days. This is causing inconvenience to all residents.

Kindly take necessary action.

Thank you,
Student 2',
NOW() - INTERVAL '2 days', true, true, false, 'msg-002', 'warden@gndec.ac.in', NULL),

('student3@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Classroom Infrastructure Issue', 
'Dear Administration,

I am attaching photos of damaged classroom furniture in Room 205. The chairs and desks need immediate repair.

Please find the attached images for reference.

Best regards,
Student 3',
NOW() - INTERVAL '3 days', true, false, false, 'msg-003', 'hod.mech@gndec.ac.in', NULL),

('std_grievance@gndec.ac.in', 'student1@gndec.ac.in', 'Re: Library Book Availability Issue', 
'Dear Student,

Thank you for bringing this to our attention. We have initiated the process to acquire additional copies of the reference books. The new books should be available within two weeks.

Regards,
Grievance Cell',
NOW() - INTERVAL '1 day', true, false, true, 'msg-004', NULL, NULL),

('student4@gndec.ac.in', 'std_grievance@gndec.ac.in', 'URGENT: Internet Connectivity Issue', 
'Respected Sir/Madam,

The internet connectivity in the Computer Lab has been down since morning. This is affecting our practical sessions and project work.

Request immediate attention to this matter.

Regards,
Student 4',
NOW() - INTERVAL '4 hours', false, true, false, 'msg-005', 'hod.cse@gndec.ac.in', 'it.support@gndec.ac.in'),

('std_grievance@gndec.ac.in', 'all_students@gndec.ac.in', 'Important: Grievance Portal Maintenance', 
'Dear Students,

The Grievance Portal will be undergoing maintenance on Saturday, 10:00 PM to Sunday, 2:00 AM. During this time, the portal will be temporarily unavailable.

We apologize for any inconvenience caused.

Regards,
Grievance Cell',
NOW() - INTERVAL '5 days', true, false, true, 'msg-006', NULL, NULL);

-- ============================================
-- DONE! All tables created and seeded. 🎉
-- ============================================
