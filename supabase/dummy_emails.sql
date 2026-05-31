-- Insert dummy email data
INSERT INTO emails ("from", "to", subject, body, "sentAt", "isRead", "isStarred", "isOutbound", "messageId", "cc", "bcc") VALUES
-- Unread email
('student1@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Library Book Availability Issue', 
'Dear Sir/Madam,

I am writing to bring to your attention the issue of limited availability of reference books in the library. Many students are finding it difficult to access essential course materials.

Please look into this matter at the earliest.

Regards,
Student 1',
NOW() - INTERVAL '1 hour', false, false, false, 'msg-001', NULL, NULL),

-- Starred email
('student2@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Hostel Maintenance Request', 
'Respected Sir/Madam,

The water supply in Hostel Block A has been inconsistent for the past three days. This is causing inconvenience to all residents.

Kindly take necessary action.

Thank you,
Student 2',
NOW() - INTERVAL '2 days', true, true, false, 'msg-002', 'warden@gndec.ac.in', NULL),

-- Email with attachments
('student3@gndec.ac.in', 'std_grievance@gndec.ac.in', 'Classroom Infrastructure Issue', 
'Dear Administration,

I am attaching photos of damaged classroom furniture in Room 205. The chairs and desks need immediate repair.

Please find the attached images for reference.

Best regards,
Student 3',
NOW() - INTERVAL '3 days', true, false, false, 'msg-003', 'hod.mech@gndec.ac.in', NULL),

-- Outbound email (from admin)
('std_grievance@gndec.ac.in', 'student1@gndec.ac.in', 'Re: Library Book Availability Issue', 
'Dear Student,

Thank you for bringing this to our attention. We have initiated the process to acquire additional copies of the reference books. The new books should be available within two weeks.

Regards,
Grievance Cell',
NOW() - INTERVAL '1 day', true, false, true, 'msg-004', NULL, NULL),

-- High priority email
('student4@gndec.ac.in', 'std_grievance@gndec.ac.in', 'URGENT: Internet Connectivity Issue', 
'Respected Sir/Madam,

The internet connectivity in the Computer Lab has been down since morning. This is affecting our practical sessions and project work.

Request immediate attention to this matter.

Regards,
Student 4',
NOW() - INTERVAL '4 hours', false, true, false, 'msg-005', 'hod.cse@gndec.ac.in', 'it.support@gndec.ac.in'),

-- Group email
('std_grievance@gndec.ac.in', 'all_students@gndec.ac.in', 'Important: Grievance Portal Maintenance', 
'Dear Students,

The Grievance Portal will be undergoing maintenance on Saturday, 10:00 PM to Sunday, 2:00 AM. During this time, the portal will be temporarily unavailable.

We apologize for any inconvenience caused.

Regards,
Grievance Cell',
NOW() - INTERVAL '5 days', true, false, true, 'msg-006', NULL, NULL); 