import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GrievanceCard from '../components/grievance/GrievanceCard';
import GrievanceDetails from '../components/grievance/GrievanceDetails';
import { useGrievance } from '../hooks/useGrievance';
import { useAuth } from '../hooks/useAuth';
import { Grievance } from '../types';
import { AlertTriangle, CheckCircle2, FileSearch, Loader2, Trash2, Clock, Filter, PieChart, Clock3, List, ChevronRight, X, Eye } from 'lucide-react';

const TrackGrievancePage: React.FC = () => {
  const { grievances, fetchGrievances, sendReminder, deleteGrievance, loading, error, reminderCooldowns } = useGrievance();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllGrievancesModal, setShowAllGrievancesModal] = useState(false);
  const [allGrievancesFilter, setAllGrievancesFilter] = useState<string>('all');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchGrievances();
  }, [isAuthenticated, navigate]);
  
  // Get cooldown info for a grievance
  const getCooldownInfo = (grievanceId: string) => {
    const now = Date.now();
    const cooldownUntil = reminderCooldowns[grievanceId] || 0;
    
    if (now < cooldownUntil) {
      const hoursRemaining = Math.ceil((cooldownUntil - now) / (1000 * 60 * 60));
      return {
        inCooldown: true,
        hoursRemaining
      };
    }
    
    return {
      inCooldown: false,
      hoursRemaining: 0
    };
  };
  
  // Get summary statistics for all grievances
  const getGrievanceSummary = () => {
    if (!grievances.length) return null;
    
    const statusCounts = {
      total: grievances.length,
      pending: 0,
      'under-review': 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0
    };
    
    let oldestPendingGrievance: Grievance | null = null;
    let newestGrievance: Grievance | null = null;
    
    grievances.forEach(grievance => {
      // Count by status
      if (statusCounts.hasOwnProperty(grievance.status)) {
        statusCounts[grievance.status as keyof typeof statusCounts]++;
      }
      
      // Find oldest pending/under-review/in-progress grievance
      if (['pending', 'under-review', 'in-progress'].includes(grievance.status)) {
        if (!oldestPendingGrievance || new Date(grievance.created_at) < new Date(oldestPendingGrievance.created_at)) {
          oldestPendingGrievance = grievance;
        }
      }
      
      // Find newest grievance
      if (!newestGrievance || new Date(grievance.created_at) > new Date(newestGrievance.created_at)) {
        newestGrievance = grievance;
      }
    });
    
    return {
      counts: statusCounts,
      oldestPendingGrievance,
      newestGrievance,
      percentResolved: Math.round((statusCounts.resolved / statusCounts.total) * 100)
    };
  };
  
  const handleSendReminder = async (grievanceId: string) => {
    // Get the cooldown info
    const { inCooldown, hoursRemaining } = getCooldownInfo(grievanceId);
    
    if (inCooldown) {
      // Show toast notification for cooldown
      toast.error(
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Reminder in cooldown. Try again in {hoursRemaining} hours.</span>
        </div>
      );
      return;
    }
    
    // Loading toast
    const loadingToast = toast.loading("Sending reminder...");
    
    try {
      await sendReminder(grievanceId);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success toast
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Reminder sent successfully to admin (std_grievance@gndec.ac.in)!</span>
        </div>
      );
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Get meaningful error message
      let errorMessage = "Failed to send reminder";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Show error toast with proper error message
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMessage}</span>
        </div>
      );
      console.error('Failed to send reminder:', err);
    }
  };

  const handleViewDetails = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleDeleteGrievance = async (grievanceId: string) => {
    // Loading toast
    const loadingToast = toast.loading("Deleting grievance...");
    
    try {
      const success = await deleteGrievance(grievanceId);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (success) {
        // Show success toast
        toast.success(
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            <span>Grievance deleted successfully!</span>
          </div>
        );
      }
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show error toast
      toast.error(
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{err instanceof Error ? err.message : 'Failed to delete grievance'}</span>
        </div>
      );
      console.error('Failed to delete grievance:', err);
    }
  };
  
  const filteredGrievances = filterStatus === 'all' 
    ? grievances 
    : grievances.filter(g => g.status === filterStatus);

  const allFilteredGrievances = allGrievancesFilter === 'all'
    ? grievances
    : grievances.filter(g => g.status === allGrievancesFilter);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const openAllGrievancesModal = () => {
    setShowAllGrievancesModal(true);
  };

  const closeAllGrievancesModal = () => {
    setShowAllGrievancesModal(false);
  };

  // Format date for table display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status color class for badge styling
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category display name
  const getCategoryDisplay = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      'academic': 'Academic Issues',
      'infrastructure': 'Infrastructure',
      'administrative': 'Administrative',
      'financial': 'Financial Matters',
      'other': 'Other'
    };
    
    return categoryMap[category] || category;
  };
  
  // Get summary data
  const summary = getGrievanceSummary();
  
  // Safely extract oldest pending grievance if available
  const oldestPending = summary?.oldestPendingGrievance as Grievance | undefined;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mt-10">Track Your Grievances</h1>
        
        {error && (
          <div className="mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}
        
        {/* Grievance Summary Section */}
        {!loading && summary && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Grievance Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Grievances</p>
                <p className="text-2xl font-bold text-blue-700">{summary.counts.total}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-700">{summary.counts.resolved}</p>
                <p className="text-xs text-gray-500">{summary.percentResolved}% of total</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pending/In Progress</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {summary.counts.pending + summary.counts['under-review'] + summary.counts['in-progress']}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{summary.counts.rejected}</p>
              </div>
            </div>
            
            {oldestPending && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start">
                <Clock3 className="h-5 w-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Oldest Pending Grievance:</p>
                  <p className="text-sm text-gray-600">
                    "{oldestPending.title}" 
                    <span className="ml-1 italic">
                      ({new Date(oldestPending.created_at).toLocaleDateString()})
                    </span>
                    <button 
                      onClick={() => handleViewDetails(oldestPending)}
                      className="ml-2 text-blue-600 underline text-xs hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Filter by Status</h2>
              <button 
                onClick={toggleMobileFilters}
                className="inline-flex items-center sm:hidden px-3 py-1.5 bg-gray-100 rounded-md text-gray-700 text-sm"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </button>
            </div>
            
            <div className={`grid grid-cols-2 gap-2 ${showMobileFilters ? 'block' : 'hidden'} sm:flex sm:flex-wrap sm:gap-2 sm:block`}>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('under-review')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'under-review'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'in-progress'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'resolved'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-base sm:text-lg text-gray-600">Loading your grievances...</p>
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <FileSearch className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Grievances Found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't submitted any grievances yet." 
                : `You don't have any ${filterStatus.replace('-', ' ')} grievances.`}
            </p>
            <button
              onClick={() => navigate('/file-grievance')}
              className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
            >
              File a New Grievance
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredGrievances.map((grievance) => (
              <GrievanceCard 
                key={grievance.id} 
                grievance={grievance} 
                onSendReminder={handleSendReminder}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteGrievance}
                cooldownInfo={getCooldownInfo(grievance.id)}
                showDescription={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button (fixed at bottom right) */}
      {grievances.length > 0 && (
        <button
          onClick={openAllGrievancesModal}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full shadow-lg flex items-center transition-colors"
        >
          <List className="w-5 h-5 mr-2" />
          View All Grievances
        </button>
      )}

      {/* All Grievances Modal */}
      {showAllGrievancesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <List className="w-5 h-5 mr-2 text-blue-600" />
                All Grievances
              </h2>
              <button 
                onClick={closeAllGrievancesModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAllGrievancesFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setAllGrievancesFilter('pending')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setAllGrievancesFilter('under-review')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'under-review'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Under Review
                </button>
                <button
                  onClick={() => setAllGrievancesFilter('in-progress')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'in-progress'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setAllGrievancesFilter('resolved')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'resolved'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setAllGrievancesFilter('rejected')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    allGrievancesFilter === 'rejected'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rejected
                </button>
              </div>
            </div>
            
            <div className="flex-grow overflow-auto p-4">
              {allFilteredGrievances.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileSearch className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">No grievances found with the selected filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Title</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Category</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allFilteredGrievances.map((grievance) => (
                        <tr key={grievance.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-500">{grievance.id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                              {grievance.title}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{getCategoryDisplay(grievance.category)}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColorClass(grievance.status)}`}>
                              {grievance.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{formatDate(grievance.created_at)}</td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => {
                                  handleViewDetails(grievance);
                                  closeAllGrievancesModal();
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {grievance.status !== 'resolved' && grievance.status !== 'rejected' && (
                                <button 
                                  onClick={() => {
                                    closeAllGrievancesModal();
                                    handleSendReminder(grievance.id);
                                  }}
                                  className={`text-blue-600 hover:text-blue-800 ${
                                    getCooldownInfo(grievance.id).inCooldown ? 'opacity-50 cursor-not-allowed' : ''
                                  }`}
                                  disabled={getCooldownInfo(grievance.id).inCooldown}
                                  title={getCooldownInfo(grievance.id).inCooldown 
                                    ? `In cooldown (${getCooldownInfo(grievance.id).hoursRemaining}h)`
                                    : "Send Reminder"
                                  }
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  closeAllGrievancesModal();
                                  handleDeleteGrievance(grievance.id);
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <GrievanceDetails 
        grievance={selectedGrievance}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default TrackGrievancePage;