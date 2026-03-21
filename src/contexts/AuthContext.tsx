import React, { createContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { User } from '../types';

// User types
export type UserData = User;

// Auth state storage key
const AUTH_STORAGE_KEY = 'gndec_portal_auth';

interface AuthContextType {
  user: UserData | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (user_id: string, password: string) => Promise<string>;
  signup: (user_id: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
  verifyEmail: (otp: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<{ user_id: string; email: string; hashedPassword: string; role: string } | null>(null);
  const [emailOtp, setEmailOtp] = useState<string | null>(null);

  // Save auth state to localStorage
  const saveAuthState = (userData: UserData | null) => {
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      console.log('[AuthContext] Auth state saved to localStorage');
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('[AuthContext] Auth state removed from localStorage');
    }
  };

  // Load auth state from localStorage
  const loadAuthState = (): UserData | null => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const userData = JSON.parse(storedAuth) as UserData;
        console.log('[AuthContext] Auth state loaded from localStorage');
        return userData;
      }
    } catch (error) {
      console.error('[AuthContext] Error loading auth state from localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    return null;
  };

  // Check for existing session and localStorage data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // First try to load from localStorage
        const storedUser = loadAuthState();
        if (storedUser) {
          setUser(storedUser);
          setLoading(false);
          return; // Exit early if we have localStorage data
        }
        
        // Otherwise check for Supabase session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserData(data.session.user.email || '');
        }
      } catch (error: unknown) {
        console.error('Error getting session:', (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(true);
      
      if (session?.user) {
        await fetchUserData(session.user.email || '');
      } else {
        // Only clear user if no localStorage data exists
        const storedUser = loadAuthState();
        if (!storedUser) {
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user data from users table
  const fetchUserData = async (email: string) => {
    try {
      // Find the user in our custom users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const userData = data as UserData;
        setUser(userData);
        saveAuthState(userData); // Save to localStorage
      }
    } catch (error: unknown) {
      console.error('Error fetching user data:', (error as Error).message);
      setUser(null);
      saveAuthState(null); // Clear localStorage
    }
  };

  // Login function
  const login = async (user_id: string, password: string) => {
    try {
      console.log('[AuthContext] Login attempt with user_id:', user_id, 'and password:', password.substring(0, 1) + '*'.repeat(password.length - 1));
      setLoading(true);
      setError(null);

      // Find the user in the users table
      console.log('[AuthContext] Querying users table with user_id:', user_id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user_id)
        .single();

      console.log('[AuthContext] Query result:', { 
        found: !!userData, 
        hasError: !!userError, 
        errorCode: userError?.code, 
        errorMessage: userError?.message 
      });

      if (userError) {
        console.error('[AuthContext] User query error:', userError);
        throw new Error('User not found. Please check your credentials.');
      }

      if (!userData) {
        console.error('[AuthContext] No user data found for user_id:', user_id);
        throw new Error('Invalid user ID or password.');
      }

      // Debug: Show user data (except sensitive info)
      console.log('[AuthContext] User found:', { 
        user_id: userData.user_id, 
        email: userData.email, 
        role: userData.role 
      });

      // Verify the password
      let passwordMatch = false;
      
      // Check if password is hashed (starts with $2b$)
      if (userData.password && userData.password.startsWith('$2b$')) {
        // Use bcrypt compare for hashed passwords
        try {
          passwordMatch = await bcrypt.compare(password, userData.password);
        } catch (err) {
          console.error('[AuthContext] Error comparing passwords with bcrypt:', err);
          // Fallback to direct comparison if bcrypt fails
          passwordMatch = password === userData.password;
        }
      } else {
        // Direct comparison for unhashed passwords
        passwordMatch = password === userData.password;
      }

      if (!passwordMatch) {
        console.error('[AuthContext] Password mismatch for user:', user_id);
        throw new Error('Invalid user ID or password.');
      }

      // Remove password from user data before storing
      const { password: _, ...userWithoutPassword } = userData;
      
      // Set the user in state and localStorage
      setUser(userWithoutPassword);
      saveAuthState(userWithoutPassword);
      
      console.log('[AuthContext] Login successful for user:', userWithoutPassword.user_id);
      return userWithoutPassword.user_id;
    } catch (error: unknown) {
      console.error('[AuthContext] Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (user_id: string, email: string, password: string) => {
    try {
      console.log('[AuthContext] Signup attempt:', { user_id, email });
      setLoading(true);
      setError(null);

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

      if (userIdError && userIdError.code !== 'PGRST116') {
        console.error('[AuthContext] Error checking existing user ID:', userIdError);
        throw new Error('Error checking user ID. Please try again.');
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

      if (emailError && emailError.code !== 'PGRST116') {
        console.error('[AuthContext] Error checking existing email:', emailError);
        throw new Error('Error checking email. Please try again.');
      }

      if (existingEmail) {
        throw new Error('Email already registered. Please use a different email or login.');
      }

      // Default role is student for new signups
      const role = 'student';

      // Generate OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setEmailOtp(otp);

      // Store pending user
      setPendingUser({
        user_id,
        email,
        hashedPassword: password, // In a real app, you'd hash this password
        role
      });

      // Log the OTP to console (for demo purposes)
      console.log(`[AuthContext] OTP for ${email}: ${otp}`);

      return { 
        success: true, 
        message: 'Verification code sent to your email. Please verify to complete registration.' 
      };
    } catch (error: unknown) {
      console.error('[AuthContext] Signup failed:', (error as Error).message);
      setError((error as Error).message);
      return { success: false, message: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  // Email verification with OTP
  const verifyEmail = async (otp: string) => {
    try {
      console.log('[AuthContext] Verifying email with OTP');
      setLoading(true);
      
      if (!pendingUser) {
        throw new Error('No pending registration found.');
      }

      if (otp !== emailOtp) {
        throw new Error('Invalid verification code. Please try again.');
      }

      // Insert into users table
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            user_id: pendingUser.user_id,
            email: pendingUser.email,
            password: pendingUser.hashedPassword,
            role: pendingUser.role,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) {
        console.error('[AuthContext] Error creating user:', error);
        throw error;
      }

      // Optional: Register with Supabase Auth too (if you're using Supabase auth)
      try {
        const { error: authError } = await supabase.auth.signUp({
          email: pendingUser.email,
          password: pendingUser.hashedPassword,
        });
        
        if (authError) {
          console.warn('[AuthContext] Supabase auth signup warning:', authError);
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase auth signup error:', err);
        // Continue regardless, as we're using our custom auth
      }

      console.log('[AuthContext] User created successfully:', data[0]);
      setUser(data[0] as UserData);
      setPendingUser(null);
      setEmailOtp(null);
      
      return true;
    } catch (error: unknown) {
      console.error('[AuthContext] Email verification failed:', (error as Error).message);
      setError((error as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out user');
      setLoading(true);
      
      // Sign out from Supabase auth
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AuthContext] Supabase signout error:', err);
      }
      
      // Reset user and session states immediately
      setUser(null);
      setSession(null);
      
      // Remove from localStorage
      saveAuthState(null);
      
      console.log('[AuthContext] Logout completed successfully');
    } catch (error: unknown) {
      console.error('[AuthContext] Logout failed:', (error as Error).message);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    verifyEmail,
    isAuthenticated: !!user && user !== null,  // Ensure this is based only on our custom user data
  };

  // Debug helper - expose context object to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__authDebug = {
      getAuthState: () => ({
        user,
        session,
        loading,
        isAuthenticated: !!user && user !== null,
      }),
      setUser: (userData: any) => {
        console.log('[AUTH DEBUG] Setting user state manually to:', userData);
        setUser(userData);
        saveAuthState(userData);
      }
    };
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};