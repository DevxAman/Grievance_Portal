import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GrievanceForm from '../components/grievance/GrievanceForm';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { canFileGrievance, getDashboardPathForRole } from '../lib/roles';
import { CheckCircle, AlertCircle, X, Clock3, ShieldCheck, FileText } from 'lucide-react';

const FileGrievancePage: React.FC = () => {
  const { submitNewGrievance, error } = useGrievance();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  
  useEffect(() => {
    if (user && !canFileGrievance(user.role)) {
      navigate(getDashboardPathForRole(user.role));
      return;
    }
    
    // Auto-hide popup after 5 seconds
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showPopup, user, navigate]);
  
  const handleSubmit = async (formData: FormData) => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const grievanceData = await submitNewGrievance(formData);
      console.log('Grievance submitted successfully:', grievanceData);
      setIsSubmitted(true);
      setShowSuccessModal(true); // Show modal first
      setShowPopup(true);
    } catch (err) {
      console.error('Failed to submit grievance:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };
  
  const handleRefreshForm = () => {
    setIsSubmitted(false);
    setShowSuccessModal(false);
    setShowPopup(false);
    setFormResetKey((key) => key + 1);
    navigate('/file-grievance');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app-shell px-4 py-24 sm:px-6 lg:px-8">
      {/* Success Modal Notification */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal}></div>
          <div className="relative z-50 mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Grievance has been filed successfully!</h2>
              <button
                onClick={handleCloseModal}
                className="btn-primary px-8"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Popup Notification */}
      {showPopup && !showSuccessModal && (
        <div className="fixed right-4 top-20 z-50 w-80 animate-fade-in-right rounded-2xl border border-green-200 bg-green-50 p-4 shadow-xl md:right-6 md:w-96">
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
      
      <div className="mx-auto max-w-6xl">
        {error && (
          <div className="mb-6 flex items-start rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Submission Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {isSubmitting && (
          <div className="mb-6 flex items-center rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
            <p className="text-blue-700 font-medium">Submitting your grievance...</p>
          </div>
        )}
        
        {isSubmitted && !showSuccessModal ? (
          <div className="surface-card mx-auto max-w-2xl p-8 text-center">
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
                className="btn-primary"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleRefreshForm}
                className="btn-secondary"
              >
                File Another Grievance
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <span className="page-kicker">Student support</span>
              <h1 className="page-title mt-4">File a New Grievance</h1>
              <p className="page-subtitle mx-auto">
                Submit a clear concern with supporting details. Your ticket is routed to the appropriate authority and remains trackable from your dashboard.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
              <GrievanceForm onSubmit={handleSubmit} key={formResetKey} />
              <aside className="space-y-4">
                {[
                  { icon: FileText, title: 'Be specific', text: 'Mention course, department, location, dates, and people involved where relevant.' },
                  { icon: ShieldCheck, title: 'Confidential handling', text: 'Only authorized staff can access your submission and uploaded documents.' },
                  { icon: Clock3, title: 'Track progress', text: 'After submission, use Track Grievance to monitor status updates and responses.' },
                ].map((item) => (
                  <div key={item.title} className="surface-card-compact p-5">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileGrievancePage;
