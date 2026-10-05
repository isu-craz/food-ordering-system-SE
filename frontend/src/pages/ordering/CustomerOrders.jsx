import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import {
  Package,
  Clock,
  Star,
  MessageSquareWarning,
  Ban,
  CheckCircle2,
  ChevronRight,
  X,
  RefreshCw,
  PlusCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
  Building2,
  Edit3,
  Trash2,
  ThumbsUp,
  Sparkles,
  Send,
  MessageSquare,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'orders' | 'complaints' | 'reviews'
  const [activeTab, setActiveTab] = useState('orders');

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showEditReviewModal, setShowEditReviewModal] = useState(false);

  // Selected Data
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  // Forms
  const [reviewForm, setReviewForm] = useState({ orderId: '', rating: 5, comment: '' });
  const [complaintForm, setComplaintForm] = useState({
    orderId: '',
    category: 'Late Delivery',
    description: '',
    imageUrl: '',
  });
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ordersRes, compRes, revRes] = await Promise.allSettled([
        axiosClient.get('/customer/orders'),
        axiosClient.get('/customer/my-complaints'),
        axiosClient.get('/customer/my-reviews'),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setOrders(ordersRes.value.data);
      }
      if (compRes.status === 'fulfilled' && compRes.value?.data) {
        setComplaints(compRes.value.data);
      }
      if (revRes.status === 'fulfilled' && revRes.value?.data) {
        setReviews(revRes.value.data);
      }
    } catch (err) {
      console.error('Error loading customer feedback data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal from specific order card
  const handleOpenComplaintForOrder = (order) => {
    setSelectedOrder(order);
    setComplaintForm({
      orderId: order.orderId,
      category: 'Late Delivery',
      description: '',
      imageUrl: '',
    });
    setShowComplaintModal(true);
  };

  const handleOpenReviewForOrder = (order) => {
    setSelectedOrder(order);
    setReviewForm({
      orderId: order.orderId,
      rating: 5,
      comment: '',
    });
    setShowReviewModal(true);
  };

  // Open modal globally (user picks order from dropdown)
  const handleOpenGlobalComplaint = () => {
    const defaultOrderId = orders.length > 0 ? orders[0].orderId : '';
    setComplaintForm({
      orderId: defaultOrderId,
      category: 'Late Delivery',
      description: '',
      imageUrl: '',
    });
    setSelectedOrder(orders.find((o) => o.orderId === defaultOrderId) || null);
    setShowComplaintModal(true);
  };

  const handleOpenGlobalReview = () => {
    const defaultOrderId = orders.length > 0 ? orders[0].orderId : '';
    setReviewForm({
      orderId: defaultOrderId,
      rating: 5,
      comment: '',
    });
    setSelectedOrder(orders.find((o) => o.orderId === defaultOrderId) || null);
    setShowReviewModal(true);
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.orderId) {
      alert('Please select an order to report an issue for.');
      return;
    }
    if (!complaintForm.description.trim()) {
      alert('Please enter a description for your complaint.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosClient.post('/customer/complaints', {
        orderId: Number(complaintForm.orderId),
        category: complaintForm.category,
        description: complaintForm.description,
        imageUrl: complaintForm.imageUrl || null,
      });

      if (res.success) {
        alert('Your complaint ticket has been submitted to Customer Support! Status: PENDING');
        setShowComplaintModal(false);
        setComplaintForm({ orderId: '', category: 'Late Delivery', description: '', imageUrl: '' });
        fetchAllData();
        setActiveTab('complaints'); // Switch to complaints tab to show customer the live ticket
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.orderId) {
      alert('Please select an order to review.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await axiosClient.post('/customer/reviews', {
        orderId: Number(reviewForm.orderId),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      if (res.success) {
        alert('Thank you! Your rating and review has been submitted successfully.');
        setShowReviewModal(false);
        setReviewForm({ orderId: '', rating: 5, comment: '' });
        fetchAllData();
        setActiveTab('reviews'); // Switch to reviews tab
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Review
  const handleOpenEditReview = (review) => {
    setSelectedReview(review);
    setEditReviewForm({ rating: review.rating, comment: review.comment || '' });
    setShowEditReviewModal(true);
  };

  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    try {
      setSubmitting(true);
      const res = await axiosClient.put(`/customer/reviews/${selectedReview.reviewId}`, {
        rating: Number(editReviewForm.rating),
        comment: editReviewForm.comment,
      });
      if (res.success) {
        alert('Your review has been updated!');
        setShowEditReviewModal(false);
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating review');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await axiosClient.delete(`/customer/reviews/${reviewId}`);
      if (res.success) {
        alert('Review deleted.');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting review');
    }
  };

  // Cancel Order
  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;
    try {
      const res = await axiosClient.patch(`/customer/orders/${orderId}/cancel`, {
        cancellationReason: reason,
      });
      if (res.success) {
        alert('Order has been cancelled.');
        fetchAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel this order.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[11px] font-black uppercase tracking-wider border border-orange-500/30">
                Customer Portal • Member 6 Feedback
              </span>
              <span className="text-stone-400 text-xs font-semibold">Welcome, {user?.fullName || 'Customer'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              My Orders, Reviews & Complaints
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
              Track past meals, submit service complaints, rate food quality (1–5 stars), and monitor customer support resolution statuses in real-time.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenGlobalComplaint}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
            >
              <MessageSquareWarning className="w-4 h-4" /> Lodge Complaint
            </button>
            <button
              onClick={handleOpenGlobalReview}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/30 flex items-center gap-1.5 transition-all"
            >
              <Star className="w-4 h-4 fill-stone-950 text-stone-950" /> Rate & Review
            </button>
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700/60 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'orders' ? 'bg-orange-800/50 text-white' : 'bg-stone-100 text-stone-700'
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'complaints'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <MessageSquareWarning className="w-4 h-4" />
          <span>My Complaints & Tickets (M6)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'complaints' ? 'bg-rose-800/50 text-white' : 'bg-rose-50 text-rose-700'
          }`}>
            {complaints.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Star className="w-4 h-4 fill-current" />
          <span>My Reviews & Ratings (M6)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'reviews' ? 'bg-amber-600/50 text-stone-950' : 'bg-amber-50 text-amber-800'
          }`}>
            {reviews.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="py-20 text-center text-stone-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-bold text-stone-600">No orders found.</p>
              <p className="text-xs text-stone-400 mt-1">Place an order from the food menu to track it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED';

                return (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900 text-sm">#{order.orderNumber}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 font-bold text-stone-700">
                            {order.orderType}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">ID: {order.orderId}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          Branch: <span className="font-semibold text-stone-800">{order.branchName}</span> • Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.orderItemId} className="flex justify-between text-xs text-stone-700">
                          <span>
                            <span className="font-bold text-stone-900">{item.quantity}x</span> {item.itemName}{' '}
                            {item.variationName && <span className="text-stone-400">({item.variationName})</span>}
                          </span>
                          <span className="font-semibold text-stone-900">LKR {Number(item.totalPrice).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bill Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 text-xs">
                      <div>
                        <span className="text-stone-500">Paid via: </span>
                        <span className="font-bold text-stone-800">{order.paymentMethod}</span>
                        {order.estimatedPrepMinutes && (
                          <span className="ml-3 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                            Est Prep: ~{order.estimatedPrepMinutes} mins
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-stone-500 mr-2">Total Amount:</span>
                        <span className="text-base font-black text-orange-600">
                          LKR {Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Post-Order Feedback Actions */}
                    <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
                      {isCancellable && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Cancel Order
                        </button>
                      )}

                      {/* Always enable Rate & Review and Lodge Complaint for Viva demonstration */}
                      <button
                        onClick={() => handleOpenReviewForOrder(order)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate & Review (M6)
                      </button>

                      <button
                        onClick={() => handleOpenComplaintForOrder(order)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600" /> Lodge Complaint (M6)
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY COMPLAINTS & TICKETS */}
      {activeTab === 'complaints' && (
        <div>
          {complaints.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              <MessageSquareWarning className="w-12 h-12 text-rose-300 mx-auto mb-3" />
              <p className="font-bold text-stone-700 text-base">No complaints submitted yet</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">If you had an issue with an order, lodge a complaint and our CS Supervisor will resolve it.</p>
              <button
                onClick={handleOpenGlobalComplaint}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Lodge First Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((comp) => {
                const isResolved = comp.status === 'RESOLVED';
                const isRejected = comp.status === 'REJECTED';
                const isInProgress = comp.status === 'IN_PROGRESS';

                return (
                  <div
                    key={comp.complaintId}
                    className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                      isResolved
                        ? 'border-emerald-200 bg-emerald-50/10'
                        : isRejected
                        ? 'border-red-200 bg-red-50/10'
                        : isInProgress
                        ? 'border-blue-200 bg-blue-50/10'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-extrabold text-xs">
                            {comp.category}
                          </span>
                          <span className="font-bold text-stone-800 text-xs">Order #{comp.orderNumber || comp.orderId}</span>
                          <span className="text-[11px] text-stone-400 font-mono">Ticket #{comp.complaintId}</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Branch: <span className="font-semibold text-stone-700">{comp.branchName || 'Main'}</span> • Submitted on {new Date(comp.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black tracking-wide inline-flex items-center gap-1.5 ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRejected
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isResolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {isInProgress && <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />}
                          {isRejected && <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
                          Status: {comp.status}
                        </span>
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 mb-3 text-xs text-stone-800 leading-relaxed">
                      <p className="font-bold text-stone-500 uppercase text-[10px] mb-1">Customer Statement:</p>
                      {comp.description}
                    </div>

                    {/* Supervisor Resolution Box */}
                    {comp.resolutionNotes && (
                      <div className={`rounded-2xl p-4 border text-xs ${
                        isResolved
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-red-50 border-red-200 text-red-950'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <ShieldCheck className={`w-4 h-4 ${isResolved ? 'text-emerald-600' : 'text-red-600'}`} />
                          <span>
                            {isResolved ? 'Supervisor Resolution & Compensation' : 'Supervisor Review Result'}:
                          </span>
                        </div>
                        <p className="text-stone-800 font-medium whitespace-pre-wrap">{comp.resolutionNotes}</p>
                        {comp.resolvedAt && (
                          <p className="text-[10px] text-stone-500 mt-2 font-mono">
                            Closed by: <span className="font-bold">{comp.resolvedByName || 'CS Supervisor'}</span> on {new Date(comp.resolvedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY REVIEWS & RATINGS */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              <Star className="w-12 h-12 text-amber-300 mx-auto mb-3" />
              <p className="font-bold text-stone-700 text-base">No reviews given yet</p>
              <p className="text-xs text-stone-400 mt-1 mb-4">Share your feedback and star rating on food quality & delivery.</p>
              <button
                onClick={handleOpenGlobalReview}
                className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
              >
                Submit First Review
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.reviewId}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                      <div>
                        <span className="font-bold text-stone-900 text-xs">Order #{rev.orderNumber || rev.orderId}</span>
                        <p className="text-[11px] text-stone-500">{rev.branchName || 'Spice Avenue'}</p>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
                            }`}
                          />
                        ))}
                        <span className="font-black text-amber-900 text-xs ml-1">{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-800 leading-relaxed italic bg-stone-50 p-3 rounded-2xl border border-stone-100 mb-4">
                      "{rev.comment || 'No comment provided'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-400">
                    <span className="text-[10px]">{new Date(rev.reviewDate).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditReview(rev)}
                        className="p-1.5 text-stone-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Review"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.reviewId)}
                        className="p-1.5 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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

      {/* MODAL 1: LODGE COMPLAINT */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <MessageSquareWarning className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Lodge Customer Complaint</h3>
                  <p className="text-[11px] text-stone-500">Member 6 • Support Ticket</p>
                </div>
              </div>
              <button
                onClick={() => setShowComplaintModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
              {/* Select Order */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Order</label>
                <select
                  value={complaintForm.orderId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, orderId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  required
                >
                  <option value="">-- Choose an Order --</option>
                  {orders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      Order #{o.orderNumber || o.orderId} ({o.branchName}) - LKR {Number(o.totalAmount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Issue Category</label>
                <select
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  required
                >
                  <option value="Late Delivery">Late Delivery (Delayed Meal)</option>
                  <option value="Wrong Food">Wrong Food Item Received</option>
                  <option value="Missing Items">Missing Items in Package</option>
                  <option value="Poor Food Quality">Poor Food Quality / Cold</option>
                  <option value="Damaged Packaging">Damaged / Leaking Packaging</option>
                  <option value="Rider Behavior">Rider Behavior / Delivery Conduct</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Explain the Issue in Detail</label>
                <textarea
                  required
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  rows={3}
                  placeholder="e.g. The pizza was delivered over 40 minutes late and arrived completely cold..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Optional Photo URL */}
              <div>
                <label className="font-semibold text-stone-500 block mb-1">Optional Photo URL Proof</label>
                <input
                  type="url"
                  value={complaintForm.imageUrl}
                  onChange={(e) => setComplaintForm({ ...complaintForm, imageUrl: e.target.value })}
                  placeholder="https://example.com/photo-proof.jpg"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Complaint Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT REVIEW */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Rate & Review Order</h3>
                  <p className="text-[11px] text-stone-500">Member 6 • Customer Feedback</p>
                </div>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              {/* Select Order */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Order</label>
                <select
                  value={reviewForm.orderId}
                  onChange={(e) => setReviewForm({ ...reviewForm, orderId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900"
                  required
                >
                  <option value="">-- Choose an Order --</option>
                  {orders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      Order #{o.orderNumber || o.orderId} ({o.branchName}) - LKR {Number(o.totalAmount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Rating Score (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewForm.rating
                            ? 'fill-amber-500 text-amber-500 drop-shadow-sm'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-black text-amber-900 ml-2 text-sm">
                    {reviewForm.rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Review / Comments</label>
                <textarea
                  required
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  placeholder="Tell us about the taste, seasoning, freshness, and packaging..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT REVIEW */}
      {showEditReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="text-sm font-bold text-stone-900">Edit Your Review</h3>
              <button
                onClick={() => setShowEditReviewModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReview} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editReviewForm.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-black text-amber-900 ml-2">{editReviewForm.rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Comment</label>
                <textarea
                  required
                  value={editReviewForm.comment}
                  onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEditReviewModal(false)}
                  className="px-3 py-2 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold"
                >
                  {submitting ? 'Saving...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
