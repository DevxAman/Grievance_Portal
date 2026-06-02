import React, { useEffect } from 'react';
import { Github, Linkedin, Mail, Globe, Code, Database, Palette, Award, Book, Cpu, Coffee } from 'lucide-react';
import { useSpring, animated, config } from '@react-spring/web';

interface DeveloperProps {
  name: string;
  role: string;
  bio: string;
  image: string;
  skills: string[];
  links: {
    github?: string;
    linkedin?: string;
    email?: string;
    website?: string;
  };
}

interface SkillIconProps {
  skill: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ skill }) => {
  const lowerSkill = skill.toLowerCase();
  
  if (lowerSkill.includes('react') || lowerSkill.includes('vite') || lowerSkill.includes('front')) {
    return <Code className="w-4 h-4 text-blue-500" />;
  } else if (lowerSkill.includes('node') || lowerSkill.includes('back') || lowerSkill.includes('supabase')) {
    return <Database className="w-4 h-4 text-green-600" />;
  } else if (lowerSkill.includes('design') || lowerSkill.includes('ui/ux')) {
    return <Palette className="w-4 h-4 text-purple-500" />;
  } else if (lowerSkill.includes('problem') || lowerSkill.includes('algorithm')) {
    return <Cpu className="w-4 h-4 text-amber-600" />;
  } else {
    return <Coffee className="w-4 h-4 text-red-500" />;
  }
};

const Developer: React.FC<DeveloperProps> = ({ name, role, bio, image, skills, links }) => {
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateY(50px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    to: { opacity: 1, transform: 'translateY(0px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    config: { mass: 1, tension: 280, friction: 60 },
    delay: 200,
  }));

  const [iconSprings, iconApi] = useSpring(() => ({
    from: { opacity: 0, transform: 'scale(0.5)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { mass: 0.8, tension: 200, friction: 20 },
    delay: 600,
  }));

  const handleMouseEnter = () => {
    api.start({
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      config: config.wobbly,
    });
  };

  const handleMouseLeave = () => {
    api.start({
      transform: 'translateY(0px)',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      config: config.gentle,
    });
  };

  return (
    <animated.div 
      style={springs}
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6 flex flex-col items-center">
        {/* Circular image with gradient border */}
        <div className="relative w-40 h-40 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-1">
            <div className="absolute inset-0 rounded-full bg-white p-0.5">
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full rounded-full object-cover object-center"
              />
            </div>
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{name}</h3>
        <p className="text-blue-600 font-medium mb-3">{role}</p>
        
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {skills.map((skill, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
            >
              <SkillIcon skill={skill} />
              <span className="ml-1.5">{skill}</span>
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 mb-4 leading-relaxed text-center">{bio}</p>
        
        <animated.div style={iconSprings} className="flex space-x-4 pt-3 border-t border-gray-100">
          {links.github && (
            <a 
              href={links.github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
              aria-label={`${name}'s GitHub`}
            >
              <Github className="w-5 h-5" />
            </a>
          )}
          {links.linkedin && (
            <a 
              href={links.linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
              aria-label={`${name}'s LinkedIn`}
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {links.email && (
            <a 
              href={`mailto:${links.email}`} 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
              aria-label={`Email ${name}`}
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
          {links.website && (
            <a 
              href={links.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
              aria-label={`${name}'s Website`}
            >
              <Globe className="w-5 h-5" />
            </a>
          )}
        </animated.div>
      </div>
    </animated.div>
  );
};

const DevelopersPage: React.FC = () => {
  const developers = [
    {
      name: 'Amandeep Singh',
      role: 'Lead Developer',
    //   bio: 'Lead developer with expertise in Vite-React, Tailwind CSS, TypeScript, Node.js, and Supabase. Focused on creating responsive and intuitive user interfaces with clean architecture and robust backend solutions.',
      image: '/images/developers/6327721544662500195.jpg',
      skills: ['Vite React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Supabase'],
      links: {
        github: 'https://github.com/DevxAman',
        linkedin: 'https://www.linkedin.com/in/amandeep-singh-991bb1254',
        // email: 'officialaman1125@gmail.com',
      }
    },
    {
      name: 'Arshpreet Kaur',
      role: 'Frontend Designer',
    //   bio: 'Creative designer who crafted the user interface for the grievance form and dashboard components. Implemented responsive layouts with Tailwind CSS and designed accessible user flows that significantly enhance the user experience across all device sizes.',
      image: '/images/developers/1234.jpg',
      skills: ['UI/UX Design', 'Tailwind CSS', 'React Components','Frontend Development', 'Accessibility'],
      links: {
        github: 'https://github.com/Arsh-codes14',
        linkedin: 'https://www.linkedin.com/in/arshpreet-kaur-057905313/',
        // email: 'arshpreet@example.com',
      }
    },
    {
        name: 'Natasha Pal',
        role: 'UI/UX Designer',
        // bio: 'Frontend specialist who designed and implemented the tracking interface and status visualization components. Created intuitive navigation elements and interactive features using React, ensuring a seamless user journey throughout the grievance management process.',
        image: '/images/developers/123.jpg',
        skills: ['React Components', 'Responsive Design', 'UI Animation', 'User Testing'],
        links: {
          github: 'https://github.com/rajinder',
          linkedin: 'https://linkedin.com/in/rajinder',
        //   email: 'rajinder@example.com'
        }
    }
  ];

  const [headerSpring, headerApi] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateY(-50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { mass: 1, tension: 280, friction: 60 },
  }));
  
  const [projectSpring, projectApi] = useSpring(() => ({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { mass: 1, tension: 280, friction: 60 },
    delay: 600,
  }));

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-16 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <animated.div style={headerSpring} className="text-center py-16 max-w-4xl mx-auto">
          <div className="inline-block mb-4 p-2 bg-blue-50 rounded-full">
            <div className="bg-blue-600 rounded-full p-2">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Meet Our Developers
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The dedicated developers behind the Grievance Redressal Portal, committed to creating an efficient and user-friendly platform for addressing concerns at GNDEC.
          </p>
        </animated.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 mt-8 mb-20">
          {developers.map((developer, index) => (
            <Developer key={index} {...developer} />
          ))}
        </div>

        {/* About Project Section */}
        <animated.div 
          style={projectSpring}
          className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl bg-white"
        >
          <div className="py-8 px-8 sm:px-12 relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-3xl opacity-70"></div>
            
            <div className="flex items-center space-x-3 mb-6">
              <Book className="w-6 h-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">About The Project</h2>
            </div>
            
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-8"></div>
            
            <div className="space-y-6 relative z-10">
              <p className="text-gray-600 leading-relaxed">
                The Grievance Redressal Portal is designed to streamline the process of submitting, tracking, and resolving complaints within GNDEC. Our goal is to create a transparent and efficient system that empowers users and administrators.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      <Code className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">Modern Technology</h3>
                  </div>
                  <p className="text-gray-600">
                    Built using React, Node.js, and Supabase, the system provides a robust platform for managing grievances from submission to resolution.
                  </p>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                      <Award className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800">User-Centered</h3>
                  </div>
                  <p className="text-gray-600">
                    Designed with a focus on usability and accessibility, ensuring that all users can easily navigate and use the platform effectively.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                The project was developed as part of our commitment to improving organizational communication and problem-solving processes at GNDEC, providing students and staff with a reliable channel to voice their concerns.
              </p>
            </div>
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default DevelopersPage; 
