import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  User,
  LayoutDashboard,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGrievance } from '../hooks/useGrievance';
import GrievanceDetails from '../components/grievance/GrievanceDetails';
import { Grievance } from '../types';
import { addResponse, processUnprocessedEmails } from '../lib/api';
import GrievanceEmailsView from '../components/grievance/GrievanceEmailsView';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under-review', label: 'Under Review' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'academic', label: 'Academic' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'financial', label: 'Financial' },
  { value: 'other', label: 'Other' },
];

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'under-review':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'in-progress':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatDisplayDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const ClerkDashboardPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { grievances, fetchGrievances, changeStatus, getGrievanceById, loading } =
    useGrievance();
  const navigate = useNavigate();

  // Navigation states
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>(() => {
    return localStorage.getItem('gndec_clerk_active_tab') || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('gndec_sidebar_collapsed') === 'true';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'clerk') {
      navigate('/dashboard');
      return;
    }

    fetchGrievances();

    processUnprocessedEmails(user.id)
      .then(() => fetchGrievances())
      .catch(console.error);
  }, [authLoading, isAuthenticated, user, navigate, fetchGrievances]);

  // Persist active tab and collapsed sidebar state
  useEffect(() => {
    localStorage.setItem('gndec_clerk_active_tab', activeSidebarTab);
  }, [activeSidebarTab]);

  const toggleSidebar = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem('gndec_sidebar_collapsed', String(nextState));
  };

  const stats = useMemo(() => {
    const counts = {
      total: grievances.length,
      pending: 0,
      active: 0,
      resolved: 0,
      rejected: 0,
    };

    grievances.forEach((g) => {
      if (g.status === 'pending') counts.pending += 1;
      if (['pending', 'under-review', 'in-progress'].includes(g.status)) counts.active += 1;
      if (g.status === 'resolved') counts.resolved += 1;
      if (g.status === 'rejected') counts.rejected += 1;
    });

    return counts;
  }, [grievances]);

  const filteredGrievances = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return grievances
      .filter((g) => {
        if (statusFilter !== 'all' && g.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
        if (!query) return true;

        return (
          g.id.toLowerCase().includes(query) ||
          g.title.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [grievances, searchQuery, statusFilter, categoryFilter]);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await processUnprocessedEmails(user.id);
      fetchGrievances();
      toast.success('Grievance registry refreshed');
    } catch {
      toast.error('Failed to refresh grievances');
    } finally {
      setRefreshing(false);
    }
  };

  const handleManageGrievance = async (grievance: Grievance) => {
    setLoadingDetails(true);
    setIsDetailsOpen(true);
    try {
      const fresh = await getGrievanceById(grievance.id);
      setSelectedGrievance(fresh ?? grievance);
    } catch {
      setSelectedGrievance(grievance);
      toast.error('Could not load latest grievance details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusChange = async (grievanceId: string, status: string) => {
    const success = await changeStatus(grievanceId, status);
    if (success) {
      toast.success('Status updated successfully');
      const fresh = await getGrievanceById(grievanceId);
      if (fresh) setSelectedGrievance(fresh);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleSubmitResponse = async (grievanceId: string, responseText: string) => {
    if (!user) return;
    await addResponse(grievanceId, user.id, responseText);
    toast.success('Response submitted to student');
    const fresh = await getGrievanceById(grievanceId);
    if (fresh) setSelectedGrievance(fresh);
    fetchGrievances();
  };

  if (authLoading || (loading && grievances.length === 0)) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-600 font-semibold">Loading clerk workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans pt-16 md:pt-20">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-slate-900 border-r border-slate-800 text-slate-350 transition-all duration-300 flex flex-col z-20 flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header brand section */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          {!sidebarCollapsed && (
            <div className="flex flex-col text-left">
              <span className="text-white font-extrabold text-sm tracking-wide">CLERK PANELS</span>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">GNDEC Redressal</span>
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
            title="Dashboard Overview"
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
        </nav>

        {/* Footer info */}
        {!sidebarCollapsed && user && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-left">
            <p className="text-xs font-bold text-slate-200 truncate">{user.name || 'Clerk Officer'}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>
        )}
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow flex flex-col overflow-hidden bg-slate-50">
        
        <div className="flex-grow overflow-y-auto">
          {/* TAB 1: CLERK REGISTRY DASHBOARD */}
          {activeSidebarTab === 'dashboard' && (
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn text-left">
              
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-955 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    <Building2 className="h-3.5 w-3.5" />
                    GNDEC Clerk Control Panel
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl text-white">
                    Grievance Control Registry
                  </h1>
                  <p className="mt-1 text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
                    Review and update files, submit response notes to students, and manage institutional redressal records.
                  </p>
                </div>

                {user && (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm self-start md:self-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-650 text-md font-bold text-white shadow-md">
                      {(user.name || user.user_id).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{user.name || user.user_id}</p>
                      <p className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 mt-0.5">
                        <Shield className="h-3.5 w-3.5" />
                        Grievance Officer
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.01]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Filed</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-800">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.01] bg-amber-50/20 border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending</p>
                  <p className="mt-1 text-2xl font-extrabold text-amber-800">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.01] bg-blue-50/20 border-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Active Files</p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-800">{stats.active}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.01] bg-emerald-50/20 border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Resolved</p>
                  <p className="mt-1 text-2xl font-extrabold text-emerald-800">{stats.resolved}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm transition-transform hover:scale-[1.01] bg-red-50/20 border-red-100 col-span-2 md:col-span-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Rejected</p>
                  <p className="mt-1 text-2xl font-extrabold text-red-800">{stats.rejected}</p>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-white border border-slate-200/60 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-850">Grievance Registry Table</h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200/30">
                    {filteredGrievances.length} records
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 shadow-sm transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Registry
                </button>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID, title, description..."
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-250/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-250/80 rounded-xl focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-white border border-slate-250/80 rounded-xl focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-16">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-xs font-semibold text-slate-550">Loading grievance entries...</p>
                  </div>
                ) : filteredGrievances.length === 0 ? (
                  <div className="p-16 text-center">
                    <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <h3 className="text-sm font-bold text-slate-800">No grievances found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Adjust your filter configurations or refresh to retrieve newly filed entries.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">ID</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">Grievance Info</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">Category</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">Status</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">Filed On</th>
                          <th className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-450">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-650">
                        {filteredGrievances.map((grievance) => (
                          <tr key={grievance.id} className="transition-colors hover:bg-slate-50/50">
                            <td className="whitespace-nowrap px-4 py-4">
                              <code className="rounded-lg bg-slate-100 border border-slate-200/50 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                {grievance.id.substring(0, 8).toUpperCase()}
                              </code>
                            </td>
                            <td className="px-4 py-4">
                              <p className="max-w-[220px] truncate font-bold text-slate-800">
                                {grievance.title}
                              </p>
                              <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-slate-400">
                                {grievance.description}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 capitalize text-slate-500">
                              {grievance.category.replace('-', ' ')}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <span
                                className={`status-chip border text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(grievance.status)}`}
                              >
                                {grievance.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-slate-500 font-semibold">
                              {formatDisplayDate(grievance.created_at)}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <button
                                onClick={() => handleManageGrievance(grievance)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold">
                <User className="h-3.5 w-3.5" />
                Authorized Clerk Session · Guru Nanak Dev Engineering College, Ludhiana
              </p>
            </div>
          )}

          {/* TAB 2: EMAILS PANEL INBOX VIEW */}
          {activeSidebarTab === 'emails' && (
            <div className="h-full flex flex-col">
              <GrievanceEmailsView role="clerk" />
            </div>
          )}
        </div>
      </main>

      {/* Details drawer modal */}
      <GrievanceDetails
        grievance={selectedGrievance}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedGrievance(null);
        }}
        staffMode
        staffRoleLabel="Clerk"
        loadingDetails={loadingDetails}
        onStatusChange={handleStatusChange}
        onSubmitResponse={handleSubmitResponse}
      />
    </div>
  );
};

export default ClerkDashboardPage;
