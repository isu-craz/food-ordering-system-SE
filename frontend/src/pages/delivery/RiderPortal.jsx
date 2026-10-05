import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import StatusBadge from '../../components/StatusBadge';
import {
  CheckCircle2,
  Navigation,
  Phone,
  MapPin,
  Check,
  RefreshCw,
  Eye,
  X,
  Clock,
  Package,
  Bike,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RiderPortal() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [riderStatus, setRiderStatus] = useState(
    user?.riderStatus || 'AVAILABLE'
  );

  const [loading, setLoading] = useState(true);

  // Main navigation
  const [activeSection, setActiveSection] = useState('assigned');

  // Selected delivery for View Details
  const [selectedDelivery, setSelectedDelivery] = useState(null);


  // =========================================================
  // LOAD RIDER DATA
  // =========================================================

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    try {
      setLoading(true);

      const [tasksRes, histRes, profileRes] = await Promise.all([
        axiosClient.get('/delivery/my-tasks'),
        axiosClient.get('/delivery/my-history'),
        axiosClient.get('/auth/profile'),
      ]);

      if (tasksRes.success) {
        setTasks(tasksRes.data || []);
      }

      if (histRes.success) {
        setHistory(histRes.data || []);
      }

      if (profileRes.success && profileRes.data?.riderStatus) {
        setRiderStatus(profileRes.data.riderStatus);
      }
    } catch (err) {
      console.error('Error loading rider data:', err);
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // UPDATE AVAILABILITY
  // =========================================================

  const handleUpdateAvailability = async (status) => {
    try {
      await axiosClient.patch('/delivery/riders/my-status', {
        status,
      });

      setRiderStatus(status);

      alert(`Rider availability changed to ${status}.`);

      await fetchRiderData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Error updating rider availability'
      );
    }
  };


  // =========================================================
  // ACCEPT DELIVERY
  // =========================================================

  const handleAcceptTask = async (deliveryId) => {
    try {
      await axiosClient.patch(
        `/delivery/tasks/${deliveryId}/accept`
      );

      alert(
        'Delivery accepted! Rider status is now BUSY.'
      );

      await fetchRiderData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Error accepting delivery'
      );
    }
  };


  // =========================================================
  // OUT FOR DELIVERY
  // =========================================================

  const handleOutForDelivery = async (deliveryId) => {
    try {
      await axiosClient.patch(
        `/delivery/tasks/${deliveryId}/out-for-delivery`
      );

      alert(
        'Delivery status updated to OUT FOR DELIVERY.'
      );

      await fetchRiderData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Error updating delivery status'
      );
    }
  };


  // =========================================================
  // MARK DELIVERED
  // =========================================================

  const handleDelivered = async (deliveryId) => {
    const confirmed = window.confirm(
      'Confirm that the order has been handed over to the customer?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.patch(
        `/delivery/tasks/${deliveryId}/delivered`
      );

      alert(
        'Order DELIVERED! Rider status has been reset to AVAILABLE.'
      );

      await fetchRiderData();

      setActiveSection('history');
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Error marking delivery as completed'
      );
    }
  };


  // =========================================================
  // DELETE / CANCEL DELIVERY
  // =========================================================

  const handleDeleteDelivery = async (deliveryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this delivery?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(
        `/delivery/tasks/${deliveryId}`
      );

      alert(
        'Delivery cancelled successfully.'
      );

      await fetchRiderData();

    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Error cancelling delivery'
      );
    }
  };


  // =========================================================
  // STATUS DISPLAY
  // =========================================================

  const getStatusClasses = (status) => {
    if (status === 'AVAILABLE') {
      return 'bg-emerald-600 text-white';
    }

    if (status === 'BUSY') {
      return 'bg-amber-600 text-white';
    }

    return 'bg-rose-600 text-white';
  };


  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-extrabold uppercase">
          Member 5 Module
        </span>

        <h1 className="text-3xl font-black text-stone-900 mt-2">
          Delivery Rider Portal
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          Manage availability, assigned deliveries and delivery history.
        </p>
      </div>


      {/* =====================================================
          MY AVAILABILITY
      ====================================================== */}

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 mb-6">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bike className="w-5 h-5 text-orange-600" />

              <h2 className="text-lg font-black text-stone-900">
                My Availability
              </h2>
            </div>

            <p className="text-xs text-stone-500">
              Set your current rider availability.
            </p>
          </div>


          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl">

            {['AVAILABLE', 'BUSY', 'OFFLINE'].map((status) => (

              <button
                key={status}
                onClick={() =>
                  handleUpdateAvailability(status)
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  riderStatus === status
                    ? getStatusClasses(status)
                    : 'text-stone-600 hover:bg-white'
                }`}
              >
                {status}
              </button>

            ))}

          </div>

        </div>


        {/* Current Status */}

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">

          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">
              Current Status
            </p>

            <p className="text-sm font-black text-stone-900 mt-1">
              {riderStatus}
            </p>
          </div>

          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getStatusClasses(
              riderStatus
            )}`}
          >
            {riderStatus}
          </span>

        </div>

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex flex-col sm:flex-row gap-2 mb-6">

        <button
          onClick={() => setActiveSection('assigned')}
          className={`flex-1 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
            activeSection === 'assigned'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Assigned Deliveries ({tasks.length})
        </button>


        <button
          onClick={() => setActiveSection('history')}
          className={`flex-1 px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
            activeSection === 'history'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Delivery History ({history.length})
        </button>


        <button
          onClick={fetchRiderData}
          className="px-4 py-3 bg-white border border-stone-200 hover:bg-stone-50 rounded-2xl text-stone-700"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="bg-white rounded-3xl border border-stone-200 py-20 text-center">

          <RefreshCw className="w-6 h-6 mx-auto mb-3 animate-spin text-stone-400" />

          <p className="text-sm text-stone-400">
            Loading delivery information...
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              ASSIGNED DELIVERIES
          ================================================== */}

          {activeSection === 'assigned' && (

            <section>

              <div className="mb-4">
                <h2 className="text-xl font-black text-stone-900">
                  Assigned Deliveries
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  Deliveries currently assigned to you.
                </p>
              </div>


              {tasks.length === 0 ? (

                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">

                  <Package className="w-10 h-10 mx-auto mb-3 text-stone-300" />

                  <h3 className="font-bold text-stone-700">
                    No Assigned Deliveries
                  </h3>

                  <p className="text-xs text-stone-400 mt-1">
                    You currently have no active deliveries assigned to you.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {tasks.map((task) => (

                    <div
                      key={task.deliveryId}
                      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all"
                    >

                      {/* Delivery Header */}

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 pb-4 border-b border-stone-100">

                        <div>

                          <p className="text-xs font-bold text-orange-600">
                            {task.branchName}
                          </p>

                          <h3 className="text-lg font-black text-stone-900 mt-1">
                            {task.orderNumber}
                          </h3>

                        </div>

                        <StatusBadge
                          status={task.deliveryStatus}
                        />

                      </div>


                      {/* Delivery Information */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

                        {/* Customer */}

                        <div className="bg-stone-50 rounded-2xl p-4">

                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                            Customer Name
                          </p>

                          <p className="text-sm font-black text-stone-900">
                            {task.customerName}
                          </p>

                        </div>


                        {/* Order Status */}

                        <div className="bg-stone-50 rounded-2xl p-4">

                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                            Delivery Status
                          </p>

                          <p className="text-sm font-black text-stone-900">
                            {task.deliveryStatus}
                          </p>

                        </div>


                        {/* Branch */}

                        <div className="bg-stone-50 rounded-2xl p-4">

                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                            Branch
                          </p>

                          <p className="text-sm font-black text-stone-900">
                            {task.branchName}
                          </p>

                        </div>


                        {/* Delivery Area */}

                        <div className="bg-stone-50 rounded-2xl p-4">

                          <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                            Delivery Area
                          </p>

                          <p className="text-sm font-black text-stone-900">
                            {task.deliveryArea ||
                              task.area ||
                              'Not specified'}
                          </p>

                        </div>

                      </div>


                      {/* Address */}

                      <div className="bg-stone-50 rounded-2xl p-4 mb-5">

                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-2 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          Delivery Address
                        </p>

                        <p className="text-sm font-bold text-stone-900">
                          {task.deliveryAddress ||
                            'Address not available'}
                        </p>

                      </div>


                      {/* Customer Contact */}

                      <div className="bg-stone-50 rounded-2xl p-4 mb-5">

                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-2 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Customer Contact
                        </p>

                        <p className="text-sm font-bold text-stone-900">
                          {task.customerPhone ||
                            'Phone not available'}
                        </p>

                      </div>


                      {/* Action Buttons */}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-100">

                        {/* View Details */}

                        <button
                          onClick={() =>
                            setSelectedDelivery(task)
                          }
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>


                        <div className="flex flex-col sm:flex-row gap-2">

                          {/* Accept + DELETE */}

                          {task.deliveryStatus === 'ASSIGNED' && (

                            <>
                              <button
                                onClick={() =>
                                  handleAcceptTask(
                                    task.deliveryId
                                  )
                                }
                                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Check className="w-4 h-4" />
                                Accept Delivery
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteDelivery(
                                    task.deliveryId
                                  )
                                }
                                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Cancel Delivery
                              </button>
                            </>

                          )}


                          {/* Out for Delivery */}

                          {task.deliveryStatus === 'ACCEPTED' && (

                            <button
                              onClick={() =>
                                handleOutForDelivery(
                                  task.deliveryId
                                )
                              }
                              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Navigation className="w-4 h-4" />
                              Out for Delivery
                            </button>

                          )}


                          {/* Delivered */}

                          {task.deliveryStatus ===
                            'OUT_FOR_DELIVERY' && (

                            <button
                              onClick={() =>
                                handleDelivered(
                                  task.deliveryId
                                )
                              }
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Confirm Delivered
                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}


          {/* =================================================
              DELIVERY HISTORY
          ================================================== */}

          {activeSection === 'history' && (

            <section>

              <div className="mb-4">

                <h2 className="text-xl font-black text-stone-900">
                  Delivery History
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  Your completed delivery records.
                </p>

              </div>


              {history.length === 0 ? (

                <div className="bg-white p-12 text-center rounded-3xl border border-stone-200">

                  <Clock className="w-10 h-10 mx-auto mb-3 text-stone-300" />

                  <h3 className="font-bold text-stone-700">
                    No Delivery History
                  </h3>

                  <p className="text-xs text-stone-400 mt-1">
                    Completed deliveries will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {history.map((item) => (

                    <div
                      key={item.deliveryId}
                      className="bg-white rounded-2xl border border-stone-200 p-5"
                    >

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-2">

                            <span className="font-black text-stone-900">
                              {item.orderNumber}
                            </span>

                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              DELIVERED
                            </span>

                          </div>

                          <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {item.deliveryAddress ||
                              'Address not available'}
                          </p>

                          {item.customerName && (

                            <p className="text-xs text-stone-600 mt-1">
                              Customer: {item.customerName}
                            </p>

                          )}

                        </div>


                        <div className="text-left md:text-right">

                          <p className="text-[10px] uppercase font-bold text-stone-400">
                            Delivered At
                          </p>

                          <p className="text-xs font-bold text-stone-700 mt-1">

                            {item.deliveredAt
                              ? new Date(
                                  item.deliveredAt
                                ).toLocaleString()
                              : 'Not available'}

                          </p>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          )}

        </>

      )}


      {/* =====================================================
          VIEW DETAILS MODAL
      ====================================================== */}

      {selectedDelivery && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedDelivery(null)}
          />


          {/* Modal */}

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="flex items-start justify-between gap-4 mb-5">

              <div>

                <p className="text-xs font-bold text-orange-600">
                  {selectedDelivery.branchName}
                </p>

                <h2 className="text-xl font-black text-stone-900 mt-1">
                  {selectedDelivery.orderNumber}
                </h2>

              </div>


              <button
                onClick={() => setSelectedDelivery(null)}
                className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>

            </div>


            {/* Status */}

            <div className="mb-5">

              <p className="text-[10px] uppercase font-bold text-stone-400 mb-2">
                Delivery Status
              </p>

              <StatusBadge
                status={
                  selectedDelivery.deliveryStatus
                }
              />

            </div>


            {/* Details */}

            <div className="space-y-3">

              <div className="bg-stone-50 rounded-2xl p-4">

                <p className="text-[10px] uppercase font-bold text-stone-400">
                  Customer Name
                </p>

                <p className="text-sm font-black text-stone-900 mt-1">
                  {selectedDelivery.customerName ||
                    'Not available'}
                </p>

              </div>


              <div className="bg-stone-50 rounded-2xl p-4">

                <p className="text-[10px] uppercase font-bold text-stone-400">
                  Customer Phone
                </p>

                <p className="text-sm font-black text-stone-900 mt-1">
                  {selectedDelivery.customerPhone ||
                    'Not available'}
                </p>

              </div>


              <div className="bg-stone-50 rounded-2xl p-4">

                <p className="text-[10px] uppercase font-bold text-stone-400">
                  Branch
                </p>

                <p className="text-sm font-black text-stone-900 mt-1">
                  {selectedDelivery.branchName ||
                    'Not available'}
                </p>

              </div>


              <div className="bg-stone-50 rounded-2xl p-4">

                <p className="text-[10px] uppercase font-bold text-stone-400">
                  Delivery Area
                </p>

                <p className="text-sm font-black text-stone-900 mt-1">
                  {selectedDelivery.deliveryArea ||
                    selectedDelivery.area ||
                    'Not specified'}
                </p>

              </div>


              <div className="bg-stone-50 rounded-2xl p-4">

                <p className="text-[10px] uppercase font-bold text-stone-400">
                  Delivery Address
                </p>

                <p className="text-sm font-black text-stone-900 mt-1">
                  {selectedDelivery.deliveryAddress ||
                    'Not available'}
                </p>

              </div>

            </div>


            {/* Close */}

            <button
              onClick={() => setSelectedDelivery(null)}
              className="w-full mt-5 py-3 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl text-sm"
            >
              Close Details
            </button>

          </div>

        </div>

      )}

    </div>
  );
}