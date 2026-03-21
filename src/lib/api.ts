import { supabase } from './supabase';
import type { Database } from '../types/supabase';
import type { User, Grievance } from '../types';
import bcrypt from 'bcryptjs';

// Auth APIs
export const login = async (user_id: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with user_id:', user_id);
    
    // Find the user in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError) {
      console.error('Database error during login:', userError);
      throw new Error('User not found. Please check your credentials.');
    }

    if (!userData) {
      console.error('No user data found for user_id:', user_id);
      throw new Error('Invalid user ID or password.');
    }

    console.log('User found:', { 
      user_id: userData.user_id,
      email: userData.email,
      role: userData.role
    });

    // If password field doesn't exist or is empty in the database
    if (!userData.password) {
      console.error('User has no password set');
      throw new Error('Account setup incomplete. Please contact support.');
    }

    // Verify the password
    try {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      
      if (!passwordMatch) {
        console.error('Password mismatch for user:', user_id);
        throw new Error('Invalid user ID or password.');
      }
    } catch (bcryptError) {
      console.error('Error during password verification:', bcryptError);
      throw new Error('Authentication error. Please try again later.');
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = userData;
    
    return userWithoutPassword as User;
  } catch (error: unknown) {
    console.error('Login error:', (error as Error).message);
    throw error;
  }
};

export const signup = async (
  user_id: string, 
  email: string, 
  password: string,
  name: string,
  contact_number: string
): Promise<{ success: boolean; message: string; otp?: string }> => {
  try {
    // Validate email format
    if (!email.endsWith('@gndec.ac.in')) {
      throw new Error('Email must be a valid GNDEC email address (@gndec.ac.in)');
    }

    // Check if user_id already exists
    const { data: existingUserId, error: userIdError } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', user_id)
      .single();

    if (userIdError && userIdError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      console.error('Error checking existing user_id:', userIdError);
      throw new Error('Database error. Please try again later.');
    }

    if (existingUserId) {
      throw new Error('User ID already exists. Please choose a different one.');
    }

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') { // PGRST116 is the "not found" error code
      console.error('Error checking existing email:', emailError);
      throw new Error('Database error. Please try again later.');
    }

    if (existingEmail) {
      throw new Error('Email already registered. Please use a different email or login.');
    }

    // Default role for new signups
    const role = 'student';

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // For demo purposes, log the OTP to console
    console.log(`OTP for ${email}: ${otp}`);

    // In a real system, you would send the OTP via email
    // For now, we'll return it for testing purposes
    return { 
      success: true, 
      message: 'Verification code sent to your email. Please verify to complete registration.',
      otp
    };
  } catch (error: unknown) {
    console.error('Signup error:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
};

export const verifyEmail = async (
  user_id: string,
  email: string,
  hashedPassword: string,
  name: string,
  contact_number: string,
  otp: string,
  providedOtp: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    if (otp !== providedOtp) {
      throw new Error('Invalid verification code. Please try again.');
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id,
          email,
          password: hashedPassword,
          role: 'student',
          name,
          contact_number,
        }
      ])
      .select();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to create user.');
    }

    // Remove password from returned user
    const { password: _, ...userWithoutPassword } = data[0];

    return { 
      success: true, 
      message: 'Email verified and account created successfully!',
      user: userWithoutPassword as User 
    };
  } catch (error: unknown) {
    console.error('Email verification error:', (error as Error).message);
    return { success: false, message: (error as Error).message };
  }
};

// User APIs
export const fetchCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // Get the user profile from our users table
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
  
  if (!data) {
    console.error('No user data found for email:', user.email);
    return null;
  }
  
  return mapUserData(data);
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Get user profile data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user?.id)
    .single();
  
  if (!userData) throw new Error('User profile not found');
  
  return mapUserData(userData);
};

export const signUp = async (userData: {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  collegeRollNumber?: string;
}) => {
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });
  
  if (authError) throw authError;
  
  if (!authData.user) {
    throw new Error('Failed to create user');
  }
  
  // Then create the profile in our users table
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as 'student' | 'clerk' | 'admin' | 'dsw',
      phone_number: userData.phoneNumber,
      college_roll_number: userData.collegeRollNumber,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    // If profile creation fails, we should clean up the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw error;
  }
  
  return mapUserData(data);
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

// Grievance APIs
export const fetchGrievances = async (user_id?: string) => {
  console.log('[API] Fetching grievances for user:', user_id);
  
  try {
    let query = supabase
      .from('grievances')
      .select('*, responses(*)');
    
    // If user_id is provided, filter by user
    if (user_id) {
      console.log('[API] Adding user filter:', user_id);
      query = query.eq('user_id', user_id);
    }
    
    console.log('[API] Executing query with order');
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('[API] Query error:', error);
      console.error('[API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: user_id
      });
      throw error;
    }
    
    if (!data) {
      console.log('[API] No data returned from query');
      return [];
    }
    
    console.log('[API] Query successful, mapping data');
    console.log('[API] Raw data:', data);
    const mappedData = data.map(mapGrievanceData);
    console.log('[API] Mapped data:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('[API] Unexpected error in fetchGrievances:', error);
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      user_id: user_id
    });
    throw error;
  }
};

export const fetchGrievanceById = async (grievanceId: string) => {
  const { data, error } = await supabase
    .from('grievances')
    .select(`
      *,
      responses (*)
    `)
    .eq('id', grievanceId)
    .single();
  
  if (error) throw error;
  
  return mapGrievanceData(data);
};

export const submitGrievance = async (formData: FormData, userId: string): Promise<Grievance> => {
  try {
    console.log('[API] Submitting grievance with user ID:', userId);
    
    // Validate userId is a valid UUID
    if (!userId || typeof userId !== 'string') {
      console.error('[API] Invalid user ID format:', userId);
      throw new Error('Invalid user ID format');
    }

    // Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const documents = formData.getAll('documents') as File[];

    // Validate required fields
    if (!title || !description || !category) {
      throw new Error('Missing required fields');
    }

    // Upload documents if any
    let documentUrls: string[] = [];
    if (documents && documents.length > 0) {
      documentUrls = await Promise.all(
        documents.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('grievance-documents')
            .upload(fileName, file);

          if (error) throw error;
          return data.path;
        })
      );
    }

    // Insert grievance
    const { data, error } = await supabase
      .from('grievances')
      .insert([
        {
          user_id: userId,
          title,
          description,
          category,
          status: 'pending',
          documents: documentUrls,
        },
      ])
      .select('*, responses(*)')
      .single();

    if (error) {
      console.error('[API] Error submitting grievance:', error);
      console.error('[API] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: userId
      });
      throw error;
    }

    console.log('[API] Grievance submitted successfully:', data);
    return mapGrievanceData(data);
  } catch (error) {
    console.error('[API] Unexpected error in submitGrievance:', error);
    throw error;
  }
};

export const updateGrievanceStatus = async (
  grievanceId: string,
  status: string,
  adminId?: string,
  sendReminderEmail = false
) => {
  try {
    // First get the current grievance data to check last reminder time
    const { data: currentGrievance, error: fetchError } = await supabase
      .from('grievances')
      .select('*')
      .eq('id', grievanceId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching grievance for status update:', fetchError);
      throw fetchError;
    }
    
    // Check if we need to enforce cooldown period for reminders
    if (sendReminderEmail) {
      const now = new Date();
      const lastReminderTime = currentGrievance.last_reminder_sent 
        ? new Date(currentGrievance.last_reminder_sent) 
        : null;
      
      // Check if 48 hours have passed since the last reminder
      if (lastReminderTime && now.getTime() - lastReminderTime.getTime() < 48 * 60 * 60 * 1000) {
        throw new Error('Reminder can only be sent once every 48 hours');
      }
    }
    
    const updates: Database['public']['Tables']['grievances']['Update'] = {
      status: status as 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected',
      updated_at: new Date().toISOString(),
    };
    
    if (adminId) {
      updates.assigned_to = adminId;
    }
    
    // If this is a reminder, update the last_reminder_sent timestamp
    if (sendReminderEmail) {
      updates.last_reminder_sent = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('grievances')
      .update(updates)
      .eq('id', grievanceId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating grievance status:', error);
      throw error;
    }
    
    return mapGrievanceData(data);
  } catch (error) {
    console.error('Error in updateGrievanceStatus:', error);
    throw error;
  }
};

export const addResponse = async (
  grievanceId: string,
  adminId: string,
  responseText: string
) => {
  // Add the response
  const { error } = await supabase
    .from('responses')
    .insert({
      grievance_id: grievanceId,
      admin_id: adminId,
      response_text: responseText,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update the grievance's updated_at timestamp
  await supabase
    .from('grievances')
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq('id', grievanceId);
  
  return { success: true };
};

// Add deleteGrievance function
export const deleteGrievance = async (grievanceId: string): Promise<boolean> => {
  try {
    // Delete any associated responses first (to maintain referential integrity)
    const { error: responsesError } = await supabase
      .from('responses')
      .delete()
      .eq('grievance_id', grievanceId);
    
    if (responsesError) {
      console.error('Error deleting responses:', responsesError);
      throw new Error('Failed to delete grievance responses');
    }
    
    // Now delete the grievance
    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', grievanceId);
    
    if (error) {
      console.error('Error deleting grievance:', error);
      throw new Error('Failed to delete grievance');
    }
    
    return true;
  } catch (error) {
    console.error('Delete grievance error:', error);
    throw error;
  }
};

// Statistics APIs
export const fetchStatistics = async () => {
  const { data, error } = await supabase
    .from('statistics')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  
  return data;
};

// Add a function to send reminder email to admin
export const sendReminderEmail = async (
  grievanceData: Grievance, 
  userEmail: string,
  userName?: string,
  userId?: string
) => {
  try {
    // API endpoint to send reminder email
    const response = await fetch('/api/grievances/send-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grievanceId: grievanceData.id,
        grievanceTitle: grievanceData.title,
        grievanceCategory: grievanceData.category,
        grievanceStatus: grievanceData.status,
        userEmail: userEmail,
        dateSubmitted: grievanceData.created_at,
        userName: userName,
        userId: userId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send reminder email');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
};

// Function to send confirmation email after grievance submission
export const sendConfirmationEmail = async (grievanceData: Grievance, userEmail: string) => {
  try {
    // API endpoint to send confirmation email
    const response = await fetch('/api/grievances/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grievanceId: grievanceData.id,
        grievanceTitle: grievanceData.title,
        grievanceCategory: grievanceData.category,
        email: userEmail,
        grievanceData: {
          id: grievanceData.id,
          title: grievanceData.title,
          category: grievanceData.category,
          status: grievanceData.status,
          dateSubmitted: grievanceData.created_at
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send confirmation email');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

// Alias for sendConfirmationEmail to maintain compatibility with existing code
export const sendGrievanceConfirmationEmail = sendConfirmationEmail;

// Helper functions to map database models to app models
function mapUserData(user: Database['public']['Tables']['users']['Row']): User {
  return {
    id: user.id,
    user_id: user.user_id,
    email: user.email,
    password: user.password,
    role: user.role as 'student' | 'clerk' | 'dsw' | 'admin',
    name: user.name,
    contact_number: user.contact_number,
    created_at: user.created_at
  };
}

function mapGrievanceData(
  grievance: Database['public']['Tables']['grievances']['Row'] & {
    responses?: Database['public']['Tables']['responses']['Row'][];
  }
): Grievance {
  return {
    id: grievance.id,
    user_id: grievance.user_id,
    title: grievance.title,
    description: grievance.description,
    category: grievance.category,
    status: grievance.status,
    created_at: grievance.created_at,
    updated_at: grievance.updated_at,
    assigned_to: grievance.assigned_to,
    documents: Array.isArray(grievance.documents) ? grievance.documents.join(',') : grievance.documents,
    feedback: grievance.feedback,
    responses: grievance.responses ? grievance.responses.map(response => ({
      id: response.id,
      grievanceId: response.grievance_id,
      adminId: response.admin_id,
      responseText: response.response_text,
      createdAt: response.created_at,
    })) : undefined,
  };
} 