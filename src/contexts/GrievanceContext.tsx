import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { Grievance, Statistic } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  fetchGrievances, 
  submitGrievance, 
  fetchStatistics, 
  updateGrievanceStatus,
  fetchGrievanceById,
  deleteGrievance as apiDeleteGrievance,
  sendReminderEmail
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/dateUtils';
import { sendGrievanceConfirmationEmail } from '../lib/serverEmailService';

interface GrievanceState {
  grievances: Grievance[];
  currentGrievance: Grievance | null;
  statistics: Statistic | null;
  loading: boolean;
  error: string | null;
  reminderCooldowns: { [grievanceId: string]: number }; // timestamp when reminder cooldown expires
}

interface GrievanceContextType extends GrievanceState {
  fetchUserGrievances: () => Promise<void>;
  submitNewGrievance: (formData: FormData) => Promise<Grievance | undefined>;
  sendReminder: (grievanceId: string) => Promise<void>;
  updateStatistics: () => Promise<void>;
  fetchGrievances: () => void;
  getGrievanceById: (grievanceId: string) => Promise<Grievance | null>;
  deleteGrievance: (grievanceId: string) => Promise<boolean>;
}

export const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

type GrievanceAction =
  | { type: 'FETCH_GRIEVANCES_REQUEST' }
  | { type: 'FETCH_GRIEVANCES_SUCCESS'; payload: Grievance[] }
  | { type: 'FETCH_GRIEVANCES_FAILURE'; payload: string }
  | { type: 'FETCH_STATISTICS_REQUEST' }
  | { type: 'FETCH_STATISTICS_SUCCESS'; payload: Statistic }
  | { type: 'FETCH_STATISTICS_FAILURE'; payload: string }
  | { type: 'SUBMIT_GRIEVANCE_REQUEST' }
  | { type: 'SUBMIT_GRIEVANCE_SUCCESS'; payload: Grievance }
  | { type: 'SUBMIT_GRIEVANCE_FAILURE'; payload: string }
  | { type: 'SEND_REMINDER_REQUEST' }
  | { type: 'SEND_REMINDER_SUCCESS'; payload: { grievanceId: string, cooldownUntil: number } }
  | { type: 'SEND_REMINDER_FAILURE'; payload: string }
  | { type: 'GET_GRIEVANCE_REQUEST' }
  | { type: 'GET_GRIEVANCE_SUCCESS'; payload: Grievance }
  | { type: 'GET_GRIEVANCE_FAILURE'; payload: string }
  | { type: 'DELETE_GRIEVANCE_REQUEST' }
  | { type: 'DELETE_GRIEVANCE_SUCCESS'; payload: string }
  | { type: 'DELETE_GRIEVANCE_FAILURE'; payload: string };

const initialState: GrievanceState = {
  grievances: [],
  currentGrievance: null,
  statistics: null,
  loading: false,
  error: null,
  reminderCooldowns: {},
};

const grievanceReducer = (state: GrievanceState, action: GrievanceAction): GrievanceState => {
  switch (action.type) {
    case 'FETCH_GRIEVANCES_REQUEST':
    case 'FETCH_STATISTICS_REQUEST':
    case 'SUBMIT_GRIEVANCE_REQUEST':
    case 'SEND_REMINDER_REQUEST':
    case 'GET_GRIEVANCE_REQUEST':
    case 'DELETE_GRIEVANCE_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_GRIEVANCES_SUCCESS':
      return {
        ...state,
        grievances: action.payload,
        loading: false,
        error: null,
      };
    case 'FETCH_STATISTICS_SUCCESS':
      return {
        ...state,
        statistics: action.payload,
        loading: false,
        error: null,
      };
    case 'SUBMIT_GRIEVANCE_SUCCESS':
      return {
        ...state,
        grievances: [action.payload, ...state.grievances],
        loading: false,
        error: null,
      };
    case 'GET_GRIEVANCE_SUCCESS':
      return {
        ...state,
        currentGrievance: action.payload,
        loading: false,
        error: null,
      };
    case 'DELETE_GRIEVANCE_SUCCESS':
      return {
        ...state,
        grievances: state.grievances.filter(g => g.id !== action.payload),
        loading: false,
        error: null,
      };
    case 'FETCH_GRIEVANCES_FAILURE':
    case 'FETCH_STATISTICS_FAILURE':
    case 'SUBMIT_GRIEVANCE_FAILURE':
    case 'SEND_REMINDER_FAILURE':
    case 'GET_GRIEVANCE_FAILURE':
    case 'DELETE_GRIEVANCE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SEND_REMINDER_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        reminderCooldowns: {
          ...state.reminderCooldowns,
          [action.payload.grievanceId]: action.payload.cooldownUntil
        }
      };
    default:
      return state;
  }
};

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(grievanceReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch grievances when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[GrievanceContext] User authenticated, fetching grievances');
      console.log('[GrievanceContext] User details:', {
        id: user.id,
        user_id: user.user_id,
        role: user.role,
        email: user.email
      });
      
      // Validate user_id is a valid UUID
      if (!user.id || typeof user.id !== 'string') {
        console.error('[GrievanceContext] Invalid user id:', user.id);
        dispatch({ 
          type: 'FETCH_GRIEVANCES_FAILURE', 
          payload: 'Invalid user ID format' 
        });
        return;
      }
      
      fetchUserGrievances().catch(error => {
        console.error('[GrievanceContext] Error in initial grievance fetch:', error);
      });
      updateStatistics().catch(error => {
        console.error('[GrievanceContext] Error in initial statistics fetch:', error);
      });
    } else {
      console.log('[GrievanceContext] User not authenticated or missing:', {
        isAuthenticated,
        user: user ? {
          id: user.id,
          user_id: user.user_id,
          role: user.role
        } : null
      });
      dispatch({ type: 'FETCH_GRIEVANCES_SUCCESS', payload: [] });
    }
  }, [isAuthenticated, user]);

  // Set up real-time subscription for statistics changes
  useEffect(() => {
    const statisticsSubscription = supabase
      .channel('public:statistics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'statistics' }, 
        () => {
          updateStatistics();
        }
      )
      .subscribe();
    
    // Set up interval for stats refresh (every 2 minutes)
    const statsInterval = setInterval(() => {
      updateStatistics();
    }, 2 * 60 * 1000);

    return () => {
      supabase.removeChannel(statisticsSubscription);
      clearInterval(statsInterval);
    };
  }, []);
  
  // Set up real-time subscription for grievance changes
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('grievance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grievances',
          filter: `user_id=${user.id}`
        },
        () => {
          fetchUserGrievances();
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Fetch grievances for current user
  const fetchUserGrievances = async () => {
    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    console.log('Fetching grievances for user:', {
      id: user.id,
      user_id: user.user_id,
      role: user.role
    });
    try {
      const data = await fetchGrievances(user.id);
      console.log('Fetched grievances:', data);
      dispatch({ type: 'FETCH_GRIEVANCES_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error fetching grievances:', error);
      dispatch({ type: 'FETCH_GRIEVANCES_FAILURE', payload: 'Failed to fetch grievances' });
    }
  };

  // Update statistics
  const updateStatistics = async () => {
    dispatch({ type: 'FETCH_STATISTICS_REQUEST' });
    
    try {
      const data = await fetchStatistics();
      dispatch({ type: 'FETCH_STATISTICS_SUCCESS', payload: data });
    } catch (error) {
      console.error('Fetch statistics error:', error);
      dispatch({ 
        type: 'FETCH_STATISTICS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Failed to fetch statistics' 
      });
    }
  };

  // Submit new grievance
  const submitNewGrievance = async (formData: FormData) => {
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('You must be logged in to submit a grievance');
    }

    dispatch({ type: 'SUBMIT_GRIEVANCE_REQUEST' });
    console.log('Submitting new grievance for user:', user.id);
    
    try {
      // Submit the grievance to the database
      const data = await submitGrievance(formData, user.id);
      
      if (data) {
        // Update local state with the new grievance
        dispatch({ type: 'SUBMIT_GRIEVANCE_SUCCESS', payload: data });
        
        // Send confirmation email using server-side Nodemailer
        try {
          console.log('Sending confirmation email using Nodemailer server-side');
          
          if (!user.email) {
            console.warn('No user email found for confirmation email');
            return data;
          }
          
          // Send confirmation email using nodemailer
          const serverEmailResult = await sendGrievanceConfirmationEmail(
            user.email,
            data
          );
          
          console.log('Server email sending result:', serverEmailResult);
          
          if (serverEmailResult.success) {
            console.log('Server-side confirmation email sent for grievance:', data.id);
          } else {
            console.warn('Failed to send server-side confirmation email:', serverEmailResult.message);
            // Consider implementing a retry mechanism here
          }
        } catch (serverEmailError) {
          console.error('Error sending server-side confirmation email:', serverEmailError);
          // We don't want to fail the submission if email fails
        }
        
        return data;
      } else {
        throw new Error('Failed to submit grievance - no data returned');
      }
    } catch (error) {
      console.error('Error submitting grievance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit grievance';
      dispatch({ type: 'SUBMIT_GRIEVANCE_FAILURE', payload: errorMessage });
      throw error; // Re-throw to allow the UI to handle it
    }
  };

  // Send reminder for a grievance with cooldown check
  const sendReminder = async (grievanceId: string) => {
    if (!user) return Promise.reject('User not authenticated');
    
    dispatch({ type: 'SEND_REMINDER_REQUEST' });
    
    try {
      // Check if this grievance is in cooldown period
      const now = Date.now();
      const cooldownUntil = state.reminderCooldowns[grievanceId] || 0;
      
      if (now < cooldownUntil) {
        const hoursRemaining = Math.ceil((cooldownUntil - now) / (1000 * 60 * 60));
        throw new Error(`Reminder can only be sent once every 48 hours. Please try again in ${hoursRemaining} hours.`);
      }
      
      // Find the grievance to send in the email
      const grievanceToRemind = state.grievances.find(g => g.id === grievanceId);
      if (!grievanceToRemind) {
        throw new Error('Grievance not found');
      }
      
      // Update status and set the reminder sent flag - catch errors but continue
      try {
        await updateGrievanceStatus(grievanceId, 'under-review', undefined, true);
      } catch (statusError) {
        console.warn('Could not update grievance status, but will continue with reminder:', statusError);
      }
      
      // Primary method: Send reminder email via server using Nodemailer
      console.log('Sending reminder email via server...');
      try {
        await sendReminderEmail(grievanceToRemind, user.email, user.name || user.user_id, user.user_id);
        console.log('Server reminder email sent successfully');
      } catch (emailError) {
        console.error('Server email failed:', emailError);
        // Fallback to browser Gmail window if server email fails
        // Open Gmail in a new tab with pre-filled reminder email
        const recipient = 'std_grievance@gndec.ac.in';
        const subject = encodeURIComponent(`REMINDER: Grievance #${grievanceId} - ${grievanceToRemind.title}`);
        const formattedDate = new Date(grievanceToRemind.created_at).toLocaleDateString();
        const body = encodeURIComponent(
          `Dear Admin,\n\n` +
          `I am writing to follow up on my grievance (ID: ${grievanceId}) which was submitted on ${formattedDate}.\n\n` +
          `Title: ${grievanceToRemind.title}\n` +
          `Category: ${grievanceToRemind.category}\n` +
          `Current Status: ${grievanceToRemind.status.replace('-', ' ')}\n\n` +
          `I would appreciate if you could provide an update on the status of my grievance.\n\n` +
          `Thank you for your attention to this matter.\n\n` +
          `Sincerely,\n` +
          `${user.name || user.user_id}\n` +
          `${user.email}`
        );
        
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`, '_blank');
        console.log('Fallback to Gmail compose window since server email failed');
      }
      
      // Calculate when the cooldown expires (48 hours from now)
      const cooldownExpiresAt = now + (48 * 60 * 60 * 1000);
      
      dispatch({ 
        type: 'SEND_REMINDER_SUCCESS', 
        payload: { 
          grievanceId,
          cooldownUntil: cooldownExpiresAt
        } 
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Send reminder error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reminder';
      dispatch({ 
        type: 'SEND_REMINDER_FAILURE', 
        payload: errorMessage
      });
      
      return Promise.reject(errorMessage);
    }
  };

  // Add getGrievanceById function
  const getGrievanceById = async (grievanceId: string): Promise<Grievance | null> => {
    dispatch({ type: 'GET_GRIEVANCE_REQUEST' });
    
    try {
      const data = await fetchGrievanceById(grievanceId);
      dispatch({ type: 'GET_GRIEVANCE_SUCCESS', payload: data });
      return data;
    } catch (error) {
      console.error('Fetch grievance by ID error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch grievance details';
      dispatch({ 
        type: 'GET_GRIEVANCE_FAILURE', 
        payload: errorMessage
      });
      return null;
    }
  };

  // Add deleteGrievance function
  const deleteGrievance = async (grievanceId: string): Promise<boolean> => {
    dispatch({ type: 'DELETE_GRIEVANCE_REQUEST' });
    
    try {
      await apiDeleteGrievance(grievanceId);
      dispatch({ type: 'DELETE_GRIEVANCE_SUCCESS', payload: grievanceId });
      return true;
    } catch (error) {
      console.error('Delete grievance error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete grievance';
      dispatch({ 
        type: 'DELETE_GRIEVANCE_FAILURE', 
        payload: errorMessage
      });
      return false;
    }
  };

  return (
    <GrievanceContext.Provider 
      value={{ 
        ...state, 
        fetchUserGrievances, 
        submitNewGrievance,
        sendReminder,
        updateStatistics,
        fetchGrievances,
        getGrievanceById,
        deleteGrievance
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};