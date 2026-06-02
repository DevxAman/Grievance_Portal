import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGrievance } from '../hooks/useGrievance';
import GrievanceCard from '../components/grievance/GrievanceCard';
import { processUnprocessedEmails } from '../lib/api';
import {
  updateGrievanceCategory
} from '../lib/api';
import {
  forwardGrievance
} from '../lib/api';
import { canFileGrievance, isStaffRole } from '../lib/roles';
import { 
  PlusCircle, FilePlus, BarChart3, HelpCircle, LogOut, Loader2, User, 
  Mail, Calendar, Shield, BookOpen, Building, GraduationCap, Home, Building2
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { grievances, fetchGrievances, loading } = useGrievance();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug log
    console.log('Auth state in DashboardPage:', { user, isAuthenticated, loading });
    
    if (loading) return; // Don't check anything while loading
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (user?.role === 'clerk') {
      navigate('/clerk/dashboard');
      return;
    }
    
    // User is authenticated, fetch grievances
    fetchGrievances();
    if (user?.role === 'clerk' || user?.role==='dsw') {

  processUnprocessedEmails(user.id)
    .then(() => {

      fetchGrievances();

    })
    .catch(console.error);
}
  }, [isAuthenticated, loading, navigate, fetchGrievances,user]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const pendingGrievances = grievances.filter(g => g.status !== 'resolved' && g.status !== 'rejected');
  const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
  
  // Calculate statistics
  const totalGrievances = grievances.length;
  const pendingCount = pendingGrievances.length;
  const resolvedCount = resolvedGrievances.length;
  const rejectedCount = grievances.filter(g => g.status === 'rejected').length;

  // Format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Get student data from the database or fallback to mock data if not available
  const getStudentData = () => {
    if (!user || user.role !== 'student') return null;
    
    // If CRN and year are not available in the database, use fallback values 
    const numericPart = user.user_id.match(/\d+/);
    const num = numericPart ? parseInt(numericPart[0]) : 0;
    
    return {
      // Use database values if available, otherwise use fallback
      crn: user.crn || 221000 + num,
      branch: user.branch || ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE'][num % 6],
      year: user.year || (num % 4) + 1,
      isHosteler: user.day_scholar === undefined ? Boolean(num % 2) : !user.day_scholar
    };
  };
  
  // Get student data if user is a student
  const studentData = getStudentData();
  
  // Debug log to check what's coming from the database
  console.log("User data from database:", {
    crn: user?.crn,
    year: user?.year,
    branch: user?.branch,
    day_scholar: user?.day_scholar
  });
  const handleCategoryChange =
  async (
    grievanceId: string,
    category: string
  ) => {

  try {

    if (!user) return;

    await updateGrievanceCategory(
      grievanceId,
      category,
      user.id
    );

     await fetchGrievances();
  } catch (error) {

    console.error(error);
  }
};
const handleForward = async (
  grievanceId: string,
  category: string
) => {
  try {
    if (!user) return;

    await forwardGrievance(
      grievanceId,
      user.id,
      category,
      'Forwarded by DSW'
    );

    await fetchGrievances();

  } catch (error) {
    console.error(
      'Forward failed:',
      error
    );
  }
};
  const dashboardSubtitle =
    user?.role === 'dsw'
      ? 'Oversee grievance workflow, categorization, and institutional redressal activity.'
      : user?.role === 'student'
        ? 'View your profile, track grievances, and manage your submissions in one place.'
        : 'Your personal workspace on the GNDEC Grievance Redressal Portal.';

  return (
    <div className="app-shell min-h-screen">
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 pt-16 md:pt-20">
        <div className="section-container py-8 sm:py-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-200">
                <Building2 className="h-3.5 w-3.5" />
                GNDEC Grievance Portal
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                {dashboardSubtitle}
              </p>
            </div>
            {user && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  {(user.name || user.user_id).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name || user.user_id}</p>
                  <p className="flex items-center gap-1 text-xs capitalize text-blue-200">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container py-10 sm:py-12">
        {/* User Profile Section */}
        {user && (
          <div className="surface-card mb-10 overflow-hidden">
            <div className="md:flex">
              <div className="flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 md:shrink-0 md:p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-black text-blue-700 shadow-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.user_id.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="p-6 md:p-8 w-full">
                <div className="mb-1 text-sm font-bold uppercase tracking-widest text-blue-600">
                  User Profile
                </div>
                <h2 className="mb-5 text-2xl font-extrabold text-slate-950">{user.name || 'N/A'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium">{user.user_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'dsw' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'clerk' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">{formatDate(user.created_at)}</p>
                    </div>
                  </div>

                  {/* Student-specific information */}
                  {studentData && (
                    <>
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">College Roll No (CRN)</p>
                          <p className="font-medium">{studentData.crn}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Branch</p>
                          <p className="font-medium">{studentData.branch}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <GraduationCap className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{studentData.year}{studentData.year === 1 ? 'st' : studentData.year === 2 ? 'nd' : studentData.year === 3 ? 'rd' : 'th'} Year</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Home className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Residence Status</p>
                          <p className="font-medium">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              studentData.isHosteler ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {studentData.isHosteler ? 'Hosteler' : 'Day Scholar'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className={`grid grid-cols-1 ${isStaffRole(user?.role) ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-8`}>
          {canFileGrievance(user?.role) && (
          <button
              onClick={() => navigate('/file-grievance')}
              className="surface-card-compact flex items-center justify-center p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <FilePlus className="h-6 w-6 text-blue-600 mr-2" />
              <span className="font-medium">File New Grievance</span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/track-grievance')}
            className="surface-card-compact flex items-center justify-center p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <BarChart3 className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium">Track Grievances</span>
          </button>
          
          <button
            onClick={() => navigate('/how-it-works')}
            className="surface-card-compact flex items-center justify-center p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <HelpCircle className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium">How It Works</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="surface-card-compact flex items-center justify-center p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <LogOut className="h-6 w-6 text-red-600 mr-2" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="metric-card border-blue-100 bg-blue-50">
            <div className="text-3xl font-bold text-blue-700 mb-1">{totalGrievances}</div>
            <div className="text-sm text-blue-600">Total Grievances</div>
          </div>
          
          <div className="metric-card border-amber-100 bg-amber-50">
            <div className="text-3xl font-bold text-yellow-700 mb-1">{pendingCount}</div>
            <div className="text-sm text-yellow-600">Pending Grievances</div>
          </div>
          
          <div className="metric-card border-green-100 bg-green-50">
            <div className="text-3xl font-bold text-green-700 mb-1">{resolvedCount}</div>
            <div className="text-sm text-green-600">Resolved Grievances</div>
          </div>
          
          <div className="metric-card border-red-100 bg-red-50">
            <div className="text-3xl font-bold text-red-700 mb-1">{rejectedCount}</div>
            <div className="text-sm text-red-600">Rejected Grievances</div>
          </div>
        </div>
        
        {/* Recent Grievances */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-950">Recent Grievances</h2>
            <button
              onClick={() => navigate('/track-grievance')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
          
          {loading ? (
            <div className="surface-card flex flex-col items-center justify-center p-12">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading your grievances...</p>
            </div>
          ) : grievances.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
                <PlusCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Grievances Found</h3>
              <p className="text-gray-600 mb-6">
                {user?.role === 'admin' 
                  ? "No grievances found in the system." 
                  : "You haven't submitted any grievances yet."}
              </p>
              {canFileGrievance(user?.role) && (
                <button
                  onClick={() => navigate('/file-grievance')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  File Your First Grievance
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

  {grievances.slice(0, 6).map((grievance) => (

    <div key={grievance.id}>

      <GrievanceCard 
        grievance={grievance}
        showTrackButton={true}
        showForwardButton={
          user?.role === 'dsw'
        }
        onForward={(id) =>
  handleForward(
    id,
    grievance.category || 'other'
  )
}
      />

      {user?.role === 'dsw' && (

        <select
          defaultValue={grievance.category || 'other'}

          onChange={(e) =>
            handleCategoryChange(
              grievance.id,
              e.target.value
            )
          }

          className="mt-2 w-full border rounded-md p-2 text-sm bg-white"
        >

          <option value="other">
            Other
          </option>

          <option value="hostel">
            Hostel
          </option>

          <option value="academic">
            Academic
          </option>

          <option value="transport">
            Transport
          </option>

          <option value="financial">
            Financial
          </option>

          <option value="infrastructure">
            Infrastructure
          </option>

        </select>

      )}

    </div>
  ))}

</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
