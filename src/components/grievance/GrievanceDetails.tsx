import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Grievance } from '../../types';
import { formatDate } from '../../lib/dateUtils';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Calendar, 
  FileText, 
  Tag, 
  MessageSquare,
  RefreshCw,
  X
} from 'lucide-react';

interface GrievanceDetailsProps {
  grievance: Grievance | null;
  isOpen: boolean;
  onClose: () => void;
}

const GrievanceDetails: React.FC<GrievanceDetailsProps> = ({ grievance, isOpen, onClose }) => {
  if (!grievance) return null;
  
  const statusIcons = {
    'pending': <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />,
    'under-review': <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
    'in-progress': <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />,
    'resolved': <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
    'rejected': <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
  };
  
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'under-review': 'bg-blue-100 text-blue-800 border-blue-200',
    'in-progress': 'bg-orange-100 text-orange-800 border-orange-200',
    'resolved': 'bg-green-100 text-green-800 border-green-200',
    'rejected': 'bg-red-100 text-red-800 border-red-200',
  };
  
  const categoryLabels = {
    'academic': 'Academic Issues',
    'infrastructure': 'Infrastructure',
    'administrative': 'Administrative',
    'financial': 'Financial Matters',
    'other': 'Other',
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md sm:max-w-lg md:max-w-2xl transform overflow-hidden rounded-xl bg-white p-5 sm:p-6 text-left shadow-xl transition-all">
                <div className="flex justify-between items-start mb-3">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Grievance Details
                  </Dialog.Title>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">{grievance.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[grievance.status]}`}>
                      {statusIcons[grievance.status]}
                      <span className="ml-1.5 capitalize">{grievance.status.replace('-', ' ')}</span>
                    </span>
                    
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                      <Tag className="h-3.5 w-3.5 mr-1" />
                      {categoryLabels[grievance.category] || grievance.category}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>Submitted: {formatDate(grievance.created_at)}</span>
                  </div>
                  
                  {grievance.updated_at !== grievance.created_at && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <RefreshCw className="h-4 w-4 mr-1.5" />
                      <span>Last Updated: {formatDate(grievance.updated_at)}</span>
                    </div>
                  )}
                  
                  {grievance.assigned_to && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span className="font-medium">Assigned To:</span>
                      <span className="ml-1">{grievance.assigned_to}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1.5" />
                    Description
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-800 whitespace-pre-line">{grievance.description}</p>
                  </div>
                </div>
                
                {grievance.documents && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Documents</h4>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-800">
                      <a 
                        href={grievance.documents} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm hover:text-blue-600"
                      >
                        <FileText className="h-4 w-4 mr-1.5" />
                        View attached document
                      </a>
                    </div>
                  </div>
                )}
                
                {grievance.responses && grievance.responses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Responses ({grievance.responses.length})
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {grievance.responses.map((response) => (
                        <div 
                          key={response.id} 
                          className="bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex justify-between text-xs sm:text-sm text-gray-500 mb-1.5">
                            <span>From: Admin</span>
                            <span>{formatDate(response.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-800">{response.responseText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {grievance.feedback && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Feedback</h4>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-sm text-gray-800">{grievance.feedback}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GrievanceDetails; 