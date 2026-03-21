import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GrievanceForm from '../components/grievance/GrievanceForm';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const FileGrievancePage: React.FC = () => {
  const { submitNewGrievance, error, loading } = useGrievance();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  useEffect(() => {
    // Auto-hide popup after 5 seconds
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);
  
  const handleSubmit = async (formData: FormData) => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    try {
      const grievanceData = await submitNewGrievance(formData);
      console.log('Grievance submitted successfully:', grievanceData);
      setIsSubmitted(true);
      setShowSuccessModal(true); // Show modal first
      setShowPopup(true);
    } catch (err) {
      console.error('Failed to submit grievance:', err);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };
  
  const handleRefreshForm = () => {
    setIsSubmitted(false);
    setShowSuccessModal(false);
    navigate('/file-grievance');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Success Modal Notification */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto z-50">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Grievance has been filed successfully!</h2>
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Popup Notification */}
      {showPopup && !showSuccessModal && (
        <div className="fixed top-20 right-4 md:right-6 bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-lg w-80 md:w-96 z-50 animate-fade-in-right">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-green-800">
                Grievance Filed Successfully!
              </p>
              <p className="mt-1 text-sm text-green-700">
                Your grievance has been submitted and will be reviewed shortly.
              </p>
            </div>
            <button 
              onClick={() => setShowPopup(false)}
              className="ml-4 flex-shrink-0 text-green-500 hover:text-green-700 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Submission Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {loading && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-md flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            <p className="text-blue-700 font-medium">Submitting your grievance...</p>
          </div>
        )}
        
        {isSubmitted && !showSuccessModal ? (
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Grievance Submitted Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your grievance has been successfully submitted and will be reviewed by our team. You can track its status from your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleRefreshForm}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
              >
                File Another Grievance
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-900 mt-10">File a New Grievance</h1>
            <p className="mb-8 text-gray-600 text-center max-w-2xl mx-auto">
              Please provide detailed information about your grievance. The more specific you are, the better we can assist you in resolving the issue.
            </p>
            
            {/* About to File a New Grievance Button */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={handleRefreshForm}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                About to File a New Grievance
              </button>
            </div>
            
            <GrievanceForm onSubmit={handleSubmit} key={Date.now()} />
          </>
        )}
      </div>
    </div>
  );
};

export default FileGrievancePage;