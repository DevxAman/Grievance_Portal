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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGrievance } from '../hooks/useGrievance';
import GrievanceDetails from '../components/grievance/GrievanceDetails';
import { Grievance } from '../types';
import { addResponse, processUnprocessedEmails } from '../lib/api';

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
          <p className="text-slate-600">Loading clerk workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen">
      {/* Institutional header — pt accounts for fixed navbar */}
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 pt-16 md:pt-20">
        <div className="section-container py-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-200">
                <Building2 className="h-3.5 w-3.5" />
                GNDEC Grievance Portal
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Clerk Control Panel
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Review, respond to, and update the status of all student grievances filed
                through the institutional redressal system.
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
                  {(user.name || user.user_id).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name || user.user_id}</p>
                  <p className="flex items-center gap-1 text-xs text-emerald-200">
                    <Shield className="h-3 w-3" />
                    Clerk · Grievance Officer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container py-8 sm:py-10">
        {/* Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="metric-card border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <div className="metric-card border-amber-100 bg-amber-50/60">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Pending</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-800">{stats.pending}</p>
          </div>
          <div className="metric-card border-blue-100 bg-blue-50/60">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Active</p>
            <p className="mt-1 text-3xl font-extrabold text-blue-800">{stats.active}</p>
          </div>
          <div className="metric-card border-emerald-100 bg-emerald-50/60">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Resolved</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-800">{stats.resolved}</p>
          </div>
          <div className="metric-card border-red-100 bg-red-50/60 col-span-2 lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Rejected</p>
            <p className="mt-1 text-3xl font-extrabold text-red-800">{stats.rejected}</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="surface-card mb-6 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-extrabold text-slate-950">Grievance Registry</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {filteredGrievances.length} records
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary !min-h-[40px] !py-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, or description..."
                className="form-input !py-2.5 pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input !py-2.5 pl-10"
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
              className="form-input !py-2.5"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="surface-card overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
              <p className="text-slate-600">Loading grievances...</p>
            </div>
          ) : filteredGrievances.length === 0 ? (
            <div className="p-16 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-bold text-slate-800">No grievances found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Adjust your filters or refresh to load newly filed grievances.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Grievance ID
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Title
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Filed On
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredGrievances.map((grievance) => (
                    <tr key={grievance.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-4 py-4">
                        <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {grievance.id.substring(0, 8).toUpperCase()}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                          {grievance.title}
                        </p>
                        <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                          {grievance.description}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm capitalize text-slate-600">
                        {grievance.category.replace('-', ' ')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`status-chip border ${getStatusBadgeClass(grievance.status)}`}
                        >
                          {grievance.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDisplayDate(grievance.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <button
                          onClick={() => handleManageGrievance(grievance)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700"
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

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <User className="h-3.5 w-3.5" />
          Authorized clerk access · Guru Nanak Dev Engineering College, Ludhiana
        </p>
      </div>

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
