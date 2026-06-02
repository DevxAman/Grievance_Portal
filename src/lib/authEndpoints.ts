import { login, signup, verifyEmail } from './api';
import bcrypt from 'bcryptjs';

// Store pending registrations temporarily (in a production app, use a more persistent method)
interface PendingRegistration {
  user_id: string;
  email: string;
  hashedPassword: string;
  role: string;
  otp: string;
  created_at: number; // Timestamp for expiration
}

const pendingRegistrations: Map<string, PendingRegistration> = new Map();

// Endpoint for login
export async function handleLogin(req: Request): Promise<Response> {
  try {
    console.log('Login request received');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed successfully:', { 
        user_id: body.user_id, 
        password: body.password ? '********' : undefined 
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid request format. Please provide valid JSON.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { user_id, password } = body;
    
    // Validate input
    if (!user_id || !password) {
      console.error('Missing required fields:', { 
        hasUserId: !!user_id, 
        hasPassword: !!password 
      });
      
      return new Response(
        JSON.stringify({ success: false, message: 'User ID and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Calling login function with user_id:', user_id);
    
    // Call login function
    try {
      const user = await login(user_id, password);
      
      // Determine redirect path based on user role
      let redirectPath = '/dashboard';
      if (user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'clerk') {
        redirectPath = '/clerk/dashboard';
      } else if (user.role === 'dsw') {
        redirectPath = '/dsw/dashboard';
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user, 
          redirectPath 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (loginError) {
      console.error('Login failed:', loginError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: loginError instanceof Error ? loginError.message : 'Authentication failed' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Login endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Endpoint for signup
export async function handleSignup(req: Request): Promise<Response> {
  try {
    console.log('Signup request received');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed successfully:', { 
        user_id: body.user_id, 
        email: body.email,
        password: body.password ? '********' : undefined 
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid request format. Please provide valid JSON.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { user_id, email, password } = body;
    
    // Validate input
    if (!user_id || !email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: 'User ID, email, and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call signup function
    try {
      const signupResult = await signup(user_id, email, password);
      
      if (signupResult.success && signupResult.otp) {
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Store pending registration
        pendingRegistrations.set(email, {
          user_id,
          email,
          hashedPassword,
          role: 'student', // Default role for new users
          otp: signupResult.otp,
          created_at: Date.now()
        });
        
        // Log OTP for development purposes (remove in production)
        console.log(`Dev only - OTP for ${email}: ${signupResult.otp}`);
        
        // Set expiration for pending registration (30 minutes)
        setTimeout(() => {
          pendingRegistrations.delete(email);
        }, 30 * 60 * 1000);
      }
      
      // Return response (without exposing the OTP)
      return new Response(
        JSON.stringify({ 
          success: signupResult.success, 
          message: signupResult.message 
        }),
        { 
          status: signupResult.success ? 200 : 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (signupError) {
      console.error('Signup failed:', signupError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: signupError instanceof Error ? signupError.message : 'Registration failed' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Signup endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Endpoint for email verification
export async function handleVerification(req: Request): Promise<Response> {
  try {
    console.log('Verification request received');
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed successfully:', { 
        email: body.email, 
        otp: body.otp 
      });
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid request format. Please provide valid JSON.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { email, otp } = body;
    
    // Validate input
    if (!email || !otp) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and verification code are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if registration exists
    const pendingReg = pendingRegistrations.get(email);
    if (!pendingReg) {
      return new Response(
        JSON.stringify({ success: false, message: 'No pending registration found or it has expired' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call verifyEmail function
    try {
      const verificationResult = await verifyEmail(
        pendingReg.user_id,
        pendingReg.email,
        pendingReg.hashedPassword,
        pendingReg.role,
        pendingReg.otp,
        otp
      );
      
      // Clean up pending registration if successful
      if (verificationResult.success) {
        pendingRegistrations.delete(email);
      }
      
      // Return response
      return new Response(
        JSON.stringify({
          success: verificationResult.success,
          message: verificationResult.message,
          user: verificationResult.user
        }),
        { 
          status: verificationResult.success ? 200 : 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (verificationError) {
      console.error('Verification failed:', verificationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: verificationError instanceof Error ? verificationError.message : 'Verification failed' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Verification endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 