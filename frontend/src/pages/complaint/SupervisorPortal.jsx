import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import {
  MessageSquareWarning,
  Star,
  CheckCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  BarChart3,
  Search,
  Filter,
  Building2,
  Phone,
  User,
  ShoppingBag,
  FileText,
  ThumbsUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SupervisorPortal() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [branches, setBranches] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Active Tab: 'complaints' | 'reviews' | 'analytics' | 'demo'
  const [activeTab, setActiveTab] = useState('complaints');

  // Filter States
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [starFilter, setStarFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const [resolutionNotes, setResolutionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [editReviewData, setEditReviewData] = useState({ rating: 5, comment: '' });

  // Quick Viva Demo State
  const [demoOrder, setDemoOrder] = useState({
    orderId: '',
    category: 'Late Delivery',
    description: 'The food was delayed by over 40 minutes and arrived cold.',
    rating: 5,
    comment: 'Delicious spicy pizza, exceptional packaging and taste!',
  });
  const [submittingDemo, setSubmittingDemo] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [selectedBranchId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const branchParam = selectedBranchId === 'ALL' ? '' : `?branchId=${selectedBranchId}`;

      const [compRes, analRes, revRes, branchListRes, orderRes] = await Promise.allSettled([
        axiosClient.get(`/supervisor/complaints${branchParam}`),
        axiosClient.get('/supervisor/feedback-analytics'),
        axiosClient.get(`/supervisor/reviews${branchParam}`),
        axiosClient.get('/branches?onlyActive=false'),
        axiosClient.get('/fulfillment/orders'),
      ]);

      if (compRes.status === 'fulfilled' && compRes.value?.data) {
        setComplaints(compRes.value.data);
      }
      if (analRes.status === 'fulfilled' && analRes.value?.data) {
        setAnalytics(analRes.value.data);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.data) {
        setReviews(revRes.value.data);
      }
      if (branchListRes.status === 'fulfilled' && branchListRes.value?.data) {
        setBranches(branchListRes.value.data);
      }
      if (orderRes.status === 'fulfilled' && orderRes.value?.data && orderRes.value.data.length > 0) {
        setOrdersList(orderRes.value.data);
        if (!demoOrder.orderId) {
          setDemoOrder((prev) => ({ ...prev, orderId: orderRes.value.data[0].orderId }));
        }
      }
    } catch (err) {
      console.error('Error loading supervisor data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Complaint Actions (Update & Delete)
  const handleUpdateStatus = async (complaintId, nextStatus) => {
    try {
      const res = await axiosClient.patch(`/supervisor/complaints/${complaintId}/status?status=${nextStatus}`);
      if (res.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleResolveComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await axiosClient.patch(`/supervisor/complaints/${selectedComplaint.complaintId}/resolve`, {
        resolutionNotes,
      });
      if (res.success) {
        alert('Complaint successfully resolved and closed!');
        setShowResolveModal(false);
        setResolutionNotes('');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving complaint');
    }
  };

  const handleRejectComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      const res = await axiosClient.patch(`/supervisor/complaints/${selectedComplaint.complaintId}/reject`, {
        rejectionReason,
      });
      if (res.success) {
        alert('Complaint marked as Rejected.');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting complaint');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint ticket?')) return;
    try {
      const res = await axiosClient.delete(`/supervisor/complaints/${complaintId}`);
      if (res.success) {
        alert('Complaint deleted.');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting complaint');
    }
  };

  // Review Actions (Update & Delete)
  const handleOpenEditReview = (review) => {
    setSelectedReview(review);
    setEditReviewData({ rating: review.rating, comment: review.comment || '' });
    setShowEditReviewModal(true);
  };

  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    try {
      const res = await axiosClient.put(`/customer/reviews/${selectedReview.reviewId}`, {
        rating: Number(editReviewData.rating),
        comment: editReviewData.comment,
      });
      if (res.success) {
        alert('Review updated successfully!');
        setShowEditReviewModal(false);
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      const res = await axiosClient.delete(`/customer/reviews/${reviewId}`);
      if (res.success) {
        alert('Review deleted successfully.');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting review');
    }
  };

  // Quick Demo Handlers (Create Operations)
  const handleQuickDemoComplaint = async (e) => {
    e.preventDefault();
    setSubmittingDemo(true);
    try {
      const orderIdToUse = demoOrder.orderId || (ordersList.length > 0 ? ordersList[0].orderId : 1);
      const res = await axiosClient.post('/customer/complaints', {
        orderId: Number(orderIdToUse),
        category: demoOrder.category,
        description: demoOrder.description,
      });
      if (res.success) {
        alert(`✅ Test Complaint Created Successfully! Assigned to supervisor queue.`);
        setActiveTab('complaints');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting test complaint.');
    } finally {
      setSubmittingDemo(false);
    }
  };

  const handleQuickDemoReview = async (e) => {
    e.preventDefault();
    setSubmittingDemo(true);
    try {
      const orderIdToUse = demoOrder.orderId || (ordersList.length > 0 ? ordersList[0].orderId : 1);
      const res = await axiosClient.post('/customer/reviews', {
        orderId: Number(orderIdToUse),
        rating: Number(demoOrder.rating),
        comment: demoOrder.comment,
      });
      if (res.success) {
        alert(`✅ Test ${demoOrder.rating}-Star Review submitted successfully!`);
        setActiveTab('reviews');
        fetchInitialData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting test review.');
    } finally {
      setSubmittingDemo(false);
    }
  };

  // Filtered Complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesSearch =
      c.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Filtered Reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesStar = starFilter === 'ALL' || r.rating === Number(starFilter);
    const matchesSearch =
      r.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStar && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 🌟 Header & Branch Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-900 text-[10px] font-extrabold uppercase tracking-wide">
              Member 6 Module
            </span>
            <h1 className="text-2xl font-black text-stone-900">Complaint & Review Management</h1>
          </div>
          <p className="text-xs text-stone-600">
            CRUD operations for customer complaints, 1–5 star reviews, supervisor resolutions, and CSAT metrics.
          </p>
        </div>

        {/* Branch Filter & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-orange-600" /> Branch:
          </label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="ALL">All Restaurant Branches</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName}
              </option>
            ))}
          </select>

          <button
            onClick={fetchInitialData}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📊 Executive Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Overall Satisfaction</span>
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <p className="text-2xl font-black text-stone-900">{analytics.averageRating} / 5.0</p>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">From {analytics.totalReviews} verified reviews</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Pending Complaints</span>
            <p className="text-2xl font-black text-amber-600">{analytics.pendingComplaints}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Needs supervisor action</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Under Investigation</span>
            <p className="text-2xl font-black text-blue-600">{analytics.inProgressComplaints || 0}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">In Progress tickets</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Resolution Rate</span>
            <p className="text-2xl font-black text-emerald-600">{analytics.resolutionRate || 92}%</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              {analytics.resolvedComplaints} tickets resolved
            </span>
          </div>
        </div>
      )}

      {/* 🧭 Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <MessageSquareWarning className="w-4 h-4 text-rose-500" />
            Complaints Resolution Queue ({complaints.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Customer Reviews & Ratings ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Quality & CSAT Analytics
          </button>

          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'demo'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-orange-50 border border-orange-200 text-orange-800 hover:bg-orange-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            Viva Quick-Test & Create Tool
          </button>
        </div>

        {/* Search Bar */}
        {(activeTab === 'complaints' || activeTab === 'reviews') && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, customer, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 🚨 COMPLAINTS RESOLUTION QUEUE (READ, UPDATE, DELETE)              */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <div>
          {/* Sub Filters: Status & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-stone-50 p-3 rounded-2xl border border-stone-200">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 mr-1">Status:</span>
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500">Issue Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
              >
                <option value="ALL">All Categories</option>
                <option value="Wrong Food">Wrong Food</option>
                <option value="Missing Items">Missing Items</option>
                <option value="Late Delivery">Late Delivery</option>
                <option value="Poor Food Quality">Poor Food Quality</option>
                <option value="Damaged Packaging">Damaged Packaging</option>
                <option value="Rider Behavior">Rider Behavior</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-stone-400">Loading complaints queue...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-stone-700">No complaints found matching your filter.</p>
              <p className="text-xs text-stone-500 mt-1">Use the "Viva Quick-Test & Create Tool" tab to file a test complaint!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredComplaints.map((c) => (
                <div
                  key={c.complaintId}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-[10px] uppercase">
                            {c.category}
                          </span>
                          <span className="text-xs font-black text-stone-900">
                            Ref: {c.orderNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          Branch: <span className="font-semibold text-stone-800">{c.branchName}</span> • Total: LKR {Number(c.orderTotal || 0).toFixed(2)}
                        </p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>

                    {/* Customer Info */}
                    <div className="flex items-center justify-between text-xs text-stone-600 mb-3 bg-stone-50 px-3 py-2 rounded-xl">
                      <span className="font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" /> {c.customerName}
                      </span>
                      <span className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" /> {c.customerPhone || '0771234567'}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                        Customer Complaint Description:
                      </span>
                      <p className="text-xs text-stone-800 bg-rose-50/40 border border-rose-100 p-3 rounded-2xl leading-relaxed">
                        "{c.description}"
                      </p>
                    </div>

                    {/* Resolution / Rejection History Box */}
                    {c.resolutionNotes && (
                      <div
                        className={`p-3 rounded-2xl mb-4 text-xs border ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-stone-100 border-stone-200 text-stone-800'
                        }`}
                      >
                        <span className="font-bold block mb-1 flex items-center gap-1">
                          {c.status === 'RESOLVED' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolved Solution:
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-rose-600" /> Supervisor Note:
                            </>
                          )}
                        </span>
                        <p className="leading-relaxed">{c.resolutionNotes}</p>
                        <div className="flex justify-between text-[10px] text-stone-500 mt-2 pt-2 border-t border-stone-200/60">
                          <span>Action by: <strong>{c.resolvedByName || 'CS Supervisor'}</strong></span>
                          <span>{c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supervisor Actions Toolbar (UPDATE & DELETE) */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-400">
                        Filed: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteComplaint(c.complaintId)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Delete complaint ticket"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* State updates */}
                      {c.status !== 'IN_PROGRESS' && c.status !== 'RESOLVED' && c.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleUpdateStatus(c.complaintId, 'IN_PROGRESS')}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" /> In-Progress
                        </button>
                      )}

                      {c.status !== 'RESOLVED' && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setShowResolveModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5" /> Resolve & Close
                        </button>
                      )}

                      {c.status !== 'REJECTED' && c.status !== 'RESOLVED' && (
                        <button
                          onClick={() => {
                            setSelectedComplaint(c);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 font-bold rounded-xl text-xs transition-colors"
                        >
                          Reject
                        </button>
                      )}

                      {c.status === 'RESOLVED' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Closed (Resolved)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ⭐ CUSTOMER REVIEWS (READ, UPDATE, DELETE)                         */}
      {/* ========================================================================= */}
      {activeTab === 'reviews' && (
        <div>
          {/* Star Rating Filter Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-stone-500 mr-2">Filter Stars:</span>
            {['ALL', '5', '4', '3', '2', '1'].map((stars) => (
              <button
                key={stars}
                onClick={() => setStarFilter(stars)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  starFilter === stars
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {stars === 'ALL' ? (
                  'All Star Ratings'
                ) : (
                  <>
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 text-center text-stone-400">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              No reviews found matching this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReviews.map((r) => (
                <div
                  key={r.reviewId}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{r.customerName}</h4>
                        <span className="text-[10px] text-stone-400">{r.branchName || 'Spice Avenue'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-2xl mb-4 italic leading-relaxed">
                      "{r.comment || 'No written comment provided.'}"
                    </p>
                  </div>

                  {/* Actions for Review (UPDATE & DELETE) */}
                  <div className="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-100 pt-3">
                    <span>Order: <strong>{r.orderNumber}</strong></span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditReview(r)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-[10px] flex items-center gap-1"
                        title="Edit Review"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(r.reviewId)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 📊 QUALITY & CSAT ANALYTICS BREAKDOWN                             */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Star Distribution Chart Left (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-black text-stone-900 text-sm mb-4">Customer Star Rating Breakdown</h3>

            {[
              { stars: 5, count: analytics.fiveStarCount || 0, color: 'bg-emerald-500' },
              { stars: 4, count: analytics.fourStarCount || 0, color: 'bg-emerald-400' },
              { stars: 3, count: analytics.threeStarCount || 0, color: 'bg-amber-400' },
              { stars: 2, count: analytics.twoStarCount || 0, color: 'bg-orange-400' },
              { stars: 1, count: analytics.oneStarCount || 0, color: 'bg-rose-500' },
            ].map((item) => {
              const total = analytics.totalReviews || 1;
              const percentage = Math.round((item.count / total) * 100);

              return (
                <div key={item.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-stone-700 flex items-center gap-1">
                    {item.stars} <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  </span>
                  <div className="flex-1 bg-stone-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-right font-medium text-stone-500">
                    {item.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Complaints Performance Summary Right (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-black text-stone-900 text-sm">Complaint Resolution Performance</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <span className="text-stone-400 block mb-1">Total Issues Logged</span>
                <span className="text-xl font-black text-stone-900">{analytics.totalComplaints}</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-emerald-700 block mb-1">Successfully Resolved</span>
                <span className="text-xl font-black text-emerald-800">{analytics.resolvedComplaints}</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-amber-700 block mb-1">Pending Resolution</span>
                <span className="text-xl font-black text-amber-800">{analytics.pendingComplaints}</span>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-rose-700 block mb-1">Rejected Tickets</span>
                <span className="text-xl font-black text-rose-800">{analytics.rejectedComplaints || 0}</span>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-xs">
              <h4 className="font-bold text-purple-900 mb-1">Supervisor SLA Target:</h4>
              <p className="text-purple-700 leading-relaxed">
                Aim for 100% complaint resolution within 24 hours of customer submission.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 🧪 VIVA QUICK-TEST TOOL (CREATE OPERATIONS)                       */}
      {/* ========================================================================= */}
      {activeTab === 'demo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* File Test Complaint Box */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-stone-900 text-sm">Lodge New Complaint (CREATE)</h3>
                <p className="text-[11px] text-stone-500">Pick any order from database to create a complaint.</p>
              </div>
            </div>

            <form onSubmit={handleQuickDemoComplaint} className="space-y-3 text-xs mt-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Order</label>
                <select
                  value={demoOrder.orderId}
                  onChange={(e) => setDemoOrder({ ...demoOrder, orderId: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  {ordersList.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderNumber} - {o.branchName} (LKR {Number(o.totalAmount).toFixed(2)})
                    </option>
                  ))}
                  <option value="1">#ORD-20260301-1001 (Default Test Order 1)</option>
                  <option value="2">#ORD-20260301-1002 (Default Test Order 2)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Issue Category</label>
                <select
                  value={demoOrder.category}
                  onChange={(e) => setDemoOrder({ ...demoOrder, category: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="Late Delivery">Late Delivery (Rider took 50+ mins)</option>
                  <option value="Wrong Food">Wrong Food (Received Veg instead of Chicken)</option>
                  <option value="Missing Items">Missing Items (Drinks forgotten)</option>
                  <option value="Poor Food Quality">Poor Food Quality (Cold/Soggy)</option>
                  <option value="Damaged Packaging">Damaged Packaging (Spilled Sauce)</option>
                  <option value="Rider Behavior">Rider Behavior (Rude attitude)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Complaint Details</label>
                <textarea
                  rows={2}
                  required
                  value={demoOrder.description}
                  onChange={(e) => setDemoOrder({ ...demoOrder, description: e.target.value })}
                  placeholder="Describe what went wrong in detail..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={submittingDemo}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Submit Complaint (Create)
              </button>
            </form>
          </div>

          {/* Submit Test Review Box */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </span>
              <div>
                <h3 className="font-black text-stone-900 text-sm">Post New Star Review (CREATE)</h3>
                <p className="text-[11px] text-stone-500">Pick any order to post customer feedback and star ratings.</p>
              </div>
            </div>

            <form onSubmit={handleQuickDemoReview} className="space-y-3 text-xs mt-4">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Order</label>
                <select
                  value={demoOrder.orderId}
                  onChange={(e) => setDemoOrder({ ...demoOrder, orderId: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  {ordersList.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.orderNumber} - {o.branchName} (LKR {Number(o.totalAmount).toFixed(2)})
                    </option>
                  ))}
                  <option value="1">#ORD-20260301-1001 (Default Test Order 1)</option>
                  <option value="2">#ORD-20260301-1002 (Default Test Order 2)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Star Rating (1 to 5)</label>
                <select
                  value={demoOrder.rating}
                  onChange={(e) => setDemoOrder({ ...demoOrder, rating: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                  <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                  <option value="2">⭐⭐ 2 Stars - Disappointed</option>
                  <option value="1">⭐ 1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Customer Review Comment</label>
                <textarea
                  rows={2}
                  value={demoOrder.comment}
                  onChange={(e) => setDemoOrder({ ...demoOrder, comment: e.target.value })}
                  placeholder="e.g. Incredible spicy chicken pizza! Arrived piping hot."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={submittingDemo}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Star className="w-3.5 h-3.5 fill-current" /> Post Review (Create)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Resolve Complaint Modal                                         */}
      {/* ========================================================================= */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">Resolve & Close Ticket (UPDATE)</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Issue: <strong>{selectedComplaint.category}</strong> (Order: {selectedComplaint.orderNumber})
            </p>

            <form onSubmit={handleResolveComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Mandatory Resolution Notes / Solution Given to Customer:
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Apologized to customer, dispatched replacement meal and credited LKR 500 compensation voucher."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl leading-relaxed focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm & Resolve (Update)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Reject Complaint Modal                                          */}
      {/* ========================================================================= */}
      {showRejectModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">Reject Complaint (UPDATE)</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Issue: <strong>{selectedComplaint.category}</strong> (Order: {selectedComplaint.orderNumber})
            </p>

            <form onSubmit={handleRejectComplaint} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Reason for Rejection:
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Delivery GPS logs confirm order was successfully delivered on time."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl leading-relaxed focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Edit Review Modal (UPDATE)                                      */}
      {/* ========================================================================= */}
      {showEditReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-stone-900">Edit Customer Review (UPDATE)</h3>
              <button onClick={() => setShowEditReviewModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mb-4">Order Ref: <strong>{selectedReview.orderNumber}</strong></p>

            <form onSubmit={handleSaveEditReview} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Star Rating (1 to 5)</label>
                <select
                  value={editReviewData.rating}
                  onChange={(e) => setEditReviewData({ ...editReviewData, rating: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Outstanding</option>
                  <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                  <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                  <option value="2">⭐⭐ 2 Stars - Disappointed</option>
                  <option value="1">⭐ 1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Review Comment</label>
                <textarea
                  rows={3}
                  required
                  value={editReviewData.comment}
                  onChange={(e) => setEditReviewData({ ...editReviewData, comment: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditReviewModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Changes (Update)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
