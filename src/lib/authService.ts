import type { User } from '../types';

/**
 * Client for interacting with the authentication API endpoints
 */
export const AuthService = {
  /**
   * Login with user ID and password
   * @param user_id User ID (e.g., ravi_k12)
   * @param password User password
   * @returns User data and redirect path if successful
   */
  login: async (user_id: string, password: string): Promise<{ 
    success: boolean;
    user?: User;
    redirectPath?: string;
    message?: string;
  }> => {
    try {
      console.log('Sending login request with user_id:', user_id);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error ${response.status}: ${response.statusText}`
        }));
        
        return {
          success: false,
          message: errorData.message || `Login failed with status: ${response.status}`
        };
      }
      
      // Safely parse the response JSON
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        console.error('Error parsing login response:', parseError);
        return { 
          success: false, 
          message: 'Could not parse server response. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Network error, please try again.' 
      };
    }
  },
  
  /**
   * Register a new user
   * @param user_id User ID 
   * @param email Email address (must be @gndec.ac.in)
   * @param password User password
   * @returns Success status and message
   */
  signup: async (user_id: string, email: string, password: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      console.log('Sending signup request for:', email);
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, email, password }),
      });
      
      // Get response data regardless of status code
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error parsing signup response:', parseError);
        return { 
          success: false, 
          message: 'Could not parse server response. Please try again.' 
        };
      }
      
      // If we have a 500 server error
      if (response.status === 500) {
        console.error('Server error during signup:', responseData);
        return {
          success: false,
          message: 'Server error occurred. Please try again later or contact support.'
        };
      }
      
      // For other non-200 responses
      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || `Signup failed with status: ${response.status}`
        };
      }
      
      return responseData;
    } catch (error) {
      console.error('Signup API error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Network error, please try again.' 
      };
    }
  },
  
  /**
   * Verify email with OTP code
   * @param email Email address used during signup
   * @param otp OTP verification code
   * @returns Success status, message, and user data if successful
   */
  verifyEmail: async (email: string, otp: string): Promise<{
    success: boolean;
    message: string;
    user?: User;
  }> => {
    try {
      console.log('Sending email verification for:', email);
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error ${response.status}: ${response.statusText}`
        }));
        
        return {
          success: false,
          message: errorData.message || `Verification failed with status: ${response.status}`
        };
      }
      
      // Safely parse the response JSON
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        console.error('Error parsing verification response:', parseError);
        return { 
          success: false, 
          message: 'Could not parse server response. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Email verification API error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Network error, please try again.' 
      };
    }
  }
}; 