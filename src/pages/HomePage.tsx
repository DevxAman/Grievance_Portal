import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AnimatedStats from '../components/stats/AnimatedStats';
import { Info, FileText, BookOpenCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const grievanceTypes = [
    {
      icon: <Info className="h-8 w-8 text-blue-600" />,
      title: 'Academic Issues',
      description: 'Problems related to courses, examinations, grading, faculty, or academic policies.',
    },
    {
      icon: <FileText className="h-8 w-8 text-green-600" />,
      title: 'Infrastructure',
      description: 'Issues with classrooms, laboratories, library, hostels, or other campus facilities.',
    },
    {
      icon: <BookOpenCheck className="h-8 w-8 text-purple-600" />,
      title: 'Administrative',
      description: 'Concerns regarding admission, registration, ID cards, certificates, or administrative procedures.',
    },
    {
      icon: <Clock className="h-8 w-8 text-amber-600" />,
      title: 'Financial Matters',
      description: 'Problems with fees, scholarships, reimbursements, or other financial concerns.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D animation */}
      <HeroSection />
      
      {/* Types of Grievances Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Grievances We Handle</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our portal is designed to address a wide range of issues that students and staff might face during their time at GNDEC.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {grievanceTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Animated Statistics Section */}
      <AnimatedStats />
      
      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mt-16">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto p-4 mt-4">
              Our grievance redressal process is designed to be simple, transparent, and effective.
            </p>
          </div>
          
          <div className="relative">
            {/* Progress Line - visible on md and larger screens */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 transform -translate-x-1/2"></div>
            
            <div className="space-y-12 md:space-y-16 relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-5/12 mb-4 md:mb-0 md:text-right order-2 md:order-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Grievance</h3>
                  <p className="text-gray-600">
                    Fill out the grievance form with details about your issue and upload any relevant documents.
                  </p>
                </div>
                
                <div className="w-full md:w-2/12 flex justify-center items-center order-1 md:order-2 mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-200 bg-blue-600 text-white flex items-center justify-center font-bold text-xl z-10">
                    1
                  </div>
                </div>
                
                <div className="md:w-5/12 hidden md:block order-3">
                  {/* Placeholder for right side on first step */}
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-5/12 hidden md:block order-1">
                  {/* Placeholder for left side on second step */}
                </div>
                
                <div className="w-full md:w-2/12 flex justify-center items-center order-1 md:order-2 mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-200 bg-blue-600 text-white flex items-center justify-center font-bold text-xl z-10">
                    2
                  </div>
                </div>
                
                <div className="md:w-5/12 mb-4 md:mb-0 order-2 md:order-3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Grievance Processing</h3>
                  <p className="text-gray-600">
                    Your grievance is reviewed by the appropriate authority and assigned to the relevant department.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-5/12 mb-4 md:mb-0 md:text-right order-2 md:order-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-gray-600">
                    Monitor the status of your grievance in real-time through your dashboard and receive email updates.
                  </p>
                </div>
                
                <div className="w-full md:w-2/12 flex justify-center items-center order-1 md:order-2 mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-200 bg-blue-600 text-white flex items-center justify-center font-bold text-xl z-10">
                    3
                  </div>
                </div>
                
                <div className="md:w-5/12 hidden md:block order-3">
                  {/* Placeholder for right side on third step */}
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-5/12 hidden md:block order-1">
                  {/* Placeholder for left side on fourth step */}
                </div>
                
                <div className="w-full md:w-2/12 flex justify-center items-center order-1 md:order-2 mb-4 md:mb-0">
                  <div className="h-12 w-12 rounded-full border-4 border-blue-200 bg-blue-600 text-white flex items-center justify-center font-bold text-xl z-10">
                    4
                  </div>
                </div>
                
                <div className="md:w-5/12 order-2 md:order-3">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Resolution</h3>
                  <p className="text-gray-600">
                    Receive the resolution for your grievance and provide feedback on the process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Submit Your Grievance?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of students and staff who have successfully resolved their issues through our portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/file-grievance" 
              className="px-8 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              File a Grievance
            </Link>
            <Link 
              to="/how-it-works" 
              className="px-8 py-3 rounded-md text-base font-medium text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;