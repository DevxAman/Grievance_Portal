-- Insert test admin user (after creating via Supabase Auth)
-- Replace 'auth-user-id' with the actual UUID from Supabase Auth
INSERT INTO public.users (id, email, name, role, phone_number, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@gndec.ac.in', 'Admin User', 'admin', '9876543210', now()),
  ('00000000-0000-0000-0000-000000000002', 'dsw@gndec.ac.in', 'DSW User', 'dsw', '9876543211', now()),
  ('00000000-0000-0000-0000-000000000003', 'clerk@gndec.ac.in', 'Clerk User', 'clerk', '9876543212', now()),
  ('00000000-0000-0000-0000-000000000004', 'student@gndec.ac.in', 'Student User', 'student', '9876543213', now());

-- Insert test grievances
INSERT INTO public.grievances (user_id, title, description, category, status, created_at, updated_at, assigned_to)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'Classroom Projector Not Working', 'The projector in Room 301 has not been functioning for the past week, affecting our lectures.', 'infrastructure', 'resolved', now() - interval '30 days', now() - interval '25 days', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', 'Incorrect Grade in Database Systems', 'My grade for the Database Systems mid-term exam seems to be incorrectly entered in the system.', 'academic', 'in-progress', now() - interval '15 days', now() - interval '10 days', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', 'Scholarship Application Issue', 'My scholarship application was rejected despite meeting all the criteria. I would like this to be reviewed.', 'financial', 'under-review', now() - interval '7 days', now() - interval '5 days', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004', 'Library Access Card Issue', 'My library access card is not working properly, preventing me from accessing resources needed for my research.', 'administrative', 'pending', now() - interval '3 days', now() - interval '3 days', NULL);

-- Insert test responses
INSERT INTO public.responses (grievance_id, admin_id, response_text, created_at)
VALUES
  ((SELECT id FROM public.grievances WHERE title = 'Classroom Projector Not Working'), '00000000-0000-0000-0000-000000000001', 'We have replaced the projector in Room 301. Please let us know if you face any further issues.', now() - interval '25 days'),
  ((SELECT id FROM public.grievances WHERE title = 'Incorrect Grade in Database Systems'), '00000000-0000-0000-0000-000000000002', 'We are reviewing your grade with the course instructor. Will update you shortly.', now() - interval '10 days'),
  ((SELECT id FROM public.grievances WHERE title = 'Scholarship Application Issue'), '00000000-0000-0000-0000-000000000003', 'Your application is under review by the scholarship committee. We will get back to you within 3 working days.', now() - interval '5 days');

-- Update statistics
UPDATE public.statistics
SET 
  resolution_rate = 25.0,  -- 1 out of 4 grievances resolved
  avg_response_time = 2.5, -- Average response time in days
  grievances_resolved = 1,
  user_satisfaction = 4.5,
  last_updated = now(); 