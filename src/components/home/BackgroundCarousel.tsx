import React, { useState, useEffect, useRef, useCallback } from 'react';

// Import local images from assets folder
import image1 from '../../assets/1519122936phpePM7ls.jpeg';
import image2 from '../../assets/1489641871php5ZZD7g.png';
import image3 from '../../assets/1489641851phpadqE3r.png';
import image4 from '../../assets/1.jpg';
import image5 from '../../assets/6080350760060700394.jpg';
import image6 from '../../assets/WhatsApp Image 2025-04-25 at 17.20.42_fc85894d.jpg';

// Use local images from assets folder
const campusImages = [
  image1,
  image2, 
  image3,
  image4,
  image5,
  image6
];

// Preload all images on component initialization
campusImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

interface BackgroundCarouselProps {
  externalSlide?: number;
  onSlideChange?: (index: number) => void;
}

const BackgroundCarousel: React.FC<BackgroundCarouselProps> = ({ 
  externalSlide, 
  onSlideChange 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitioningRef = useRef(false);

  // Fixed transition constants to ensure uniform timing
  const TRANSITION_DURATION = 2000; // 2 seconds for a smoother fade transition
  const DISPLAY_DURATION = 8000;    // 8 seconds to display each image before transition
  
  // Handle external slide changes
  useEffect(() => {
    if (externalSlide !== undefined && externalSlide !== currentImageIndex && !transitioningRef.current) {
      changeSlide(externalSlide);
    }
  }, [externalSlide]);

  // Notify parent component about slide changes
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentImageIndex);
    }
  }, [currentImageIndex, onSlideChange]);
  
  const changeSlide = useCallback((newIndex: number) => {
    if (transitioningRef.current) return;
    
    // Reset timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Set transitioning state
    setIsTransitioning(true);
    transitioningRef.current = true;
    
    // Set the next image index
    setNextImageIndex(newIndex);
    
    // After transition completes, update current image
    timeoutRef.current = setTimeout(() => {
      setCurrentImageIndex(newIndex);
      setIsTransitioning(false);
      transitioningRef.current = false;
      
      // Prepare the next image index for the following transition
      setNextImageIndex((newIndex + 1) % campusImages.length);
      
      // Restart carousel
      startCarousel();
    }, TRANSITION_DURATION);
  }, []);
  
  const startCarousel = useCallback(() => {
    // Clear any existing intervals to prevent overlap
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set a new interval
    intervalRef.current = setInterval(() => {
      if (transitioningRef.current) return;
      
      // Start transition
      const nextIndex = (currentImageIndex + 1) % campusImages.length;
      changeSlide(nextIndex);
    }, DISPLAY_DURATION);
  }, [currentImageIndex, changeSlide]);

  useEffect(() => {
    // Start the carousel when component mounts
    startCarousel();
    
    // Cleanup on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [startCarousel]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      
      {/* Current image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full transition-opacity ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          backgroundImage: `url("${campusImages[currentImageIndex]}")`,
          filter: 'brightness(0.45)',
          transitionDuration: `${TRANSITION_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out'
        }}
      />
      
      {/* Next image (pre-loaded and hidden until transition) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat w-full h-full transition-opacity ${isTransitioning ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
          backgroundImage: `url("${campusImages[nextImageIndex]}")`,
          filter: 'brightness(0.45)',
          transitionDuration: `${TRANSITION_DURATION}ms`,
          transitionTimingFunction: 'ease-in-out'
        }}
      />
      
      {/* Gradients for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 z-15"></div>
    </div>
  );
};

export default BackgroundCarousel; 