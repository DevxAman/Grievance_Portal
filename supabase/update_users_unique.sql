-- ============================================
-- SQL Script to Make Demo Users Unique and Add Names
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Add a 'name' column if it doesn't exist (this fixes the missing names!)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name VARCHAR(100);

-- 2. Update Student Data (CRN, Name, Branch, etc.)
UPDATE public.users
SET 
    -- Make CRN unique based on the numeric part of user_id (e.g., S001 -> 221001)
    crn = CONCAT('2210', SUBSTRING(user_id FROM 2)),
    
    -- Give them a realistic generic name (e.g., "Student 1", "Student 2")
    name = CONCAT('Student ', SUBSTRING(user_id FROM 2)::INT),
    
    -- Better randomization for branch
    branch = CASE MOD(SUBSTRING(user_id FROM 2)::INT, 6)
        WHEN 0 THEN 'CSE'
        WHEN 1 THEN 'IT'
        WHEN 2 THEN 'ECE'
        WHEN 3 THEN 'ME'
        WHEN 4 THEN 'CE'
        WHEN 5 THEN 'EE'
    END,
    
    -- Randomize year between 1 and 4
    year = 1 + MOD(SUBSTRING(user_id FROM 2)::INT, 4),
    
    -- Randomize day scholar (every 3rd student is a day scholar)
    day_scholar = (MOD(SUBSTRING(user_id FROM 2)::INT, 3) = 0)
WHERE role = 'student';

-- 3. Update Clerk Names
UPDATE public.users
SET name = CONCAT('Clerk ', SUBSTRING(user_id FROM 2)::INT)
WHERE role = 'clerk';

-- 4. Update DSW Names
UPDATE public.users
SET name = CONCAT('DSW Officer ', SUBSTRING(user_id FROM 2)::INT)
WHERE role = 'dsw';

-- 5. Update Admin Names
UPDATE public.users
SET name = CONCAT('Admin ', SUBSTRING(user_id FROM 2)::INT)
WHERE role = 'admin';

-- Done! Now all users have unique CRNs, realistic properties, and display names!
