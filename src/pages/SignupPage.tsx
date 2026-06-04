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
    <div className="relative min-h-screen bg-slate-950 pt-16">
      {/* Background Carousel */}
      <BackgroundCarousel 
        externalSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      {/* Content */}
      <div className="relative z-40 container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          <animated.div style={fadeIn} className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-100 backdrop-blur-md">
              GNDEC portal
            </span>
            <h1 className="mb-4 mt-4 text-3xl font-extrabold text-white drop-shadow-lg md:text-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
                Create your account
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-7 text-white/75 sm:text-lg">
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
