import React, { useState, useEffect, useRef, useCallback } from 'react';

import image1 from '../../assets/1519122936phpePM7ls.jpeg';
import image2 from '../../assets/1489641871php5ZZD7g.png';
import image3 from '../../assets/1489641851phpadqE3r.png';
import image4 from '../../assets/1.jpg';
import image5 from '../../assets/6080350760060700394.jpg';
import image6 from '../../assets/WhatsApp Image 2025-04-25 at 17.20.42_fc85894d.jpg';

const campusImages = [image1, image2, image3, image4, image5, image6];
campusImages.forEach(src => { const img = new Image(); img.src = src; });

interface BackgroundCarouselProps {
  externalSlide?: number;
  onSlideChange?: (index: number) => void;
}

const DISPLAY_MS = 5500;
const TRANSITION_MS = 780;

const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({ externalSlide, onSlideChange }) => {
  const [current, setCurrent] = useState(0);
  const [nextSlide, setNextSlide] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const currentRef = useRef(0);
  const busyRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((newIdx: number) => {
    if (busyRef.current || newIdx === currentRef.current) return;
    busyRef.current = true;

    // Mount next slide off-screen right (not animating)
    setNextSlide(newIdx);
    setAnimating(false);

    // Double rAF ensures browser paints next slide at x=100% before we start
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimating(true);
        setTimeout(() => {
          setCurrent(newIdx);
          currentRef.current = newIdx;
          setNextSlide(null);
          setAnimating(false);
          busyRef.current = false;
          onSlideChange?.(newIdx);
        }, TRANSITION_MS + 60);
      });
    });
  }, [onSlideChange]);

  // Continuous auto-play loop
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const next = (currentRef.current + 1) % campusImages.length;
      goTo(next);
    }, DISPLAY_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [goTo]);

  // External control
  useEffect(() => {
    if (externalSlide !== undefined && externalSlide !== currentRef.current) {
      goTo(externalSlide);
    }
  }, [externalSlide, goTo]);

  const base: React.CSSProperties = {
    position: 'absolute', inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(0.38) saturate(1.2)',
    willChange: 'transform',
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>

      {/* Current slide — slides out to the left */}
      <div style={{
        ...base,
        backgroundImage: `url("${campusImages[current]}")`,
        transform: animating ? 'translateX(-100%)' : 'translateX(0)',
        transition: animating ? `transform ${TRANSITION_MS}ms cubic-bezier(0.76,0,0.24,1)` : 'none',
        zIndex: 1,
      }} />

      {/* Incoming slide — enters from the right */}
      {nextSlide !== null && (
        <div style={{
          ...base,
          backgroundImage: `url("${campusImages[nextSlide]}")`,
          transform: animating ? 'translateX(0)' : 'translateX(100%)',
          transition: animating ? `transform ${TRANSITION_MS}ms cubic-bezier(0.76,0,0.24,1)` : 'none',
          zIndex: 2,
        }} />
      )}

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.18) 65%, rgba(0,0,0,0.72) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 6,
        background: 'linear-gradient(to right, rgba(0,0,0,0.22) 0%, transparent 28%, transparent 72%, rgba(0,0,0,0.22) 100%)',
      }} />

      {/* Dot indicators — bottom right */}
      {/* <div className="absolute bottom-6 right-8 sm:bottom-8 sm:right-12 flex items-center gap-2.5" style={{ zIndex: 10 }}>
        {campusImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Slide ${idx + 1}`}
            style={{ transition: 'all 0.35s ease' }}
            className={`rounded-full ${
              idx === current
                ? 'w-7 h-2 bg-white shadow-md'
                : 'w-2 h-2 bg-white/35 hover:bg-white/65'
            }`}
          />
        ))}
      </div> */}
    </div>
  );
};

export default BackgroundCarousel;