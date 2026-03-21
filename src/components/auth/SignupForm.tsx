import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Key, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SignupForm: React.FC = () => {
  const [user_id, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState({
    user_id: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signup, verifyEmail, error: authError, loading: authLoading, clearError } = useAuth();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      user_id: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    };

    // Validate user_id
    if (!user_id) {
      newErrors.user_id = 'User ID is required';
      valid = false;
    }

    // Validate email
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@gndec\.ac\.in$/.test(email)) {
      newErrors.email = 'Must be a valid GNDEC email (@gndec.ac.in)';
      valid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateOtp = () => {
    let valid = true;
    const newErrors = { ...errors, otp: '' };

    if (!otp) {
      newErrors.otp = 'Verification code is required';
      valid = false;
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      newErrors.otp = 'Verification code must be 6 digits';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Update message when authError changes
  React.useEffect(() => {
    if (authError) {
      setMessage({ type: 'error', text: authError });
    }
  }, [authError]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        setMessage(null);
        clearError();
        
        console.log('Starting signup process with:', { user_id, email });
        const result = await signup(user_id, email, password);
        
        if (result.success) {
          setShowOtpInput(true);
          setMessage({ type: 'success', text: result.message });
        } else {
          console.error('Signup failed:', result.message);
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
        console.error('Signup exception:', errorMessage);
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateOtp()) {
      try {
        setLoading(true);
        setMessage(null);
        clearError();
        
        console.log('Verifying email with OTP');
        const success = await verifyEmail(otp);
        
        if (success) {
          setMessage({ type: 'success', text: 'Email verified successfully! Redirecting to login...' });
          // Navigate to login page after short delay
          setTimeout(() => {
            navigate('/login', { 
              state: { message: 'Account created successfully. You can now log in.' } 
            });
          }, 2000);
        } else {
          setMessage({ type: 'error', text: 'Verification failed. Please check the code and try again.' });
        }
      } catch (error: unknown) {
        setMessage({ type: 'error', text: (error as Error).message || 'Verification failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10">
      {showOtpInput ? (
        <form onSubmit={handleVerify} className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Verify Your Email
          </h2>
          
          {message && (
            <div className={`p-4 rounded-lg flex items-center ${
              message.type === 'success' ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          )}
          
          <p className="text-gray-300 mb-4">
            We've sent a verification code to your email. Please enter it below to complete your registration.
          </p>
          
          <div>
            <label htmlFor="otp" className="block text-gray-200 mb-2 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-300" />
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.otp ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            {errors.otp && (
              <p className="mt-1 text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.otp}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || authLoading}
            className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] font-medium ${
              (loading || authLoading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {(loading || authLoading) ? (
              <>
                <span className="mr-2 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Verifying...
              </>
            ) : (
              <>
                Verify Email <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Create Your Account
          </h2>
          
          {message && (
            <div className={`p-4 rounded-lg flex items-center ${
              message.type === 'success' ? 'bg-green-500/30 text-green-100' : 'bg-red-500/30 text-red-100'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 mr-2" />
              )}
              <span>{message.text}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="user_id" className="block text-gray-200 mb-2 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-300" />
              User ID
            </label>
            <input
              id="user_id"
              type="text"
              value={user_id}
              onChange={(e) => setUserId(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.user_id ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Ex: ravi_k12"
            />
            {errors.user_id && (
              <p className="mt-1 text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.user_id}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-200 mb-2 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-300" />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.email ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="your.name@gndec.ac.in"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-gray-200 mb-2 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-300" />
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                  errors.password ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="•••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-200 mb-2 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-blue-300" />
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border ${
                errors.confirmPassword ? 'border-red-500' : 'border-white/20'
              } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="•••••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-red-400 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || authLoading}
            className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] font-medium ${
              (loading || authLoading) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {(loading || authLoading) ? (
              <>
                <span className="mr-2 animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Creating Account...
              </>
            ) : (
              <>
                Sign Up <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
          
          <div className="text-center mt-4 text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default SignupForm;