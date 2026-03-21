/**
 * Admin API Functions
 * 
 * This file contains all functions for admin operations on emails and grievances.
 * Each function is simple and handles a specific task by making API calls to the backend.
 */

// Define the Email interface for type safety
export interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  read: boolean;
  starred: boolean;
  attachments: {
    filename: string;
    url: string;
  }[];
}

/**
 * Fetch all emails from the database
 */
export const fetchEmails = async (): Promise<Email[]> => {
  try {
    // Get the auth state from localStorage
    const authState = localStorage.getItem('gndec_portal_auth');
    if (!authState) {
      throw new Error('No authentication token found');
    }

    const user = JSON.parse(authState);
    if (!user || !user.user_id) {
      throw new Error('User not found in auth state');
    }

    // Make the request with the user's ID
    const response = await fetch('http://localhost:3001/api/admin/emails', {
      headers: {
        'Authorization': `Bearer ${user.user_id}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    
    // Transform the data to match our Email interface
    const data = await response.json();
    return data.emails.map((email: any) => ({
      id: email.id,
      subject: email.subject || 'No Subject',
      from: email.from || 'unknown@example.com',
      date: email.sentAt || new Date().toISOString(),
      body: email.body || '',
      read: email.isRead || false,
      starred: email.isStarred || false,
      attachments: email.attachments || []
    }));
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

/**
 * Mark an email as read
 */
export const markEmailAsRead = async (emailId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'markAsRead' })
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark email as read');
    }
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
};

/**
 * Delete an email
 */
export const deleteEmail = async (emailId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete email');
    }
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
};

/**
 * Toggle the starred status of an email
 */
export const toggleStarEmail = async (emailId: string): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'toggleStar' })
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle star status');
    }
  } catch (error) {
    console.error('Error toggling star status:', error);
    throw error;
  }
};

/**
 * Reply to an email
 */
export const replyToEmail = async (emailId: string, data: { body: string }): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send reply');
    }
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

/**
 * Reply to all recipients of an email
 */
export const replyAllToEmail = async (emailId: string, data: { body: string }): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}/replyAll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send reply all');
    }
  } catch (error) {
    console.error('Error sending reply all:', error);
    throw error;
  }
};

/**
 * Forward an email to another recipient
 */
export const forwardEmail = async (
  emailId: string, 
  data: { to: string; additionalMessage: string; cc: string; bcc: string }
): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/emails/${emailId}/forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to forward email');
    }
  } catch (error) {
    console.error('Error forwarding email:', error);
    throw error;
  }
};

/**
 * Mark a grievance as resolved from an email
 */
export const markGrievanceAsResolvedFromEmail = async (
  emailId: string, 
  grievanceId: string
): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/grievances/${grievanceId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark grievance as resolved');
    }
  } catch (error) {
    console.error('Error marking grievance as resolved:', error);
    throw error;
  }
};

/**
 * Assign a grievance to a staff member
 */
export const assignGrievanceToStaff = async (
  grievanceId: string, 
  staffId: string
): Promise<void> => {
  try {
    const response = await fetch(`/api/admin/grievances/${grievanceId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to assign grievance to staff');
    }
  } catch (error) {
    console.error('Error assigning grievance to staff:', error);
    throw error;
  }
};

/**
 * Fetch all staff members available for assignment
 */
export const fetchStaffMembers = async () => {
  try {
    const response = await fetch('/api/admin/staff');
    if (!response.ok) {
      throw new Error('Failed to fetch staff members');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching staff members:', error);
    throw error;
  }
};

/**
 * Fetch dashboard statistics
 */
export const fetchAdminStats = async () => {
  try {
    const response = await fetch('/api/admin/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch admin statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    throw error;
  }
}; 