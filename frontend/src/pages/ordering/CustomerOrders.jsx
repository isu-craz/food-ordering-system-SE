import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import { Package, Clock, Star, MessageSquareWarning, Ban, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Review & Complaint modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [complaintData, setComplaintData] = useState({ category: 'Wrong Food', description: '', imageUrl: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/customer/orders');
      console.log('Fetch orders response:', res); // 🔍 DEBUG - check console

      if (res?.success) {
        setOrders(res.data || []);
        if ((res.data || []).length === 0) {
          console.warn('No orders returned for this customer. Check if the order was actually created against your logged-in account.');
        }
      } else {
        console.warn('fetchOrders: success=false ->', res?.message);
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (!reason) return;
    try {
      const res = await axiosClient.patch(`/customer/orders/${orderId}/cancel`, {
        cancellationReason: reason,
      });
      console.log('Cancel order response:', res); // 🔍 DEBUG

      if (res?.success || res?.status === 200 || res) {
        alert('Order has been cancelled.');
        fetchOrders();
      } else {
        alert(res?.message || 'Could not cancel this order.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.message || 'Cannot cancel this order.');
    }
  };
  const handleUpdateAddress = async (orderId) => {
    const houseNumber = prompt('Enter House / Apartment Number (e.g. No. 45/A):');
    if (!houseNumber) return;

    const street = prompt('Enter Street Name (e.g. Main Street):');
    if (!street) return;

    const city = prompt('Enter City (e.g. Colombo):');
    if (!city) return;

    try {
      const payload = {
        label: 'Home',
        houseNumber: houseNumber,
        street: street,
        areaId: 1,
        isDefault: false
      };

      const addressRes = await axiosClient.post('/customer/addresses', payload);


      const resData = addressRes?.data || addressRes;
      const newAddressId = resData?.addressId || resData?.id || resData?.data?.addressId || resData?.data?.id;

      if (!newAddressId) {
        alert('Failed to save the new address record.');
        return;
      }

      const res = await axiosClient.patch(`/customer/orders/${orderId}/address?newAddressId=${newAddressId}`);

      if (res?.data?.success || res?.status === 200 || res) {
        alert('Delivery address updated successfully!');
        fetchOrders();
      } else {
        alert(res?.data?.message || 'Could not update address.');
      }
    } catch (err) {
      console.error('Update address error:', err?.response?.data || err);
      alert(err?.response?.data?.message || 'Cannot update address.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await axiosClient.post('/customer/reviews', {
        orderId: selectedOrder.orderId,
        rating: Number(reviewData.rating),
        comment: reviewData.comment,
      });
      if (res?.success) {
        alert('Thank you! Your review was submitted successfully.');
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
      } else {
        alert(res?.message || 'Error submitting review');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting review');
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await axiosClient.post('/customer/complaints', {
        orderId: selectedOrder.orderId,
        category: complaintData.category,
        description: complaintData.description,
        imageUrl: complaintData.imageUrl,
      });
      if (res?.success) {
        alert('Your complaint has been lodged and assigned to Customer Support (PENDING).');
        setShowComplaintModal(false);
        setComplaintData({ category: 'Wrong Food', description: '', imageUrl: '' });
      } else {
        alert(res?.message || 'Error submitting complaint');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting complaint');
    }
  };

  return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase mb-1 inline-block">
          Member 3 & Member 6 Integration
        </span>
          <h1 className="text-2xl font-black text-stone-900">My Orders & Service Feedback</h1>
          <p className="text-xs text-stone-500">Track active deliveries, cancel eligible orders, and leave reviews or support tickets.</p>
        </div>

        {loading ? (
            <div className="py-20 text-center text-stone-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
            <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
              You haven't placed any orders yet.
            </div>
        ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                // Case-insensitive status check - protects against 'Pending' / 'pending' / 'PENDING' mismatches
                const statusNormalized = String(order.status || '').toUpperCase();
                const isCompleted = statusNormalized === 'DELIVERED' || statusNormalized === 'PICKED_UP';
                const isCancellable = statusNormalized === 'PENDING' || statusNormalized === 'CONFIRMED';

                return (
                    <div
                        key={order.orderId}
                        className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900 text-sm">{order.orderNumber}</span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 font-bold text-stone-700">
                        {order.orderType}
                      </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
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

                      {/* Post-Order Actions: Cancellation, Reviews, Complaints */}
                      <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
                        {statusNormalized === 'PENDING' && (() => {
                          const orderTime = order.createdAt ? new Date(order.createdAt).getTime() : 0;
                          const now = new Date().getTime();
                          const diffInMins = orderTime > 0 ? (now - orderTime) / (1000 * 60) : 0;

                          if (!order.createdAt || isNaN(diffInMins) || diffInMins <= 15) {
                            return (
                                <button
                                    onClick={() => handleUpdateAddress(order.orderId)}
                                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1"
                                >
                                  ✏️ Edit Address (15 Mins)
                                </button>
                            );
                          }
                          return null;
                        })()}
                        {/* 2. Cancel Order Button*/}
                        {isCancellable && (
                            <button
                                onClick={() => handleCancelOrder(order.orderId)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancel Order
                            </button>
                        )}

                        {isCompleted && (
                            <>
                              <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowReviewModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold rounded-xl text-xs flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Rate & Review (M6)
                              </button>
                              <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setShowComplaintModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold rounded-xl text-xs flex items-center gap-1"
                              >
                                <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600" /> Report Issue (M6)
                              </button>
                            </>
                        )}
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* Review Modal (Member 6) */}
        {showReviewModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
                <h3 className="text-base font-bold text-stone-900 mb-1">Rate Completed Order</h3>
                <p className="text-xs text-stone-500 mb-4">Ref: {selectedOrder.orderNumber}</p>
                <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Rating (1 to 5 Stars)</label>
                    <select
                        value={reviewData.rating}
                        onChange={(e) => setReviewData({ ...reviewData, rating: Number(e.target.value) })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional</option>
                      <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                      <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                      <option value="2">⭐⭐ 2 Stars - Below Expectations</option>
                      <option value="1">⭐ 1 Star - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Comments / Experience</label>
                    <textarea
                        required
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        rows={3}
                        placeholder="How was the taste, packaging, and temperature?"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowReviewModal(false)}
                        className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Complaint Modal (Member 6) */}
        {showComplaintModal && selectedOrder && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
                <h3 className="text-base font-bold text-stone-900 mb-1">Lodge Customer Complaint</h3>
                <p className="text-xs text-stone-500 mb-4">Ref: {selectedOrder.orderNumber}</p>
                <form onSubmit={handleSubmitComplaint} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Issue Category</label>
                    <select
                        value={complaintData.category}
                        onChange={(e) => setComplaintData({ ...complaintData, category: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    >
                      <option value="Wrong Food">Wrong Food Item Received</option>
                      <option value="Missing Items">Missing Items in Package</option>
                      <option value="Poor Food Quality">Poor Food Quality / Cold</option>
                      <option value="Late Delivery">Excessive Delivery Delay</option>
                      <option value="Damaged Packaging">Damaged / Leaking Packaging</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Issue Description</label>
                    <textarea
                        required
                        value={complaintData.description}
                        onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                        rows={3}
                        placeholder="Describe what went wrong in detail..."
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setShowComplaintModal(false)}
                        className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold"
                    >
                      Submit Complaint
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}