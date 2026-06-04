import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { Grievance } from '../../types';
import { formatDate } from '../../lib/dateUtils';
import { useNavigate } from 'react-router-dom';

interface CooldownInfo {
  inCooldown: boolean;
  hoursRemaining: number;
}

type StatusType = 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';
type CategoryType = 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other';

interface GrievanceCardProps {
  grievance: Grievance;
  onSendReminder?: (id: string) => void;
  onViewDetails?: (grievance: Grievance) => void;
  onDelete?: (id: string) => void;
  cooldownInfo?: CooldownInfo;
  showDescription?: boolean;
  showTrackButton?: boolean;
  showForwardButton?: boolean;
  onForward?: (
  grievanceId: string
) => void;
}

const GrievanceCard: React.FC<GrievanceCardProps> = ({ 
  grievance, 
  onSendReminder,
  onViewDetails,
  onDelete,
  cooldownInfo = { inCooldown: false, hoursRemaining: 0 },
  showDescription = false,
  showTrackButton = false,
  showForwardButton=false,
  onForward
}) => {
  const navigate = useNavigate();
  
  const statusIcons = {
    'pending': <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />,
    'under-review': <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />,
    'in-progress': <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />,
    'resolved': <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
    'rejected': <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
  };
  
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'under-review': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    'resolved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  
  const categoryLabels = {
    'academic': 'Academic Issues',
    'infrastructure': 'Infrastructure',
    'administrative': 'Administrative',
    'financial': 'Financial Matters',
    'other': 'Other',
  };
  
  const handleReminderClick = () => {
    if (onSendReminder) {
      onSendReminder(grievance.id);
    }
  };

  const handleViewDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails(grievance);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.')) {
      onDelete(grievance.id);
    }
  };
  
  const handleTrackGrievance = () => {
    navigate('/track-grievance');
  };
  
  // Safely get the status color and icon
  const getStatusColor = (status: string) => {
    return statusColors[status as StatusType] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusIcon = (status: string) => {
    return statusIcons[status as StatusType] || <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
  };
  
  // Safely get category label
  const getCategoryLabel = (category: string) => {
    return categoryLabels[category as CategoryType] || category;
  };
  
  return (
    <div className="surface-card-compact overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <div className="mb-3 inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1">
  <span className="text-[10px] font-semibold text-blue-600 mr-1">
    ID
  </span>
  <span className="text-xs font-mono text-blue-800">
    {grievance.id.slice(0, 8).toUpperCase()}
  </span>
</div>
            <h3 className="line-clamp-1 text-base font-bold text-slate-950 sm:text-lg">{grievance.title}</h3>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Submitted on {formatDate(grievance.created_at)}
            </p>
          </div>
          <span className={`status-chip ${getStatusColor(grievance.status)} border-transparent`}>
            {getStatusIcon(grievance.status)}
            <span className="ml-1 sm:ml-1.5 capitalize">{grievance.status.replace('-', ' ')}</span>
          </span>
        </div>
       <div className="mt-4">
  <div className="flex items-center">

    {/* Submitted */}
    <div
      className={`w-3 h-3 rounded-full ${
        grievance.status === 'pending'
          ? 'bg-yellow-500'
          : grievance.status === 'under-review'
          ? 'bg-blue-500'
          : grievance.status === 'in-progress'
          ? 'bg-orange-500'
          : grievance.status === 'resolved'
          ? 'bg-green-500'
          : 'bg-red-500'
      }`}
    />

    {/* Line 1 */}
    <div
      className={`flex-1 h-1 ${
        ['under-review', 'in-progress', 'resolved'].includes(
          grievance.status
        )
          ? grievance.status === 'under-review'
            ? 'bg-blue-500'
            : grievance.status === 'in-progress'
            ? 'bg-orange-500'
            : 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />

    {/* Under Review */}
    <div
      className={`w-3 h-3 rounded-full ${
        ['under-review', 'in-progress', 'resolved'].includes(
          grievance.status
        )
          ? grievance.status === 'under-review'
            ? 'bg-blue-500'
            : grievance.status === 'in-progress'
            ? 'bg-orange-500'
            : 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />

    {/* Line 2 */}
    <div
      className={`flex-1 h-1 ${
        ['in-progress', 'resolved'].includes(
          grievance.status
        )
          ? grievance.status === 'in-progress'
            ? 'bg-orange-500'
            : 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />

    {/* In Progress */}
    <div
      className={`w-3 h-3 rounded-full ${
        ['in-progress', 'resolved'].includes(
          grievance.status
        )
          ? grievance.status === 'in-progress'
            ? 'bg-orange-500'
            : 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />

    {/* Line 3 */}
    <div
      className={`flex-1 h-1 ${
        grievance.status === 'resolved'
          ? 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />

    {/* Resolved */}
    <div
      className={`w-3 h-3 rounded-full ${
        grievance.status === 'resolved'
          ? 'bg-green-500'
          : 'bg-gray-300'
      }`}
    />
  </div>

  <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-500">
    <span>Submitted</span>
    <span>Review</span>
    <span>Progress</span>
    <span>Resolved</span>
  </div>

  {grievance.status === 'rejected' && (
    <div className="mt-3 text-center bg-red-100 text-red-700 py-2 rounded-md text-xs font-medium">
      Grievance Rejected
    </div>
  )}
</div>
        <div className="mt-3">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {getCategoryLabel(grievance.category)}
            
          </span>
        </div>
        
        {showDescription && (
          <div className="mt-3 sm:mt-4">
            <p className="line-clamp-2 text-xs leading-5 text-slate-600 sm:line-clamp-3 sm:text-sm">{grievance.description}</p>
          </div>
        )}
        
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex flex-wrap gap-2">
            {showTrackButton && (
              <button
                onClick={handleTrackGrievance}
                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                Track Grievance
              </button>
            )}
            
            {onSendReminder && grievance.status !== 'resolved' && grievance.status !== 'rejected' && (
              <button
                onClick={handleReminderClick}
                disabled={cooldownInfo.inCooldown}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  cooldownInfo.inCooldown
                    ? 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 focus:ring-blue-500'
                }`}
                title={cooldownInfo.inCooldown ? `In cooldown. Try again in ${cooldownInfo.hoursRemaining} hours.` : 'Send reminder'}
              >
                {cooldownInfo.inCooldown ? (
                  <>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {cooldownInfo.hoursRemaining}h
                  </>
                ) : (
                  'Send Reminder'
                )}
              </button>
            )}
            
            {onViewDetails && (
              <button
                onClick={handleViewDetailsClick}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                View Details
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </button>
            )}
            {showForwardButton && (
<button

  onClick={() =>
    onForward?.(grievance.id)
  }

  className="
    mt-2
    w-full
    bg-blue-600
    hover:bg-blue-700
    text-white
    py-2
    rounded-md
    text-sm
    font-medium
    transition-colors
  "
>

  Forward To Department

</button>)}
          </div>
          
          {grievance.updated_at !== grievance.created_at && (
            <div className="text-xs text-gray-500 mt-2 sm:mt-0">
              Updated: {formatDate(grievance.updated_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceCard;
