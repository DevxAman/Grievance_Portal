import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Send, ChevronRight, Clock, User, BarChart, CheckCircle } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      icon: <FileText className="h-12 w-12 text-blue-600" />,
      title: 'File a Grievance',
      description: 'Fill out the grievance form with all relevant details of your issue. Make sure to include any supporting documents if necessary.',
    },
    {
      icon: <Send className="h-12 w-12 text-green-600" />,
      title: 'Submission and Acknowledgement',
      description: 'Once submitted, your grievance is assigned a unique ID. You will receive an acknowledgement email immediately.',
    },
    {
      icon: <User className="h-12 w-12 text-purple-600" />,
      title: 'Review Process',
      description: 'The grievance is reviewed by the concerned authority (Clerk, Admin, or DSW) depending on the nature of the issue.',
    },
    {
      icon: <Clock className="h-12 w-12 text-amber-600" />,
      title: 'Processing Time',
      description: 'Most grievances are processed within 7 working days. Complex issues may take longer, but you will be kept informed of progress.',
    },
    {
      icon: <BarChart className="h-12 w-12 text-indigo-600" />,
      title: 'Status Tracking',
      description: 'Track the status of your grievance in real-time through your dashboard. You can also send reminders if needed.',
    },
    {
      icon: <CheckCircle className="h-12 w-12 text-teal-600" />,
      title: 'Resolution and Feedback',
      description: 'Once resolved, you will be notified via email. You can provide feedback on the resolution and the process.',
    },
  ];

  const faqs = [
    {
      question: 'How long does it take to resolve a grievance?',
      answer: 'Most grievances are resolved within 7 working days. However, complex issues may take longer. You will be notified of any delays.',
    },
    {
      question: 'Can I file multiple grievances?',
      answer: 'Yes, you can file multiple grievances. Each grievance will be assigned a unique ID and tracked separately.',
    },
    {
      question: 'What if I am not satisfied with the resolution?',
      answer: 'If you are not satisfied with the resolution, you can appeal the decision by clicking the "Appeal" button on the resolved grievance in your dashboard.',
    },
    {
      question: 'Can I upload documents to support my grievance?',
      answer: 'Yes, you can upload up to 5 supporting documents (PDF, JPG, PNG) with a maximum size of 10MB each.',
    },
    {
      question: 'Who can see my grievance details?',
      answer: 'Your grievance details are only visible to you and the authorized personnel handling your case. We maintain strict confidentiality.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="max-w-3xl mx-auto text-lg text-gray-600">
            Our grievance redressal process is designed to be transparent, efficient, and user-friendly. 
            Follow these simple steps to get your concerns addressed.
          </p>
        </div>
        
        {/* Process Flow */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">The Grievance Process</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-full">
                  <div className="absolute -top-3 -left-3 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{step.title}</h3>
                  <p className="text-gray-600 text-center">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              to="/file-grievance"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              File a Grievance
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
        
        {/* Role-Based Flow */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Role-Based Process Flow</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Student</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Files grievance with details</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Tracks status on dashboard</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Receives notifications</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Provides feedback on resolution</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Clerk</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Receives new grievances</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Verifies documents</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Forwards to appropriate admin</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Updates initial status</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Admin</h3>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Reviews assigned grievances</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Takes necessary actions</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Updates progress regularly</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Proposes resolutions</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="text-lg font-semibold text-amber-800 mb-3">DSW</h3>
              <ul className="space-y-2 text-amber-700">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Oversees all grievances</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Intervenes in complex cases</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Approves final resolutions</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Makes policy improvements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* FAQs */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-5 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">
              If you couldn't find the answer to your question, please feel free to contact us.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;