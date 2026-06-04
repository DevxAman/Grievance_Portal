import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import BackgroundCarousel from './BackgroundCarousel';
import { ShieldCheck, ArrowRight, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { canFileGrievance, getDashboardPathForRole, getStaffPanelLabel, isStaffRole } from '../../lib/roles';

const HeroSection: React.FC = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const badgeSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-14px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 300, config: { tension: 220, friction: 24 },
  });

  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(28px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 520, config: { tension: 200, friction: 26 },
  });

  const subtitleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 720, config: { tension: 200, friction: 26 },
  });

  const ctaSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 900, config: { tension: 200, friction: 26 },
  });

  const statsSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    delay: 1150, config: { tension: 180, friction: 28 },
  });

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Background Carousel */}
      <BackgroundCarousel externalSlide={currentSlide} onSlideChange={setCurrentSlide} />

      {/* Main hero content */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 pb-36 pt-28 text-center sm:px-6 lg:px-8">

        {/* Institution Badge */}
        <animated.div style={badgeSpring} className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="text-white/90 text-xs sm:text-sm font-semibold tracking-wide">
              Guru Nanak Dev Engineering College, Ludhiana
            </span>
          </div>
        </animated.div>

        {/* Headline */}
        <animated.div style={titleSpring} className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-2xl sm:text-6xl md:text-7xl">
            <span className="block">Your Grievance,</span>
            <span
              className="block mt-1.5"
              style={{
                WebkitTextFillColor: 'transparent',
                backgroundImage: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 45%, #e0f2fe 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              Our Responsibility
            </span>
          </h1>
        </animated.div>

        {/* Portal Label */}
        <animated.div style={subtitleSpring} className="mb-3">
          <span className="text-blue-300/80 text-xs sm:text-sm font-bold uppercase tracking-[0.2em]">
            Grievance Redressal Portal
          </span>
        </animated.div>

        {/* Subtitle */}
        <animated.p
          style={subtitleSpring}
          className="text-base sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed font-light mb-10 sm:mb-12"
        >
          A transparent and accountable system for students and staff at GNDEC. Every concern is heard, tracked, and resolved with fairness.
        </animated.p>

        {/* CTA Buttons */}
        <animated.div style={ctaSpring} className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          {canFileGrievance(user?.role) ? (
            <Link
            to="/file-grievance"
            className="group flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-2xl shadow-blue-900/50 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-blue-500/40 whitespace-nowrap"
          >
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            File a Grievance
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </Link>
          ) : isStaffRole(user?.role) ? (
            <Link
              to={getDashboardPathForRole(user?.role)}
              className={`group flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 whitespace-nowrap ${
                user?.role === 'clerk'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/50'
              }`}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              {getStaffPanelLabel(user?.role)}
            </Link>
          ) : null}
          <Link
            to="/track-grievance"
            className="group flex-1 max-w-xs inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/80 bg-white px-7 py-4 text-base font-bold text-slate-900 shadow-2xl shadow-black/25 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 whitespace-nowrap"
            >
            <Search className="w-4 h-4 flex-shrink-0 text-blue-600" />
            {isStaffRole(user?.role) ? 'Manage Grievances' : 'Track Your Grievance'}
          </Link>
        </animated.div>

        {/* Trust row */}
        <animated.div style={statsSpring} className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {[
            { value: '100%', label: 'Secure & Confidential' },
            { value: '24 / 7', label: 'Online Access' },
            { value: 'Fast', label: 'Resolution Tracking' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-white font-extrabold text-2xl sm:text-3xl leading-tight tracking-tight">{item.value}</span>
              <span className="text-white/50 text-xs sm:text-sm mt-1 font-medium">{item.label}</span>
            </div>
          ))}
        </animated.div>
      </div>

      {/* Smooth bottom fade → slate-50 (next section bg) */}
      {/* Smooth bottom fade → iski height kam kar di */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '80px', zIndex: 25, background: 'linear-gradient(to bottom, transparent 0%, #f8fafc 100%)' }}
      />
    </div>
  );
};

export default HeroSection;
