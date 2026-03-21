import React, { useState } from 'react';
import SignupForm from '../components/auth/SignupForm';
import BackgroundCarousel from '../components/home/BackgroundCarousel';
import { useSpring, animated } from '@react-spring/web';

const SignupPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
                Create your account
              </span>
            </h1>
            <p className="text-lg text-gray-100 max-w-xl mx-auto">
              Join the GNDEC Grievance Redressal Portal
            </p>
          </animated.div>
          
          <animated.div style={formSpring}>
            <SignupForm />
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;