import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGrievance } from '../hooks/useGrievance';
import { 
  Mail, 
  Inbox, 
  Users, 
  BarChart, 
  Settings, 
  FileText, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Loader2, 
  RefreshCcw,
  Filter,
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Download,
  BookOpen,
  Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';
import GrievanceEmailsView from '../components/grievance/GrievanceEmailsView';

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { grievances, fetchUserGrievances, changeStatus, loading: grievancesLoading } = useGrievance();
  const navigate = useNavigate();
  
  // Tab & Customization state
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>(() => {
    return localStorage.getItem('gndec_admin_active_tab') || 'dashboard';
  });
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('gndec_sidebar_collapsed') === 'true';
  });

  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authorized Admin access check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/dashboard');
      toast.error('You do not have permission to access this page');
      return;
    }

    // Fetch live grievances for stats
    fetchUserGrievances();
  }, [isAuthenticated, user, navigate]);

  // Persist sidebar active tab
  useEffect(() => {
    localStorage.setItem('gndec_admin_active_tab', activeSidebarTab);
  }, [activeSidebarTab]);

  // Persist sidebar collapsed status
  const toggleSidebar = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem('gndec_sidebar_collapsed', String(nextState));
  };

  // Compute live statistics from existing grievances context
  const stats = useMemo(() => {
    const counts = {
      total: grievances.length,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0,
      academic: 0,
      infrastructure: 0,
      administrative: 0,
      financial: 0,
      other: 0
    };

    grievances.forEach((g) => {
      // Status counts
      if (g.status === 'pending') counts.pending += 1;
      if (['under-review', 'in-progress'].includes(g.status)) counts.inProgress += 1;
      if (g.status === 'resolved') counts.resolved += 1;
      if (g.status === 'rejected') counts.rejected += 1;

      // Category counts
      const cat = g.category?.toLowerCase() || '';
      if (cat.includes('academic')) counts.academic += 1;
      else if (cat.includes('infrastructure')) counts.infrastructure += 1;
      else if (cat.includes('administrative')) counts.administrative += 1;
      else if (cat.includes('financial')) counts.financial += 1;
      else counts.other += 1;
    });

    return counts;
  }, [grievances]);

  // Filter recent grievances list on Dashboard
  const filteredGrievances = useMemo(() => {
    return grievances.filter(g => {
      if (!g) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = g.title?.toLowerCase() || '';
        const desc = g.description?.toLowerCase() || '';
        const id = g.id?.toLowerCase() || '';
        if (!title.includes(query) && !desc.includes(query) && !id.includes(query)) {
          return false;
        }
      }
      return true;
    }).slice(0, 5); // top 5 recent ones
  }, [grievances, searchQuery]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans pt-16 md:pt-20">
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 text-slate-350 transition-all duration-300 flex flex-col z-20 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand / Logo (Header section) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          {!sidebarCollapsed && (
            <div className="flex flex-col text-left">
              <span className="text-white font-extrabold text-sm tracking-wide">ERP CONTROL</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Grievance Admin</span>
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white mx-auto transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="mt-4 flex-grow px-2 space-y-1">
          <button 
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`flex items-center py-2.5 px-3 w-full text-left rounded-xl transition-all duration-200 ${
              activeSidebarTab === 'dashboard' 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
            title="Dashboard"
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Dashboard Overview</span>}
          </button>

          <button 
            onClick={() => setActiveSidebarTab('emails')}
            className={`flex items-center py-2.5 px-3 w-full text-left rounded-xl transition-all duration-200 ${
              activeSidebarTab === 'emails' 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
            title="Grievance Emails"
          >
            <Mail className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Grievance Emails</span>}
          </button>

          <button 
            onClick={() => setActiveSidebarTab('users')}
            className={`flex items-center py-2.5 px-3 w-full text-left rounded-xl transition-all duration-200 ${
              activeSidebarTab === 'users' 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
            title="Users"
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">User Management</span>}
          </button>

          <button 
            onClick={() => setActiveSidebarTab('reports')}
            className={`flex items-center py-2.5 px-3 w-full text-left rounded-xl transition-all duration-200 ${
              activeSidebarTab === 'reports' 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
            title="Reports"
          >
            <FileText className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">Reports & Analytics</span>}
          </button>
          
          <button 
            onClick={() => setActiveSidebarTab('settings')}
            className={`flex items-center py-2.5 px-3 w-full text-left rounded-xl transition-all duration-200 ${
              activeSidebarTab === 'settings' 
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
            title="Settings"
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3 text-sm">System Settings</span>}
          </button>
        </nav>

        {/* Footer User Info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-left">
            <p className="text-xs font-bold text-slate-200 truncate">{user.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
        )}
      </aside>

      {/* 2. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        
        {/* Dynamic content rendering based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: ERP DASHBOARD OVERVIEW */}
          {activeSidebarTab === 'dashboard' && (
            <div className="animate-fadeIn text-left">
              {/* Header welcome band */}
              <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
                <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:px-8">
                  <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-200">
                      <BookOpen className="h-3.5 w-3.5" />
                      GNDEC - Grievance Admin
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      Admin Portal Redressal Dashboard
                    </h1>
                    <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                      Guru Nanak Dev Engineering College. Review institutional grievance telemetry,
                      monitor pending files, and coordinate resolution pathways.
                    </p>
                  </div>
                  <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                    <Calendar className="h-4 w-4 text-blue-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mx-auto max-w-7xl space-y-10 px-6 py-10 sm:py-14 lg:px-8">
              {/* ERP Statistics Summary Grid */}
              <div>
                <div className="mb-6">
                  <span className="page-kicker">Institutional Telemetry</span>
                  <h2 className="page-title mt-4 text-2xl sm:text-3xl">Dashboard Overview</h2>
                  <p className="page-subtitle mt-2">
                    Live grievance counts and category distribution from the current portal records.
                  </p>
                </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Stat 1: Total */}
                <div className="metric-card flex items-center gap-4 border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Grievances</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.total}</p>
                  </div>
                </div>

                {/* Stat 2: Pending */}
                <div className="metric-card flex items-center gap-4 border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.pending}</p>
                  </div>
                </div>

                {/* Stat 3: In Progress */}
                <div className="metric-card flex items-center gap-4 border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.inProgress}</p>
                  </div>
                </div>

                {/* Stat 4: Resolved */}
                <div className="metric-card flex items-center gap-4 border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-1">{stats.resolved}</p>
                  </div>
                </div>
              </div>
              </div>

              {/* Main content grid (Recent Grievances + Category Telemetry) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Grievances registry summary */}
                <div className="surface-card lg:col-span-2 overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850">Recent System Grievances</h3>
                      <p className="text-xs text-slate-450 mt-0.5">Telemetry log of the 5 most recently filed student tickets.</p>
                    </div>
                    <button 
                      onClick={() => setActiveSidebarTab('emails')} 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      View All
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-grow overflow-x-auto">
                    {grievancesLoading && grievances.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-10">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                        <p className="text-xs text-slate-500 font-semibold">Updating telemetry registry...</p>
                      </div>
                    ) : grievances.length === 0 ? (
                      <div className="p-10 text-center">
                        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-semibold">No student grievances submitted yet.</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Grievance ID</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Title</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Category</th>
                            <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-450 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {filteredGrievances.map((g) => (
                            <tr key={g.id} className="hover:bg-slate-55/40 transition-colors">
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <code className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/40">
                                  {g.id.substring(0, 8).toUpperCase()}
                                </code>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={g.title}>
                                  {g.title}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">
                                  {g.description}
                                </div>
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500 capitalize">
                                {g.category.replace('-', ' ')}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  g.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                    : g.status === 'resolved'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                    : 'bg-blue-50 text-blue-700 border-blue-200/50'
                                }`}>
                                  {g.status.replace('-', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Category telemetry breakdown */}
                <div className="surface-card p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-850">Category breakdown</h3>
                    <p className="text-xs text-slate-450 mt-0.5">Grievance distribution across fields.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Progress Bar Item: Academic */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>Academic</span>
                        <span>{stats.academic}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.academic / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar Item: Infrastructure */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>Infrastructure</span>
                        <span>{stats.infrastructure}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.infrastructure / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar Item: Administrative */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>Administrative</span>
                        <span>{stats.administrative}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.administrative / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar Item: Financial */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>Financial</span>
                        <span>{stats.financial}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.financial / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar Item: Other */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-650">
                        <span>Other</span>
                        <span>{stats.other}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-400 rounded-full" 
                          style={{ width: `${stats.total > 0 ? (stats.other / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMAILS PANEL INBOX VIEW */}
          {activeSidebarTab === 'emails' && (
            <div className="h-full flex flex-col">
              <GrievanceEmailsView role="admin" />
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT VIEW */}
          {activeSidebarTab === 'users' && (
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">User Management registry</h1>
                  <p className="text-xs text-slate-500 mt-1">Review active system users, role authorizations, and profile configurations.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-600 shadow-sm">
                    <Download className="w-3.5 h-3.5" />
                    Export Users
                  </button>
                </div>
              </div>

              {/* Users table */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search accounts registry..." 
                      className="w-full pl-9 pr-4 py-2 border border-slate-250/80 rounded-xl text-xs bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-55/20">
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold text-slate-450 uppercase tracking-wider">User Profile</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Authorization Role</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-xs font-bold text-slate-450 uppercase tracking-wider">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-xs text-slate-650">
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center">
                            SA
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Sukhdev Aulakh</div>
                            <div className="text-[10px] text-slate-400">sukhdev.admin@gndec.ac.in</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                            Admin
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-emerald-600 font-bold">Active</td>
                        <td className="px-5 py-3.5 text-slate-500">22 Sep 2025</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center">
                            PK
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Parminder Kaur</div>
                            <div className="text-[10px] text-slate-400">parminder.clerk@gndec.ac.in</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                            Clerk
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-emerald-600 font-bold">Active</td>
                        <td className="px-5 py-3.5 text-slate-500">14 Oct 2025</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center">
                            AS
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">Amandeep Singh</div>
                            <div className="text-[10px] text-slate-400">aman.student@gndec.ac.in</div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                            Student
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-emerald-600 font-bold">Active</td>
                        <td className="px-5 py-3.5 text-slate-500">03 Nov 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS & ANALYTICS */}
          {activeSidebarTab === 'reports' && (
            <div className="p-6 max-w-7xl mx-auto space-y-6 text-left">
              <div>
                <h1 className="text-xl font-bold text-slate-800">Reports & Analytics Telemetry</h1>
                <p className="text-xs text-slate-550 mt-1">Review statistical models of redressal timing, category analysis, and resolutions.</p>
              </div>

              {/* Telemetry charts list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution rate</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : '0.0'}%
                    </span>
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +4.2% increase
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Average resolved student grievances calculated across the live Supabase database.</p>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average redressal timeline</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-800">2.4 Days</span>
                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      -0.8 days lower
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Median response turnaround for department staff allocation and action closure logs.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMAIL SETTINGS */}
          {activeSidebarTab === 'settings' && (
            <div className="p-6 max-w-3xl mx-auto space-y-6 text-left">
              <div>
                <h1 className="text-xl font-bold text-slate-800">ERP System Configuration</h1>
                <p className="text-xs text-slate-550 mt-1">Manage grievance portal data preferences, backups, and configurations.</p>
              </div>
              
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    Export Telemetry Registry
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">Download backup records of system grievances for institutional review files.</p>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Export operations download live grievance records in structured table formats. No backend API edits are processed.
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-colors">
                      Export csv file
                    </button>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-colors">
                      Export json document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
