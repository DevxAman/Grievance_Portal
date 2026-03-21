-- Add student-specific fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS crn VARCHAR(10),
ADD COLUMN IF NOT EXISTS branch VARCHAR(20),
ADD COLUMN IF NOT EXISTS year SMALLINT,
ADD COLUMN IF NOT EXISTS day_scholar BOOLEAN;

-- Update existing student accounts with sample data
-- (This is just for demonstration, you should update with real data)
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

-- Add an index on CRN for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_crn ON public.users(crn);
