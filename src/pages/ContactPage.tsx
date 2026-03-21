import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Mail, Phone, MapPin, Send, User, MessageSquare } from 'lucide-react';
import BackgroundCarousel from '../components/home/BackgroundCarousel';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Spring animations
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 280, friction: 20 },
    delay: 200,
  });

  const formSpring = useSpring({
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: { tension: 280, friction: 20 },
    delay: 400,
  });

  const cardSpring = useSpring({
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
    config: { tension: 280, friction: 20 },
    delay: 400,
  });

  // Reset success message after some time
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
        // Reset form after submission
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 1500);
    }
  };

  const handleGmailRedirect = () => {
    if (validateForm()) {
      // Create Gmail compose URL with prefilled data
      const recipient = 'std.grievance@gmail.com';
      const subject = encodeURIComponent(formData.subject);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      );
      
      // Open Gmail compose window in a new tab
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`, '_blank');
    }
  };

  return (
    <div className="relative min-h-screen pt-16">
      {/* Background Carousel */}
      <BackgroundCarousel 
        externalSlide={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      {/* Content */}
      <div className="relative z-40 container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <animated.div style={fadeIn} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">
              Contact Us
            </span>
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            We're here to help and answer any questions you might have. 
            Reach out to us and we'll respond as soon as we can.
          </p>
        </animated.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <animated.div style={formSpring} className="bg-black/40 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-6">Send us a message</h2>
            
            {showSuccess && (
              <div className="bg-green-600/80 backdrop-blur-sm text-white p-4 rounded-lg mb-6 flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Thank you for your message! We'll get back to you soon.</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-200 mb-2 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-300" />
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-white/10 backdrop-blur-sm border ${errors.name ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
              </div>
              
              <div className="mb-5">
                <label htmlFor="email" className="block text-gray-200 mb-2 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-300" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/10 backdrop-blur-sm border ${errors.email ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="johnexample@gmail.com"
                />
                {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
              </div>
              
              <div className="mb-5">
                <label htmlFor="subject" className="block text-gray-200 mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-300" />
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full bg-white/10 backdrop-blur-sm border ${errors.subject ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="How can we help you?"
                />
                {errors.subject && <p className="mt-1 text-red-400 text-sm">{errors.subject}</p>}
              </div>
              
              <div className="mb-5">
                <label htmlFor="message" className="block text-gray-200 mb-2 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-300" />
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full bg-white/10 backdrop-blur-sm border ${errors.message ? 'border-red-500' : 'border-white/20'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Write your message here..."
                ></textarea>
                {errors.message && <p className="mt-1 text-red-400 text-sm">{errors.message}</p>}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-blue-700' : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'} text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 mb-4`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
              
              {/* Gmail Redirect Button */}
              <button
                type="button"
                onClick={handleGmailRedirect}
                className="w-full bg-white text-gray-800 py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-all duration-300 shadow-lg transform hover:translate-y-[-2px] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EA4335">
                  <path d="M24 5.457v13.086c0 .808-.65 1.457-1.457 1.457h-1.668V9.235l-9.876 7.202-9.876-7.202v10.765H1.457A1.455 1.455 0 0 1 0 18.543V5.457C0 4.65.65 4 1.457 4h.523L12 12.117 22.02 4h.523c.807 0 1.457.65 1.457 1.457z"/>
                </svg>
                Send via Gmail
              </button>
            </form>
          </animated.div>
          
          {/* Contact Information */}
          <animated.div style={cardSpring}>
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-xl shadow-2xl border border-white/10 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-blue-600/30 p-3 rounded-lg mr-4">
                    <Phone className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg text-white font-medium">Phone</h3>
                    <p className="text-gray-300 mt-1">+91-123-456-7890</p>
                    <p className="text-gray-400 text-sm mt-1">Mon-Fri from 9am to 5pm</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-600/30 p-3 rounded-lg mr-4">
                    <Mail className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg text-white font-medium">Email</h3>
                    <p className="text-gray-300 mt-1">std.grievance@gmail.com</p>
                    <p className="text-gray-400 text-sm mt-1">We'll respond as soon as possible</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-600/30 p-3 rounded-lg mr-4">
                    <MapPin className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg text-white font-medium">Office Address</h3>
                    <p className="text-gray-300 mt-1">GNDEC Campus,</p>
                    <p className="text-gray-300">Ludhiana, Punjab</p>
                    <p className="text-gray-400 text-sm mt-1">141006, India</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/50 backdrop-blur-xl p-6 rounded-xl shadow-2xl border border-blue-500/20">
              <h3 className="text-xl font-semibold text-white mb-3">Operating Hours</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-300">Monday - Friday:</div>
                <div className="text-white font-medium">9:00 AM - 5:00 PM</div>
                <div className="text-gray-300">Saturday:</div>
                <div className="text-white font-medium">9:00 AM - 1:00 PM</div>
                <div className="text-gray-300">Sunday:</div>
                <div className="text-white font-medium">Closed</div>
              </div>
            </div>
          </animated.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 