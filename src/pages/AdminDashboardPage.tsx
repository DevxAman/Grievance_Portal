import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  ChevronDown,
  CheckSquare
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
  fetchStaffMembers
} from '../lib/adminAPI';
import toast from 'react-hot-toast';

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  body: string;
  read: boolean;
  starred: boolean;
  attachments: {
    filename: string;
    url: string;
  }[];
}

const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<{
    unreadOnly: boolean;
    starredOnly: boolean;
    dateRange: string;
  }>({
    unreadOnly: false,
    starredOnly: false,
    dateRange: '7days'
  });
  const [showReplyModal, setShowReplyModal] = useState<boolean>(false);
  const [showForwardModal, setShowForwardModal] = useState<boolean>(false);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [replyBody, setReplyBody] = useState<string>('');
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
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('emails');

  // Check if user is authorized
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

    loadEmails();
  }, [isAuthenticated, user, navigate]);

  // Load staff members when needed for assignment
  useEffect(() => {
    if (showAssignModal) {
      loadStaffMembers();
    }
  }, [showAssignModal]);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const fetchedStaffMembers = await fetchStaffMembers();
      setStaffMembers(fetchedStaffMembers);
    } catch (error) {
      console.error('Failed to fetch staff members:', error);
      toast.error('Failed to load staff members');
    }
  };

  const refreshEmails = async () => {
    setRefreshing(true);
    try {
      const fetchedEmails = await fetchEmails();
      setEmails(fetchedEmails);
      toast.success('Emails refreshed');
    } catch (error) {
      console.error('Failed to refresh emails:', error);
      toast.error('Failed to refresh emails');
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmailSelect = async (email: Email) => {
    setSelectedEmail(email);
    
    if (!email.read) {
      try {
        await markEmailAsRead(email.id);
        // Update the email list to mark this email as read
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
      // Remove the email from the list
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
      // Update local state to reflect the change
      setEmails(prevEmails =>
        prevEmails.map(e => 
          e.id === emailId ? { ...e, starred: !e.starred } : e
        )
      );
      toast.success('Email star status updated');
    } catch (error) {
      console.error('Failed to toggle star status:', error);
      toast.error('Failed to update star status');
    }
  };

  const handleReply = async () => {
    if (!selectedEmail || !replyBody.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await replyToEmail(selectedEmail.id, { body: replyBody });
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setReplyBody('');
      await refreshEmails();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const handleReplyAll = async () => {
    if (!selectedEmail || !replyBody.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await replyAllToEmail(selectedEmail.id, { body: replyBody });
      toast.success('Reply all sent successfully');
      setShowReplyModal(false);
      setReplyBody('');
      await refreshEmails();
    } catch (error) {
      console.error('Failed to send reply all:', error);
      toast.error('Failed to send reply all');
    }
  };

  const handleForward = async () => {
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
      // We're assuming the grievanceId is the same as the emailId for simplicity
      // In a real app, you'd need to get the associated grievanceId
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
      // We're assuming the grievanceId is the same as the emailId for simplicity
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

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const applyFilters = () => {
    setFilterOpen(false);
    // The actual filtering is done in the filteredEmails calculation
    toast.success('Filters applied');
  };

  const resetFilters = () => {
    setFilterOptions({
      unreadOnly: false,
      starredOnly: false,
      dateRange: '7days'
    });
    setSearchQuery('');
    setFilterOpen(false);
    toast.success('Filters reset');
  };

  // Apply filters and search to the emails
  const filteredEmails = emails.filter(email => {
    // Filter based on active tab
    if (activeTab === 'starred' && !email.starred) return false;
    
    // Apply search
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !email.from.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Apply filters
    if (filterOptions.unreadOnly && email.read) return false;
    if (filterOptions.starredOnly && !email.starred) return false;
    
    // Date range filter
    if (filterOptions.dateRange !== 'all') {
      const emailDate = new Date(email.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - emailDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (filterOptions.dateRange === '7days' && daysDiff > 7) return false;
      if (filterOptions.dateRange === '30days' && daysDiff > 30) return false;
      if (filterOptions.dateRange === '90days' && daysDiff > 90) return false;
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
      return date.toLocaleDateString();
    }
  };

  // Determine if there are any unread emails
  const unreadCount = emails.filter(email => !email.read).length;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
        </div>
        
        <nav className="mt-4">
          <div className="px-4 py-2 text-sm font-medium text-gray-600 uppercase">Main</div>
          <button 
            onClick={() => setActiveSidebarTab('dashboard')}
            className={`flex items-center py-2 px-4 w-full text-left ${
              activeSidebarTab === 'dashboard' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <BarChart className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveSidebarTab('emails')}
            className={`flex items-center py-2 px-4 w-full text-left ${
              activeSidebarTab === 'emails' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Mail className="h-5 w-5 mr-3" />
            <span>Grievance Emails</span>
          </button>
          <button 
            onClick={() => setActiveSidebarTab('users')}
            className={`flex items-center py-2 px-4 w-full text-left ${
              activeSidebarTab === 'users' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Users className="h-5 w-5 mr-3" />
            <span>Users</span>
          </button>
          <button 
            onClick={() => setActiveSidebarTab('reports')}
            className={`flex items-center py-2 px-4 w-full text-left ${
              activeSidebarTab === 'reports' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <FileText className="h-5 w-5 mr-3" />
            <span>Reports</span>
          </button>
          
          <div className="px-4 py-2 mt-6 text-sm font-medium text-gray-600 uppercase">Settings</div>
          <button 
            onClick={() => setActiveSidebarTab('settings')}
            className={`flex items-center py-2 px-4 w-full text-left ${
              activeSidebarTab === 'settings' 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <Settings className="h-5 w-5 mr-3" />
            <span>Email Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                {activeSidebarTab === 'dashboard' && 'Admin Dashboard'}
                {activeSidebarTab === 'emails' && 'Grievance Emails'}
                {activeSidebarTab === 'users' && 'User Management'}
                {activeSidebarTab === 'reports' && 'Reports & Analytics'}
                {activeSidebarTab === 'settings' && 'Email Settings'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {activeSidebarTab === 'emails' && (
                <>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-4 w-4 text-gray-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button 
                    onClick={toggleFilter}
                    className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    <Filter className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <div className="relative">
                    {filterOpen && (
                      <div className="absolute right-0 top-12 w-64 bg-white rounded-md shadow-lg z-20 p-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Filter Options</h3>
                        
                        <div className="mb-4">
                          <div className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              id="unreadOnly"
                              checked={filterOptions.unreadOnly}
                              onChange={() => setFilterOptions({...filterOptions, unreadOnly: !filterOptions.unreadOnly})}
                              className="mr-2"
                            />
                            <label htmlFor="unreadOnly">Unread only</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="starredOnly"
                              checked={filterOptions.starredOnly}
                              onChange={() => setFilterOptions({...filterOptions, starredOnly: !filterOptions.starredOnly})}
                              className="mr-2"
                            />
                            <label htmlFor="starredOnly">Starred only</label>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                          <select
                            value={filterOptions.dateRange}
                            onChange={(e) => setFilterOptions({...filterOptions, dateRange: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="7days">Last 7 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="all">All time</option>
                          </select>
                        </div>
                        
                        <div className="flex justify-between">
                          <button
                            onClick={resetFilters}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                          >
                            Reset
                          </button>
                          <button
                            onClick={applyFilters}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.[0] || 'A'}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline-block">
                  {user?.name || 'Admin User'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Email Interface */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          <div className="w-64 border-r bg-white">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Grievance Emails</h2>
              <button 
                onClick={refreshEmails}
                className="p-1 rounded-full hover:bg-gray-100"
                title="Refresh emails"
                disabled={refreshing}
              >
                <RefreshCcw className={`h-4 w-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setActiveTab('inbox')}
                  className={`flex items-center ${activeTab === 'inbox' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  <span>Inbox</span>
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('starred')}
                  className={`flex items-center ${activeTab === 'starred' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  <Star className="h-4 w-4 mr-2" />
                  <span>Starred</span>
                </button>
              </div>
            </div>
            
            {/* Email list */}
            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No emails found
                </div>
              ) : (
                <div>
                  {filteredEmails.map((email) => (
                    <div 
                      key={email.id}
                      onClick={() => handleEmailSelect(email)}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                      } ${!email.read ? 'font-semibold' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-sm truncate">
                          {email.from.split('<')[0].trim()}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-1">
                          {formatDate(email.date)}
                        </div>
                      </div>
                      <div className="text-sm font-medium truncate mb-1">{email.subject}</div>
                      <div className="flex justify-between">
                        <div className="text-xs text-gray-500 truncate" style={{ maxWidth: '75%' }}>
                          {email.body.replace(/<[^>]*>/g, '').substring(0, 50)}...
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(email.id);
                          }}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          <Star className={`h-4 w-4 ${email.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Email content */}
          <div className="flex-1 overflow-auto bg-white">
            {selectedEmail ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium">{selectedEmail.subject}</h2>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleToggleStar(selectedEmail.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Star className={`h-5 w-5 ${selectedEmail.starred ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} />
                      </button>
                      <button 
                        onClick={() => setSelectedEmail(null)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Archive className="h-5 w-5 text-gray-500" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmail(selectedEmail.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{selectedEmail.from.split('<')[0].trim()}</div>
                      <div className="text-sm text-gray-600">{selectedEmail.from}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedEmail.date).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                </div>
                
                {selectedEmail.attachments.length > 0 && (
                  <div className="p-4 border-t">
                    <h3 className="font-medium mb-2">Attachments ({selectedEmail.attachments.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          download={attachment.filename}
                          className="flex items-center p-2 border rounded-md hover:bg-gray-50"
                        >
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm">{attachment.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="p-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowReplyModal(true)} 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => {
                        setShowReplyModal(true);
                        setReplyBody(''); // Clear any existing text
                      }} 
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Reply All
                    </button>
                    <button 
                      onClick={() => setShowForwardModal(true)} 
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                    >
                      Forward
                    </button>
                    <button 
                      onClick={handleMarkAsResolved} 
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                    <button 
                      onClick={() => setShowAssignModal(true)} 
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                      Assign to Staff
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Mail className="h-16 w-16 mb-4 text-gray-300" />
                <p>Select an email to view its contents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Reply to Email</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {selectedEmail.from}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Subject:</span> Re: {selectedEmail.subject}
              </p>
            </div>
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full p-3 border rounded-md h-40 mb-4"
              placeholder="Type your reply here..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowReplyModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send Reply
              </button>
              <button
                onClick={handleReplyAll}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Send to All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Forward Email</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                <input
                  type="email"
                  value={forwardData.to}
                  onChange={(e) => setForwardData({...forwardData, to: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CC:</label>
                <input
                  type="text"
                  value={forwardData.cc}
                  onChange={(e) => setForwardData({...forwardData, cc: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="cc@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BCC:</label>
                <input
                  type="text"
                  value={forwardData.bcc}
                  onChange={(e) => setForwardData({...forwardData, bcc: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="bcc@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message:</label>
                <textarea
                  value={forwardData.additionalMessage}
                  onChange={(e) => setForwardData({...forwardData, additionalMessage: e.target.value})}
                  className="w-full p-2 border rounded-md h-28"
                  placeholder="Add a message (optional)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Assign to Staff</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff Member:</label>
              <select
                value={staffAssignId}
                onChange={(e) => setStaffAssignId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select staff member</option>
                {staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role} ({staff.department})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="staff1">Staff Member 1</option>
                    <option value="staff2">Staff Member 2</option>
                    <option value="staff3">Staff Member 3</option>
                    <option value="dsw">DSW</option>
                    <option value="hod">HOD</option>
                  </>
                )}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignToStaff}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeSidebarTab === 'settings' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Settings</h3>
            </div>
            <div className="p-6">
              <div className="mb-8">
                <h4 className="text-md font-medium mb-4">Export Grievance Data</h4>
                <p className="mb-4 text-gray-700">
                  Use these options to export grievance data for use in external applications.
                </p>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                    Export to CSV
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                    Export to JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage; 