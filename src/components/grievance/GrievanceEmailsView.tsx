import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Inbox, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Loader2, 
  RefreshCcw,
  Filter,
  FileText,
  User,
  ShieldAlert,
  ChevronRight,
  Reply,
  Forward,
  CheckCircle,
  Folder,
  SlidersHorizontal,
  X,
  GripVertical
} from 'lucide-react';
import { 
  fetchEmails, 
  markEmailAsRead, 
  deleteEmail, 
  toggleStarEmail, 
  replyToEmail, 
  replyAllToEmail,
  forwardEmail,
  markGrievanceAsResolvedFromEmail,
  assignGrievanceToStaff,
  fetchStaffMembers,
  Email
} from '../../lib/adminAPI';
import toast from 'react-hot-toast';

interface GrievanceEmailsViewProps {
  role: 'admin' | 'clerk';
}

const GrievanceEmailsView: React.FC<GrievanceEmailsViewProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string>('');
  
  // Customization preferences (TASK 4)
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'expanded'>(() => {
    const saved = localStorage.getItem('gndec_view_density');
    return (saved as 'compact' | 'comfortable' | 'expanded') || 'comfortable';
  });
  
  const [listWidth, setListWidth] = useState<number>(() => {
    const saved = localStorage.getItem('gndec_email_list_width');
    return saved ? parseInt(saved, 10) : 360;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    unreadOnly: boolean;
    starredOnly: boolean;
    dateRange: string;
  }>({
    unreadOnly: false,
    starredOnly: false,
    dateRange: 'all'
  });

  // Modals state
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);
  const [showForwardModal, setShowForwardModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [replyBody, setReplyBody] = useState<string>('');
  const [isReplyAll, setIsReplyAll] = useState<boolean>(false);
  const [forwardData, setForwardData] = useState<{
    to: string;
    additionalMessage: string;
    cc: string;
    bcc: string;
  }>({
    to: '',
    additionalMessage: '',
    cc: '',
    bcc: ''
  });
  const [staffAssignId, setStaffAssignId] = useState<string>('');
  const [staffMembers, setStaffMembers] = useState<Array<{id: string, name: string, role: string, department: string}>>([]);

  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);

  // Load emails and handle authorization error (Clerk/Admin check)
  const loadEmails = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setUnauthorized(false);
    try {
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails || []);
    } catch (error: any) {
      console.error('Failed to fetch emails:', error);
      // Check if unauthorized (403 or 401 response status)
      const errorMsg = error?.message || '';
      if (
        errorMsg.toLowerCase().includes('unauthorized') || 
        errorMsg.toLowerCase().includes('forbidden') || 
        error?.status === 403 || 
        error?.status === 401
      ) {
        setUnauthorized(true);
        setUnauthorizedMessage(errorMsg || 'Your account does not have permission to access the emails database.');
      } else {
        toast.error('Failed to load emails. Server error.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  // Load staff members when needed for assignment
  useEffect(() => {
    if (showAssignModal) {
      loadStaffMembers();
    }
  }, [showAssignModal]);

  const loadStaffMembers = async () => {
    try {
      const fetchedStaffMembers = await fetchStaffMembers();
      setStaffMembers(fetchedStaffMembers || []);
    } catch (error) {
      console.error('Failed to fetch staff members:', error);
      // Fallback staff members if API is un-implemented or fails
      setStaffMembers([
        { id: 'staff1', name: 'DSW Office', role: 'dsw', department: 'Student Welfare' },
        { id: 'staff2', name: 'Academic Branch Clerk', role: 'clerk', department: 'Academic' },
        { id: 'staff3', name: 'Accounts Department', role: 'clerk', department: 'Finance' },
      ]);
    }
  };

  const refreshEmails = async () => {
    setRefreshing(true);
    setUnauthorized(false);
    try {
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails || []);
      toast.success('Emails refreshed');
    } catch (error: any) {
      console.error('Failed to refresh emails:', error);
      const errorMsg = error?.message || '';
      if (
        errorMsg.toLowerCase().includes('unauthorized') || 
        errorMsg.toLowerCase().includes('forbidden') || 
        error?.status === 403 || 
        error?.status === 401
      ) {
        setUnauthorized(true);
        setUnauthorizedMessage(errorMsg || 'Your account does not have permission to access the emails database.');
      } else {
        toast.error('Failed to refresh emails');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);
    
    if (!email.read) {
      try {
        await markEmailAsRead(email.id);
        setEmails(prevEmails =>
          prevEmails.map(e => 
            e.id === email.id ? { ...e, read: true } : e
          )
        );
      } catch (error) {
        console.error('Failed to mark email as read:', error);
      }
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteEmail(emailId);
      setEmails(prevEmails => prevEmails.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      toast.success('Email deleted');
    } catch (error) {
      console.error('Failed to delete email:', error);
      toast.error('Failed to delete email');
    }
  };

  const handleToggleStar = async (emailId: string) => {
    try {
      await toggleStarEmail(emailId);
      setEmails(prevEmails =>
        prevEmails.map(e => 
          e.id === emailId ? { ...e, starred: !e.starred } : e
        )
      );
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(prev => prev ? { ...prev, starred: !prev.starred } : null);
      }
      toast.success('Email starred status updated');
    } catch (error) {
      console.error('Failed to toggle star status:', error);
      toast.error('Failed to update star status');
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedEmail || !replyBody.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      if (isReplyAll) {
        await replyAllToEmail(selectedEmail.id, { body: replyBody });
        toast.success('Reply all sent successfully');
      } else {
        await replyToEmail(selectedEmail.id, { body: replyBody });
        toast.success('Reply sent successfully');
      }
      setShowReplyModal(false);
      setReplyBody('');
      await refreshEmails();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleForwardSubmit = async () => {
    if (!selectedEmail || !forwardData.to.trim()) {
      toast.error('Recipient email is required');
      return;
    }

    try {
      await forwardEmail(selectedEmail.id, forwardData);
      toast.success('Email forwarded successfully');
      setShowForwardModal(false);
      setForwardData({
        to: '',
        additionalMessage: '',
        cc: '',
        bcc: ''
      });
      await refreshEmails();
    } catch (error) {
      console.error('Failed to forward email:', error);
      toast.error('Failed to forward email');
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedEmail) return;

    try {
      await markGrievanceAsResolvedFromEmail(selectedEmail.id, selectedEmail.id);
      toast.success('Grievance marked as resolved');
      await refreshEmails();
    } catch (error) {
      console.error('Failed to mark as resolved:', error);
      toast.error('Failed to mark as resolved');
    }
  };

  const handleAssignToStaff = async () => {
    if (!selectedEmail || !staffAssignId.trim()) {
      toast.error('Please select a staff member');
      return;
    }

    try {
      await assignGrievanceToStaff(selectedEmail.id, staffAssignId);
      toast.success('Grievance assigned to staff');
      setShowAssignModal(false);
      setStaffAssignId('');
      await refreshEmails();
    } catch (error) {
      console.error('Failed to assign to staff:', error);
      toast.error('Failed to assign to staff');
    }
  };

  // Drag handle logic for panel resizing (TASK 4)
  const startDragging = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const onDragging = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const minWidth = 260;
    const maxWidth = 550;
    // Calculate relative offset of container
    const dragBar = dragRef.current;
    if (!dragBar) return;
    const containerOffsetLeft = dragBar.parentElement?.getBoundingClientRect().left || 0;
    const newWidth = e.clientX - containerOffsetLeft - 64; // Subtract side tab width (64px)
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setListWidth(newWidth);
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', onDragging);
    document.removeEventListener('mouseup', stopDragging);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
    localStorage.setItem('gndec_email_list_width', listWidth.toString());
  };

  // Save density setting when updated (TASK 4)
  const changeDensity = (newDensity: 'compact' | 'comfortable' | 'expanded') => {
    setDensity(newDensity);
    localStorage.setItem('gndec_view_density', newDensity);
    toast.success(`Switched to ${newDensity} density`, { duration: 1500 });
  };

  const applyFilters = () => {
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilterOptions({
      unreadOnly: false,
      starredOnly: false,
      dateRange: 'all'
    });
    setSearchQuery('');
    setFilterOpen(false);
  };

  // Apply filters and search
  const filteredEmails = emails.filter((email) => {
    if (!email) return false;
    
    if (activeTab === 'starred' && !email.starred) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const subject = email.subject?.toLowerCase() || '';
      const from = email.from?.toLowerCase() || '';
      const body = email.body?.toLowerCase() || '';
      if (!subject.includes(query) && !from.includes(query) && !body.includes(query)) {
        return false;
      }
    }

    if (filterOptions.unreadOnly && email.read) return false;
    if (filterOptions.starredOnly && !email.starred) return false;

    if (filterOptions.dateRange !== 'all') {
      const emailDate = new Date(email.date);
      if (!isNaN(emailDate.getTime())) {
        const today = new Date();
        const daysDiff = Math.floor((today.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
        if (filterOptions.dateRange === '7days' && daysDiff > 7) return false;
        if (filterOptions.dateRange === '30days' && daysDiff > 30) return false;
        if (filterOptions.dateRange === '90days' && daysDiff > 90) return false;
      }
    }

    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
  };

  const unreadCount = emails.filter(email => !email.read).length;

  // Render view density spacing classes
  const getDensityClass = () => {
    switch (density) {
      case 'compact':
        return 'py-2 px-3';
      case 'expanded':
        return 'py-5 px-5';
      case 'comfortable':
      default:
        return 'py-3.5 px-4';
    }
  };

  // 1. UNAUTHORIZED / 403 ERROR STATE
  if (unauthorized) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8 min-h-[500px]">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60 transform transition-all hover:scale-[1.01]">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied by Server</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {role === 'clerk' ? (
              <span>Your clerk account is not permitted by backend security configuration to read student email communications directly.</span>
            ) : (
              <span>{unauthorizedMessage}</span>
            )}
          </p>
          <div className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-3 select-all">
            403 Forbidden: Endpoint Restriction
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex h-full overflow-hidden bg-slate-50 relative">
      {/* 2. INNER EMAILS NAVIGATION SIDEBAR (64px mini panel) */}
      <div className="w-16 flex flex-col items-center py-4 bg-white border-r border-slate-200/80 flex-shrink-0">
        <button
          onClick={() => setActiveTab('inbox')}
          title="Inbox"
          className={`relative p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'inbox'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('starred')}
          title="Starred"
          className={`mt-4 p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'starred'
              ? 'bg-amber-50 text-amber-500'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}
        >
          <Star className="w-5 h-5" />
        </button>
        
        <div className="mt-auto pt-4 border-t border-slate-100 w-8 flex justify-center">
          <button
            onClick={refreshEmails}
            disabled={refreshing}
            title="Refresh Inbox"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. EMAIL LIST MIDDLE PANEL (Resizable) */}
      <div 
        style={{ width: `${listWidth}px` }}
        className="flex flex-col bg-white border-r border-slate-200/80 flex-shrink-0 h-full overflow-hidden relative md:block hidden"
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-850 text-base tracking-tight capitalize flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500" />
              {activeTab}
              {activeTab === 'inbox' && unreadCount > 0 && (
                <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h2>
            
            {/* View Density Dropdown (TASK 4) */}
            <div className="relative group">
              <button 
                title="View Options"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 border border-slate-100 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200/80 rounded-xl shadow-xl py-1.5 hidden group-hover:block z-30">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Density</div>
                <button 
                  onClick={() => changeDensity('compact')}
                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${density === 'compact' ? 'text-blue-600 font-bold' : 'text-slate-650'}`}
                >
                  Compact
                </button>
                <button 
                  onClick={() => changeDensity('comfortable')}
                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${density === 'comfortable' ? 'text-blue-600 font-bold' : 'text-slate-650'}`}
                >
                  Comfortable
                </button>
                <button 
                  onClick={() => changeDensity('expanded')}
                  className={`w-full px-3 py-1.5 text-left text-xs hover:bg-slate-50 ${density === 'expanded' ? 'text-blue-600 font-bold' : 'text-slate-650'}`}
                >
                  Expanded
                </button>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border transition-all ${
                filterOptions.unreadOnly || filterOptions.starredOnly || filterOptions.dateRange !== 'all'
                  ? 'border-blue-200 bg-blue-55/40 text-blue-600 font-semibold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Filter className="w-3 h-3" />
              Filters
            </button>
            
            {(filterOptions.unreadOnly || filterOptions.starredOnly || filterOptions.dateRange !== 'all' || searchQuery) && (
              <button 
                onClick={resetFilters}
                className="text-[10px] text-red-500 hover:underline font-bold"
              >
                Clear all
              </button>
            )}
          </div>
          
          {/* Filters Popover */}
          {filterOpen && (
            <div className="absolute left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-xl z-20 p-3 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Filter Options</h4>
              
              <div className="space-y-2">
                <label className="flex items-center text-xs text-slate-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterOptions.unreadOnly}
                    onChange={() => setFilterOptions({...filterOptions, unreadOnly: !filterOptions.unreadOnly})}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  Unread only
                </label>
                <label className="flex items-center text-xs text-slate-650 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterOptions.starredOnly}
                    onChange={() => setFilterOptions({...filterOptions, starredOnly: !filterOptions.starredOnly})}
                    className="mr-2 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  Starred only
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Time Period</label>
                <select
                  value={filterOptions.dateRange}
                  onChange={(e) => setFilterOptions({...filterOptions, dateRange: e.target.value})}
                  className="w-full text-xs p-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  <option value="all">All time</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={resetFilters}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Inbox Scroll Area */}
        <div className="flex-grow overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            // Premium Skeleton loaders
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-4 space-y-2.5 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-3.5 bg-slate-200 rounded-full w-24" />
                  <div className="h-3 bg-slate-100 rounded-full w-12" />
                </div>
                <div className="h-3.5 bg-slate-150 rounded-full w-3/4" />
                <div className="h-3 bg-slate-100 rounded-full w-5/6" />
              </div>
            ))
          ) : filteredEmails.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No emails matching</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Try refining your filter settings or search query.</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailSelect(email)}
                className={`flex flex-col text-left transition-all border-l-2 cursor-pointer hover:bg-slate-50/80 ${getDensityClass()} ${
                  selectedEmail?.id === email.id
                    ? 'bg-blue-50/50 border-l-blue-600'
                    : !email.read
                    ? 'bg-white border-l-blue-450/70 font-semibold'
                    : 'border-l-transparent bg-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs truncate max-w-[150px] ${!email.read ? 'text-slate-900 font-extrabold' : 'text-slate-600'}`}>
                    {email.from.split('<')[0].trim()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {formatDate(email.date)}
                  </span>
                </div>
                
                <h4 className={`text-xs truncate mb-1 ${!email.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                  {email.subject}
                </h4>
                
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400 truncate flex-grow">
                    {email.body.replace(/<[^>]*>/g, '').trim()}
                  </p>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(email.id);
                    }}
                    className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                      email.starred ? 'text-amber-500' : 'text-slate-350 hover:text-amber-400'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${email.starred ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. DRAG HANDLE / RESIZER BAR (TASK 4) */}
      <div
        ref={dragRef}
        onMouseDown={startDragging}
        className="w-1.5 hover:w-2 bg-slate-200/50 hover:bg-blue-400/50 cursor-col-resize flex-shrink-0 transition-all z-10 md:flex hidden items-center justify-center relative border-r border-slate-200/30"
        title="Drag to resize panel"
      >
        <GripVertical className="w-3 h-3 text-slate-400/80 absolute pointer-events-none" />
      </div>

      {/* 5. EMAIL PREVIEW CONTENT PANEL (Right side / Full screen on Mobile) */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
        {selectedEmail ? (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Header / Actions Menu */}
            <div className="p-4 border-b border-slate-200/60 bg-white flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-1">
                {/* Back button (Mobile only) */}
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl mr-1"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                
                <button
                  onClick={() => handleToggleStar(selectedEmail.id)}
                  title={selectedEmail.starred ? "Unstar" : "Star"}
                  className={`p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedEmail.starred ? 'text-amber-500 bg-amber-50/30 border-amber-100' : 'text-slate-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedEmail.starred ? 'fill-amber-400' : ''}`} />
                </button>

                <button
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  title="Delete"
                  className="p-2 rounded-xl border border-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Action Pipeline */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    setIsReplyAll(false);
                    setShowReplyModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  <Reply className="w-3.5 h-3.5 text-blue-500" />
                  Reply
                </button>
                <button 
                  onClick={() => {
                    setIsReplyAll(true);
                    setShowReplyModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm md:inline-flex hidden"
                >
                  <Reply className="w-3.5 h-3.5 text-blue-400 scale-x-[-1]" />
                  Reply All
                </button>
                <button 
                  onClick={() => setShowForwardModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                >
                  <Forward className="w-3.5 h-3.5 text-slate-550" />
                  Forward
                </button>
                
                {/* Resolution & Assignment (Staff functionality) */}
                <button 
                  onClick={handleMarkAsResolved}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolve Grievance
                </button>
                <button 
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                >
                  <User className="w-3.5 h-3.5" />
                  Assign Staff
                </button>
              </div>
            </div>

            {/* Email Metadata Panel */}
            <div className="p-6 border-b border-slate-100 bg-white">
              <h1 className="text-lg font-extrabold text-slate-900 leading-snug mb-4">
                {selectedEmail.subject}
              </h1>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center shadow-md">
                    {(selectedEmail.from.split('<')[0].trim() || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-850">
                      {selectedEmail.from.split('<')[0].trim()}
                    </h3>
                    <p className="text-xs text-slate-400 select-all">
                      {selectedEmail.from}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 font-semibold">
                    {new Date(selectedEmail.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(selectedEmail.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Email Content Frame */}
            <div className="flex-1 p-6 overflow-y-auto bg-white select-text">
              <div 
                className="prose max-w-none text-slate-700 text-sm leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: selectedEmail.body }} 
              />
            </div>

            {/* Attachments Section */}
            {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
              <div className="p-5 bg-slate-50/50 border-t border-slate-150/55">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Attachments ({selectedEmail.attachments.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedEmail.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      download={attachment.filename}
                      className="inline-flex items-center gap-2 p-2.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/10 rounded-xl transition-all shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                        {attachment.filename}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty Preview State */
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6">
            <div className="w-16 h-16 bg-white border border-slate-200/60 rounded-3xl flex items-center justify-center shadow-sm mb-4">
              <Mail className="w-8 h-8 text-blue-400/80" />
            </div>
            <p className="text-sm font-bold text-slate-800">Select an email to preview</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] text-center leading-relaxed">
              Choose any email communication from the list panel to view details, reply, or assign to department staff.
            </p>
          </div>
        )}
      </div>

      {/* 6. MODALS */}
      {/* Reply Modal */}
      {showReplyModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Reply className="w-4 h-4 text-blue-600" />
                {isReplyAll ? 'Reply All to Email' : 'Reply to Email'}
              </h3>
              <button onClick={() => setShowReplyModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 mb-4 text-left">
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">To:</span> {selectedEmail.from}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Subject:</span> Re: {selectedEmail.subject}
              </p>
            </div>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="flex-grow w-full p-4 border border-slate-200 rounded-xl h-44 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 text-sm"
              placeholder="Type your message details here..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Forward className="w-4 h-4 text-blue-500" />
                Forward Email Communication
              </h3>
              <button onClick={() => setShowForwardModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">To (Recipient):</label>
                <input
                  type="email"
                  value={forwardData.to}
                  onChange={(e) => setForwardData({...forwardData, to: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs"
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">CC:</label>
                  <input
                    type="text"
                    value={forwardData.cc}
                    onChange={(e) => setForwardData({...forwardData, cc: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs"
                    placeholder="cc@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">BCC:</label>
                  <input
                    type="text"
                    value={forwardData.bcc}
                    onChange={(e) => setForwardData({...forwardData, bcc: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs"
                    placeholder="bcc@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Additional Message (Optional):</label>
                <textarea
                  value={forwardData.additionalMessage}
                  onChange={(e) => setForwardData({...forwardData, additionalMessage: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs"
                  placeholder="Add context notes here..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleForwardSubmit}
                className="px-5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Forward Mail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Assign Grievance to Staff
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-5 text-left">
              <label className="block text-xs font-bold text-slate-600 mb-2">Select Staff Member:</label>
              <select
                value={staffAssignId}
                onChange={(e) => setStaffAssignId(e.target.value)}
                className="w-full p-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs"
              >
                <option value="">Choose department staff member</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} — {staff.role.toUpperCase()} ({staff.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToStaff}
                className="px-5 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrievanceEmailsView;
