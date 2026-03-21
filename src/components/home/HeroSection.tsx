import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/web';
import BackgroundCarousel from './BackgroundCarousel';
import { Book } from 'lucide-react';

const HeroSection: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Spring animations for content
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
  });
  
  const buttonSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 600,
  });
  
  const cardsSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(60px)', scale: 0.9 },
    to: { opacity: 1, transform: 'translateY(0)', scale: 1 },
    delay: 800,
    config: { mass: 1.2, tension: 180, friction: 24 }
  });

  // Individual card animations with staggered delay
  const card1Spring = useSpring({
    from: { opacity: 0, transform: 'translateY(80px) scale(0.8)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    delay: 1000,
    config: { mass: 1, tension: 210, friction: 20 }
  });

  const card2Spring = useSpring({
    from: { opacity: 0, transform: 'translateY(80px) scale(0.8)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    delay: 1200,
    config: { mass: 1, tension: 210, friction: 20 }
  });

  const card3Spring = useSpring({
    from: { opacity: 0, transform: 'translateY(80px) scale(0.8)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    delay: 1400,
    config: { mass: 1, tension: 210, friction: 20 }
  });
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    
    mountRef.current.appendChild(renderer.domElement);
    
    // Create a simple building model
    const buildingGroup = new THREE.Group();
    
    // Main building body
    const buildingGeometry = new THREE.BoxGeometry(3, 2, 1.5);
    const buildingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      metalness: 0.2,
      roughness: 0.5,
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    buildingGroup.add(building);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(2.2, 1, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.5;
    roof.rotation.y = Math.PI / 4;
    buildingGroup.add(roof);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xdbeafe,
      emissive: 0xdbeafe,
      emissiveIntensity: 0.3,
    });
    
    // Front windows
    for (let i = 0; i < 6; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const windowGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(
        -0.8 + col * 0.8, 
        0 - row * 0.8, 
        0.8
      );
      buildingGroup.add(windowMesh);
    }
    
    // Add entrance
    const doorGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x1e40af });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, -0.6, 0.8);
    buildingGroup.add(door);
    
    // Add steps
    const stepsGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
    const stepsMaterial = new THREE.MeshStandardMaterial({ color: 0x64748b });
    const steps = new THREE.Mesh(stepsGeometry, stepsMaterial);
    steps.position.set(0, -1.1, 0.9);
    buildingGroup.add(steps);
    
    // Add to scene
    scene.add(buildingGroup);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);
    
    // Camera position
    camera.position.z = 5;
    camera.position.y = 1;
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const animate = () => {
      if (!mountRef.current) return;
      
      buildingGroup.rotation.y += 0.005;
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          }
        }
      });
      
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="relative min-h-[80vh]">
      {/* Carousel Background */}
      <BackgroundCarousel 
        externalSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      {/* 3D animation container
      <div 
        ref={mountRef} 
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.4, zIndex: 5 }}
      />
       */}
      {/* Content overlay */}
      <div className="relative z-40 pt-16 sm:pt-20 md:pt-24 flex flex-col items-center justify-center min-h-[80vh] text-center px-4 sm:px-6 lg:px-8">
        <animated.div style={fadeIn} className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <Book className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300 mr-2 sm:mr-3 filter drop-shadow-lg" />
            <div className="bg-white/30 backdrop-blur-lg px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg">
              GNDEC Grievance Portal
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white max-w-4xl mx-auto leading-tight mb-6 sm:mb-8 drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-50">
              GNDEC Grievance
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
              Redressal Portal
            </span>
          </h1>
          
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-md backdrop-blur-sm bg-black/10 p-3 sm:p-4 rounded-lg">
            A platform where your concerns matter. Submit and track grievances with a streamlined and transparent process.
          </p>
        </animated.div>
        
        {/* Action buttons with glass effect container for better visibility */}
        <animated.div 
          style={buttonSpring} 
          className="mt-8 sm:mt-10 mb-6 sm:mb-8 z-50 relative w-full px-4 sm:px-0"
        >
          <div className="backdrop-blur-xl bg-white/10 p-4 sm:p-6 rounded-xl shadow-2xl border border-white/20 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:gap-4 md:gap-8 lg:gap-10 justify-center items-center">
              <Link 
                to="/file-grievance" 
                className="w-full sm:w-auto flex-1 px-4 py-3 sm:py-4 mb-3 sm:mb-0 rounded-lg text-sm sm:text-base md:text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] hover:shadow-blue-500/30 text-center"
              >
                File a Grievance
              </Link>
              <Link 
                to="/track-grievance" 
                className="w-full sm:w-auto flex-1 px-4 py-3 sm:py-4 rounded-lg text-sm sm:text-base md:text-lg font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] hover:shadow-white/30 text-center"
              >
                Track Your Grievance
              </Link>
            </div>
          </div>
        </animated.div>
        
        {/* Indicators - moved from bottom to above steps */}
        <div className="flex justify-center z-30 my-4 sm:my-6">
          <div className="flex space-x-1.5 sm:space-x-2 bg-black/40 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-lg">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'w-8 sm:w-10 bg-white' 
                    : 'w-2 sm:w-2.5 bg-white/60 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Process cards */}
      <animated.div 
        style={cardsSpring} 
        className="relative z-40 max-w-7xl mx-auto px-4 mt-4 sm:mt-6 md:mt-10 pt-8 sm:pt-12 md:pt-16 mb-12 sm:mb-16 sm:px-6 lg:px-8"
      >
        <div className="relative mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 inline-block bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <animated.div 
            style={card1Spring}
            className="bg-black/40 backdrop-blur-lg p-6 sm:p-8 pt-10 sm:pt-12 pb-8 sm:pb-14 rounded-xl border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:bg-black/50 hover:border-blue-700/40 hover:shadow-blue-900/20 flex flex-col min-h-[250px] sm:min-h-[300px]"
          >
            <div className="relative">
              <span className="absolute -top-3 -left-3 bg-blue-700 text-white text-xl sm:text-2xl font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-lg">1</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Submit Grievance</h3>
            <p className="text-base sm:text-lg text-gray-100 text-center flex-grow leading-relaxed tracking-wide">
              Fill out the grievance form with relevant details and supporting documents.
            </p>
          </animated.div>
          
          <animated.div 
            style={card2Spring}
            className="bg-black/40 backdrop-blur-lg p-6 sm:p-8 pt-10 sm:pt-12 pb-8 sm:pb-14 rounded-xl border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:bg-black/50 hover:border-blue-700/40 hover:shadow-blue-900/20 flex flex-col min-h-[250px] sm:min-h-[300px]"
          >
            <div className="relative">
              <span className="absolute -top-3 -left-3 bg-blue-700 text-white text-xl sm:text-2xl font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-lg">2</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Track Progress</h3>
            <p className="text-base sm:text-lg text-gray-100 text-center flex-grow leading-relaxed tracking-wide">
              Monitor the status of your grievance in real-time through your dashboard.
            </p>
          </animated.div>
          
          <animated.div 
            style={card3Spring}
            className="bg-black/40 backdrop-blur-lg p-6 sm:p-8 pt-10 sm:pt-12 pb-8 sm:pb-14 rounded-xl border border-gray-700/50 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:bg-black/50 hover:border-blue-700/40 hover:shadow-blue-900/20 flex flex-col min-h-[250px] sm:min-h-[300px] sm:col-span-2 md:col-span-1 mx-auto sm:mx-0 sm:col-start-1 md:col-start-auto max-w-md sm:max-w-none"
          >
            <div className="relative">
              <span className="absolute -top-3 -left-3 bg-blue-700 text-white text-xl sm:text-2xl font-bold w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-lg">3</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">Get Resolution</h3>
            <p className="text-base sm:text-lg text-gray-100 text-center flex-grow leading-relaxed tracking-wide">
              Receive updates and resolutions directly through the portal and email.
            </p>
          </animated.div>
        </div>
      </animated.div>
    </div>
  );
};

export default HeroSection;