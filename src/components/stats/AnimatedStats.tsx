import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated } from '@react-spring/web';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGrievance } from '../../hooks/useGrievance';
import { Statistic } from '../../types';
import { RefreshCw } from 'lucide-react';

interface StatProps {
  number: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatProps> = ({ number, label, delay }) => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    },
    delay,
    config: { tension: 100, friction: 20 },
  });

  useEffect(() => {
    if (inView) {
      gsap.to(`#stat-${label.replace(/\s+/g, '-')}`, {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
    }
  }, [inView, label]);

  return (
    <animated.div
      ref={ref}
      style={props}
      className="text-center p-6"
    >
      <div 
        id={`stat-${label.replace(/\s+/g, '-')}`}
        className="text-4xl md:text-5xl font-bold text-white mb-2 transform transition-transform"
      >
        {number}
      </div>
      <div className="text-blue-100 text-sm md:text-base">{label}</div>
    </animated.div>
  );
};

const AnimatedBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create animated wave geometry
    const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    
    const wave = new THREE.Mesh(geometry, material);
    wave.rotation.x = -Math.PI / 2;
    scene.add(wave);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    camera.position.z = 5;
    camera.position.y = 2;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      const vertices = wave.geometry.attributes.position.array as Float32Array;
      const time = Date.now() * 0.001;

      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.sin((vertices[i] + time) * 0.5) * 0.5 +
                         Math.sin((vertices[i + 1] + time) * 0.5) * 0.5;
      }

      wave.geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 -z-10" />;
};

const AnimatedStats: React.FC = () => {
  const { statistics, loading, updateStatistics } = useGrievance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Format statistics data
  const formatStatistics = (data: Statistic | null) => [
    { 
      number: data ? `${Math.round(data.resolution_rate)}%` : '0%', 
      label: 'Resolution Rate' 
    },
    { 
      number: data ? `${Math.round(data.avg_response_time * 24)}h` : '0h', 
      label: 'Average Response Time' 
    },
    { 
      number: data ? `${data.grievances_resolved}+` : '0', 
      label: 'Grievances Resolved' 
    },
    { 
      number: data ? `${data.user_satisfaction.toFixed(1)}/5` : '0/5', 
      label: 'User Satisfaction' 
    }
  ];

  const stats = statistics ? formatStatistics(statistics) : [
    { number: '0%', label: 'Resolution Rate' },
    { number: '0h', label: 'Average Response Time' },
    { number: '0', label: 'Grievances Resolved' },
    { number: '0/5', label: 'User Satisfaction' },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await updateStatistics();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Last updated timestamp
  const getLastUpdated = () => {
    if (!statistics) return 'Not available';
    
    try {
      const date = new Date(statistics.last_updated);
      return `Last updated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    } catch (_) {
      return 'Last updated: Not available';
    }
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-white">Live Statistics</h2>
          
          <button 
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 focus:ring-2 focus:ring-white/30 rounded-lg text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              number={stat.number}
              label={stat.label}
              delay={index * 100}
            />
          ))}
        </div>
        
        <div className="text-center mt-8 text-blue-200 text-sm opacity-70">
          {getLastUpdated()}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;