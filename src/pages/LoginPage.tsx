import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import BackgroundCarousel from '../components/home/BackgroundCarousel';
import { useSpring, animated } from '@react-spring/web';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, error: authError, clearError, loading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Spring animations
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
    delay: 200,
  });

  const formSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 280, friction: 20 },
    delay: 300,
  });
  
  // Check for redirect message in location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let redirectPath = '/dashboard';
      
      // Determine redirect path based on user role
      if (user.role === 'admin') {
        redirectPath = '/admin/dashboard';
      } else if (user.role === 'clerk') {
        redirectPath = '/clerk/dashboard';
      } else if (user.role === 'dsw') {
        redirectPath = '/dsw/dashboard';
      }
      
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLogin = async (user_id: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      clearError();
      
      console.log('[LoginPage] Starting login process with user_id:', user_id);
      
      // Use the context's login function directly
      const redirectPath = await login(user_id, password) || '/dashboard';
      
      console.log('[LoginPage] Login successful, redirecting to:', redirectPath);
      setSuccess('Login successful! Redirecting...');
      
      // Navigate to appropriate dashboard
      setTimeout(() => {
        navigate(redirectPath);
      }, 500);
    } catch (err) {
      console.error('[LoginPage] Login failed:', err);
      setError((err as Error).message || 'Login failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  // If authError exists, update local error state
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background Carousel */}
      <BackgroundCarousel 
        externalSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      {/* Content */}
      <div className="relative z-40 container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <animated.div style={fadeIn} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                Sign in to your account
              </span>
            </h1>
            <p className="text-lg text-gray-100 max-w-xl mx-auto">
              Access your grievances and account information
            </p>
          </animated.div>
          
          {error && (
            <animated.div 
              style={fadeIn} 
              className="mb-6 p-4 bg-red-500/30 backdrop-blur-md border border-red-500/50 text-white rounded-lg flex items-center shadow-lg"
            >
              <AlertCircle className="h-5 w-5 mr-2 text-red-300" />
              <span>{error}</span>
            </animated.div>
          )}
          
          {success && (
            <animated.div 
              style={fadeIn} 
              className="mb-6 p-4 bg-green-500/30 backdrop-blur-md border border-green-500/50 text-white rounded-lg flex items-center shadow-lg"
            >
              <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
              <span>{success}</span>
            </animated.div>
          )}
          
          {(loading || authLoading) && (
            <animated.div 
              style={fadeIn} 
              className="mb-6 p-4 bg-blue-500/30 backdrop-blur-md border border-blue-500/50 text-white rounded-lg flex items-center shadow-lg"
            >
              <Loader2 className="h-5 w-5 mr-2 text-blue-300 animate-spin" />
              <span>Signing in to your account...</span>
            </animated.div>
          )}
          
          <animated.div style={formSpring}>
            <LoginForm onLogin={handleLogin} />
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;