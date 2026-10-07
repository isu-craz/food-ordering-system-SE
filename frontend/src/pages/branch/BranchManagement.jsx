import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { mockBranches, mockUsersList } from '../../api/mockData';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import {
  MapPin, Plus, Edit2, ShieldAlert, TrendingUp, DollarSign,
  PackageCheck, Star, AlertTriangle, AlertCircle, CheckCircle2,
  Snowflake, Sun, RefreshCw, Phone, Mail, Clock, UserCheck,
  UserPlus, Bike, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BranchManagement() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [branchManagers, setBranchManagers] = useState([]);
  const [deliveryRiders, setDeliveryRiders] = useState([]);

  // Validation & Error States for New Branch Modal
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validation & Error States for Edit Branch Modal
  const [editErrors, setEditErrors] = useState({});
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  // Form State for New Branch
  const [newBranch, setNewBranch] = useState({
    branchName: '',
    streetAddress: '',
    contactNumber: '',
    email: '',
    openingTime: '08:00',
    closingTime: '23:00',
    managerId: '',
    assignedRiderIds: [],
  });

  // Form State for Edit Branch
  const [editBranchData, setEditBranchData] = useState({
    branchId: null,
    branchName: '',
    streetAddress: '',
    contactNumber: '',
    email: '',
    openingTime: '08:00',
    closingTime: '23:00',
    managerId: '',
    assignedRiderIds: [],
  });

  useEffect(() => {
    fetchBranches();
    fetchStaffUsers();
  }, []);

  const fetchStaffUsers = async () => {
    try {
      const res = await axiosClient.get('/admin/users');
      if (res && res.success && Array.isArray(res.data)) {
        const managers = res.data.filter(u => u.role === 'BRANCH_MANAGER');
        const riders = res.data.filter(u => u.role === 'RIDER');
        setBranchManagers(managers);
        setDeliveryRiders(riders);
      } else {
        const managers = mockUsersList.filter(u => u.role === 'BRANCH_MANAGER');
        const riders = mockUsersList.filter(u => u.role === 'RIDER');
        setBranchManagers(managers);
        setDeliveryRiders(riders);
      }
    } catch (err) {
      const managers = mockUsersList.filter(u => u.role === 'BRANCH_MANAGER');
      const riders = mockUsersList.filter(u => u.role === 'RIDER');
      setBranchManagers(managers);
      setDeliveryRiders(riders);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/branches?onlyActive=false');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setBranches(res.data);
        if (!selectedBranch) {
          selectBranch(res.data[0]);
        } else {
          const current = res.data.find(b => b.branchId === selectedBranch.branchId);
          if (current) setSelectedBranch(current);
        }
      } else {
        // Fallback to rich Mock Branches if DB table is currently empty
        setBranches(mockBranches);
        if (mockBranches.length > 0) {
          selectBranch(mockBranches[0]);
        }
      }
    } catch (err) {
      console.error('Fetch branches error, fallback to mock:', err);
      setBranches(mockBranches);
      if (mockBranches.length > 0) {
        selectBranch(mockBranches[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectBranch = async (branch) => {
    setSelectedBranch(branch);
    try {
      const perfRes = await axiosClient.get(`/branches/${branch.branchId}/performance`);
      if (perfRes && perfRes.success && perfRes.data) {
        setPerformance(perfRes.data);
      } else {
        setPerformance({ totalOrders: 1450, totalRevenue: 2850000.0, averageRating: 4.8, complaintCount: 3 });
      }
    } catch (err) {
      setPerformance({ totalOrders: 1450, totalRevenue: 2850000.0, averageRating: 4.8, complaintCount: 3 });
    }
  };

  // Comprehensive Form Validation Helper
  const validateBranchForm = (data, branchList, excludeId = null) => {
    const errs = {};

    // Branch Name
    if (!data.branchName || !data.branchName.trim()) {
      errs.branchName = 'Branch name is required.';
    } else if (data.branchName.trim().length < 3) {
      errs.branchName = 'Branch name must be at least 3 characters.';
    } else if (data.branchName.trim().length > 60) {
      errs.branchName = 'Branch name cannot exceed 60 characters.';
    } else if (
      branchList.some(
        b => b.branchName?.trim().toLowerCase() === data.branchName.trim().toLowerCase() && b.branchId !== excludeId
      )
    ) {
      errs.branchName = 'A branch with this name is already registered.';
    }

    // Street Address
    if (!data.streetAddress || !data.streetAddress.trim()) {
      errs.streetAddress = 'Street address is required.';
    } else if (data.streetAddress.trim().length < 5) {
      errs.streetAddress = 'Please enter a valid street address (minimum 5 characters).';
    } else if (data.streetAddress.trim().length > 150) {
      errs.streetAddress = 'Street address cannot exceed 150 characters.';
    }

    // Contact Phone Number (supports SL landline & mobile: e.g. 0812345678, 0771234567, +94771234567)
    const phoneClean = (data.contactNumber || '').replace(/[\s-]/g, '');
    const phoneRegex = /^(?:0|94|\+94)?(?:7[0-9]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81)[0-9]{7}$/;
    if (!phoneClean) {
      errs.contactNumber = 'Contact phone number is required.';
    } else if (!phoneRegex.test(phoneClean) || phoneClean.replace(/\D/g, '').length < 9) {
      errs.contactNumber = 'Invalid phone number format. (e.g. 0812345678 or 0771234567)';
    } else if (
      branchList.some(
        b => b.contactNumber?.replace(/[\s-]/g, '') === phoneClean && b.branchId !== excludeId
      )
    ) {
      errs.contactNumber = 'This contact number is already registered to another branch.';
    }

    // Branch Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !data.email.trim()) {
      errs.email = 'Branch email is required.';
    } else if (!emailRegex.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. kandy@spiceavenue.com).';
    } else if (
      branchList.some(
        b => b.email?.trim().toLowerCase() === data.email.trim().toLowerCase() && b.branchId !== excludeId
      )
    ) {
      errs.email = 'This email address is already assigned to another branch.';
    }

    // Opening & Closing Hours
    if (!data.openingTime) {
      errs.openingTime = 'Opening time is required.';
    }
    if (!data.closingTime) {
      errs.closingTime = 'Closing time is required.';
    }
    if (data.openingTime && data.closingTime) {
      const open = data.openingTime.slice(0, 5);
      const close = data.closingTime.slice(0, 5);
      if (close <= open) {
        errs.closingTime = 'Closing time must be strictly later than opening time.';
      }
    }

    return errs;
  };

  const formatTimeToHms = (t) => {
    if (!t) return '08:00:00';
    return t.length === 5 ? `${t}:00` : t;
  };

  const handleOpenAddModal = () => {
    setErrors({});
    setFormError('');
    setNewBranch({
      branchName: '',
      streetAddress: '',
      contactNumber: '',
      email: '',
      openingTime: '08:00',
      closingTime: '23:00',
      managerId: '',
      assignedRiderIds: [],
    });
    setShowAddModal(true);
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client-side validation
    const validationErrors = validateBranchForm(newBranch, branches);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError('Please correct the highlighted errors before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const assignedManager = branchManagers.find(m => String(m.userId) === String(newBranch.managerId));
      const payload = {
        branchName: newBranch.branchName.trim(),
        streetAddress: newBranch.streetAddress.trim(),
        contactNumber: newBranch.contactNumber.trim(),
        email: newBranch.email.trim(),
        openingTime: formatTimeToHms(newBranch.openingTime),
        closingTime: formatTimeToHms(newBranch.closingTime),
        managerId: newBranch.managerId ? Number(newBranch.managerId) : null,
        managerName: assignedManager ? assignedManager.fullName : 'Unassigned',
        managerEmail: assignedManager ? assignedManager.email : '',
        assignedRiderIds: newBranch.assignedRiderIds || [],
        status: 'ACTIVE',
      };
      
      const res = await axiosClient.post('/branches', payload);
      const created = (res && res.data) ? res.data : { ...payload, branchId: Date.now() };

      setBranches(prev => [created, ...prev]);
      setSelectedBranch(created);
      setShowAddModal(false);
      showToast(`Branch "${created.branchName}" registered successfully!`);
    } catch (err) {
      console.error('Create branch failed:', err);
      const apiMessage = err.response?.data?.message || err.message || 'Error creating branch. Please check inputs.';
      setFormError(apiMessage);
      
      // If backend returned field-specific errors
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        setErrors(err.response.data.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (branch) => {
    const existingManager = branchManagers.find(m => m.fullName === branch.managerName);
    setEditErrors({});
    setEditFormError('');
    setEditBranchData({
      branchId: branch.branchId,
      branchName: branch.branchName || '',
      streetAddress: branch.streetAddress || '',
      contactNumber: branch.contactNumber || '',
      email: branch.email || '',
      openingTime: (branch.openingTime || '08:00:00').slice(0, 5),
      closingTime: (branch.closingTime || '23:00:00').slice(0, 5),
      managerId: branch.managerId || (existingManager ? existingManager.userId : ''),
      assignedRiderIds: branch.assignedRiderIds || (branch.branchId === 1 ? [5, 6] : []),
      status: branch.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    setEditFormError('');

    // Client-side validation
    const validationErrors = validateBranchForm(editBranchData, branches, editBranchData.branchId);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      setEditFormError('Please correct the highlighted errors before saving changes.');
      return;
    }

    setEditSubmitting(true);
    try {
      const assignedManager = branchManagers.find(m => String(m.userId) === String(editBranchData.managerId));

      const payload = {
        branchName: editBranchData.branchName.trim(),
        streetAddress: editBranchData.streetAddress.trim(),
        contactNumber: editBranchData.contactNumber.trim(),
        email: editBranchData.email.trim(),
        openingTime: formatTimeToHms(editBranchData.openingTime),
        closingTime: formatTimeToHms(editBranchData.closingTime),
        status: editBranchData.status,
        managerId: editBranchData.managerId ? Number(editBranchData.managerId) : null,
        managerName: assignedManager ? assignedManager.fullName : 'Unassigned',
        managerEmail: assignedManager ? assignedManager.email : '',
        assignedRiderIds: editBranchData.assignedRiderIds || [],
      };

      const res = await axiosClient.put(`/branches/${editBranchData.branchId}`, payload);
      
      const backendBranch = (res && res.data) ? res.data : null;
      const mergedBranch = {
        ...selectedBranch,
        ...editBranchData,
        ...(backendBranch || {}),
        assignedRiderIds: editBranchData.assignedRiderIds || (backendBranch?.assignedRiderIds || []),
        managerName: assignedManager ? assignedManager.fullName : (backendBranch?.managerName || (editBranchData.managerId ? 'Assigned' : 'Unassigned')),
        managerEmail: assignedManager ? assignedManager.email : (backendBranch?.managerEmail || ''),
        managerId: editBranchData.managerId ? Number(editBranchData.managerId) : null,
      };

      setBranches(prev => prev.map(b => b.branchId === editBranchData.branchId ? mergedBranch : b));
      setSelectedBranch(mergedBranch);
      setShowEditModal(false);
      showToast('Branch details updated successfully!');
      fetchBranches();
    } catch (err) {
      console.error('Update branch failed:', err);
      const apiMessage = err.response?.data?.message || err.message || 'Failed to update branch details.';
      setEditFormError(apiMessage);
      if (err.response?.data?.data && typeof err.response.data.data === 'object') {
        setEditErrors(err.response.data.data);
      }
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleFreeze = async (branchId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = currentStatus === 'ACTIVE' ? 'Freeze / Deactivate' : 'Unfreeze / Activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this branch?`)) return;
    try {
      await axiosClient.patch(`/branches/${branchId}/status?status=${nextStatus}`);
      showToast(`Branch status changed to ${nextStatus}.`);
    } catch (err) {
      console.warn('Backend patch error, updating locally');
      showToast(`Branch status updated locally to ${nextStatus}.`);
    }
    setBranches(prev => prev.map(b => b.branchId === branchId ? { ...b, status: nextStatus } : b));
    if (selectedBranch?.branchId === branchId) {
      setSelectedBranch(prev => ({ ...prev, status: nextStatus }));
    }
  };

  const filteredBranches = branches.filter((b) => {
    if (statusFilter === 'ACTIVE') return b.status === 'ACTIVE';
    if (statusFilter === 'INACTIVE') return b.status === 'INACTIVE';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce-short ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/40'
              : 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/40'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-300" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-300" />
          )}
          <span className="text-xs font-semibold flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        badgeIcon={MapPin}
        badgeText="Operations & Branch Control"
        badgeColor="bg-orange-600/90"
        title="Branch Management & Operational Control"
        description="Register new branches, assign branch managers, edit branch details, toggle operating status, and monitor performance."
      >
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Register New Branch
        </button>
        <button
          onClick={fetchBranches}
          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Sync Branches
        </button>
      </PageHeader>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-3">
        <span className="text-xs font-bold text-stone-500 mr-2">Filter:</span>
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'ALL' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          All Branches ({branches.length})
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Active ({branches.filter(b => b.status === 'ACTIVE').length})
        </button>
        <button
          onClick={() => setStatusFilter('INACTIVE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            statusFilter === 'INACTIVE' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Frozen / Inactive ({branches.filter(b => b.status === 'INACTIVE').length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading branch records from database...</div>
      ) : filteredBranches.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
          No branches found. Click "Register New Branch" above to add one.
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Registered Branches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBranches.map((b) => (
              <div
                key={b.branchId}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base">{b.branchName}</h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" /> {b.streetAddress}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-stone-100 my-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span className="font-semibold text-stone-700">Hours:</span>
                      <span>{b.openingTime} - {b.closingTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span className="font-semibold text-stone-700">Phone:</span>
                      <span>{b.contactNumber || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                      <span className="font-semibold text-stone-700">Email:</span>
                      <span>{b.email || 'N/A'}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-100 mt-3 flex items-start gap-2.5">
                      <UserCheck className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[11px] font-bold text-stone-500 uppercase block">Assigned Manager</span>
                        <span className="font-bold text-stone-900 text-xs">
                          {b.managerName && b.managerName !== 'Unassigned' ? b.managerName : 'Unassigned'}
                        </span>
                        <span className="block text-[10px] text-stone-500 mt-0.5">
                          {b.managerName && b.managerName !== 'Unassigned'
                            ? (b.managerEmail || 'Active Manager')
                            : 'No manager assigned'}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Delivery Riders (Operations Manager Control) */}
                    <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 mt-2 flex items-start gap-2.5">
                      <Bike className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-500 uppercase">Assigned Delivery Riders</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                            {(b.assignedRiderIds || (b.branchId === 1 ? [5, 6] : [])).length} Riders
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {deliveryRiders
                            .filter(r => (b.assignedRiderIds || (b.branchId === 1 ? [5, 6] : [])).includes(r.userId))
                            .map(r => (
                              <span key={r.userId} className="text-[11px] font-bold px-2 py-0.5 bg-white border border-purple-200 text-purple-900 rounded-lg shadow-2xs">
                                🚴 {r.fullName}
                              </span>
                            ))}
                          {deliveryRiders.filter(r => (b.assignedRiderIds || (b.branchId === 1 ? [5, 6] : [])).includes(r.userId)).length === 0 && (
                            <span className="text-[11px] text-stone-400 italic">No delivery riders assigned to branch</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-stone-400">ID: #{b.branchId}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" /> Edit & Assign
                    </button>

                    <button
                      onClick={() => handleToggleFreeze(b.branchId, b.status)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        b.status === 'ACTIVE'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {b.status === 'ACTIVE' ? (
                        <>
                          <Snowflake className="w-3.5 h-3.5" /> Freeze
                        </>
                      ) : (
                        <>
                          <Sun className="w-3.5 h-3.5" /> Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl my-8 border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Register New Branch</h3>
                <p className="text-xs text-stone-500">Configure new restaurant outlet and operational details.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Modal Error Banner */}
            {formError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Unable to Register Branch</p>
                  <p className="text-rose-700 mt-0.5">{formError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateBranch} className="space-y-3.5 text-xs">
              {/* Branch Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBranch.branchName}
                  onChange={(e) => {
                    setNewBranch({ ...newBranch, branchName: e.target.value });
                    if (errors.branchName) setErrors({ ...errors, branchName: null });
                  }}
                  placeholder="e.g. Spice Avenue - Kandy Central"
                  className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                    errors.branchName
                      ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                      : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.branchName && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.branchName}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBranch.streetAddress}
                  onChange={(e) => {
                    setNewBranch({ ...newBranch, streetAddress: e.target.value });
                    if (errors.streetAddress) setErrors({ ...errors, streetAddress: null });
                  }}
                  placeholder="No. 12, Peradeniya Road, Kandy"
                  className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                    errors.streetAddress
                      ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                      : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {errors.streetAddress && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newBranch.contactNumber}
                    onChange={(e) => {
                      setNewBranch({ ...newBranch, contactNumber: e.target.value });
                      if (errors.contactNumber) setErrors({ ...errors, contactNumber: null });
                    }}
                    placeholder="0812345678"
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                      errors.contactNumber
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {errors.contactNumber && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Branch Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => {
                      setNewBranch({ ...newBranch, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="kandy@spiceavenue.com"
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                      errors.email
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Opening & Closing Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Opening Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newBranch.openingTime}
                    onChange={(e) => {
                      setNewBranch({ ...newBranch, openingTime: e.target.value });
                      if (errors.openingTime || errors.closingTime) {
                        setErrors({ ...errors, openingTime: null, closingTime: null });
                      }
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                      errors.openingTime
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {errors.openingTime && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.openingTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Closing Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={newBranch.closingTime}
                    onChange={(e) => {
                      setNewBranch({ ...newBranch, closingTime: e.target.value });
                      if (errors.closingTime) setErrors({ ...errors, closingTime: null });
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl transition-all ${
                      errors.closingTime
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {errors.closingTime && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.closingTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Assign Branch Manager (Optional) */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Assign Branch Manager (Optional)</label>
                <select
                  value={newBranch.managerId}
                  onChange={(e) => setNewBranch({ ...newBranch, managerId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">-- Unassigned (Assign Later) --</option>
                  {branchManagers.map((m) => {
                    const currentManaged = branches.find(b => b.managerId === m.userId);
                    return (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.email}) {currentManaged ? `[Currently: ${currentManaged.branchName}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Assign Delivery Riders */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Assign Delivery Riders (Optional)</label>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {(newBranch.assignedRiderIds || []).length} selected
                  </span>
                </div>
                <div className="p-3 bg-purple-50/30 border border-purple-200 rounded-xl space-y-2 max-h-36 overflow-y-auto">
                  {deliveryRiders.map((r) => {
                    const isChecked = (newBranch.assignedRiderIds || []).includes(r.userId);
                    return (
                      <label key={r.userId} className="flex items-center gap-2.5 cursor-pointer text-stone-800 font-semibold text-xs hover:bg-purple-50/60 p-1 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = newBranch.assignedRiderIds || [];
                            const next = e.target.checked
                              ? [...current, r.userId]
                              : current.filter((id) => id !== r.userId);
                            setNewBranch({ ...newBranch, assignedRiderIds: next });
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <span>🚴 {r.fullName} <span className="text-[10px] text-stone-500 font-normal">({r.email})</span></span>
                      </label>
                    );
                  })}
                  {deliveryRiders.length === 0 && (
                    <span className="text-[11px] text-stone-400 italic">No delivery rider accounts registered</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? 'Registering...' : 'Save & Register Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch & Assign Manager Modal */}
      {showEditModal && editBranchData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl my-8 border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Edit Branch Details</h3>
                <p className="text-xs text-stone-500">Modify operational information or reassign branch staff.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Modal Error Banner for Edit */}
            {editFormError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Unable to Save Changes</p>
                  <p className="text-rose-700 mt-0.5">{editFormError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUpdateBranch} className="space-y-3.5 text-xs">
              {/* Branch Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Branch Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editBranchData.branchName}
                  onChange={(e) => {
                    setEditBranchData({ ...editBranchData, branchName: e.target.value });
                    if (editErrors.branchName) setEditErrors({ ...editErrors, branchName: null });
                  }}
                  className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                    editErrors.branchName
                      ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                      : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {editErrors.branchName && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {editErrors.branchName}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editBranchData.streetAddress}
                  onChange={(e) => {
                    setEditBranchData({ ...editBranchData, streetAddress: e.target.value });
                    if (editErrors.streetAddress) setEditErrors({ ...editErrors, streetAddress: null });
                  }}
                  className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                    editErrors.streetAddress
                      ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                      : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
                {editErrors.streetAddress && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {editErrors.streetAddress}
                  </p>
                )}
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editBranchData.contactNumber}
                    onChange={(e) => {
                      setEditBranchData({ ...editBranchData, contactNumber: e.target.value });
                      if (editErrors.contactNumber) setEditErrors({ ...editErrors, contactNumber: null });
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                      editErrors.contactNumber
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {editErrors.contactNumber && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {editErrors.contactNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Branch Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editBranchData.email}
                    onChange={(e) => {
                      setEditBranchData({ ...editBranchData, email: e.target.value });
                      if (editErrors.email) setEditErrors({ ...editErrors, email: null });
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                      editErrors.email
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {editErrors.email && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {editErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Opening & Closing Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Opening Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={editBranchData.openingTime}
                    onChange={(e) => {
                      setEditBranchData({ ...editBranchData, openingTime: e.target.value });
                      if (editErrors.openingTime || editErrors.closingTime) {
                        setEditErrors({ ...editErrors, openingTime: null, closingTime: null });
                      }
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                      editErrors.openingTime
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {editErrors.openingTime && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {editErrors.openingTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Closing Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={editBranchData.closingTime}
                    onChange={(e) => {
                      setEditBranchData({ ...editBranchData, closingTime: e.target.value });
                      if (editErrors.closingTime) setEditErrors({ ...editErrors, closingTime: null });
                    }}
                    className={`w-full p-2.5 bg-stone-50 border rounded-xl font-medium transition-all ${
                      editErrors.closingTime
                        ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                        : 'border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                  {editErrors.closingTime && (
                    <p className="text-rose-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {editErrors.closingTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Branch Manager */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">Assigned Branch Manager</label>
                <select
                  value={editBranchData.managerId}
                  onChange={(e) => setEditBranchData({ ...editBranchData, managerId: e.target.value })}
                  className="w-full p-2.5 bg-orange-50/50 border border-orange-200 text-stone-900 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="">-- Unassigned --</option>
                  {branchManagers.map((m) => {
                    const currentManaged = branches.find(b => b.managerId === m.userId && b.branchId !== editBranchData.branchId);
                    return (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName} ({m.email}) {currentManaged ? `[Currently: ${currentManaged.branchName}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Assign Delivery Riders */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-700">Assign Delivery Riders (Select multiple)</label>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    {(editBranchData.assignedRiderIds || []).length} selected
                  </span>
                </div>
                <div className="p-3 bg-purple-50/30 border border-purple-200 rounded-xl space-y-2 max-h-36 overflow-y-auto">
                  {deliveryRiders.map((r) => {
                    const isChecked = (editBranchData.assignedRiderIds || []).includes(r.userId);
                    return (
                      <label key={r.userId} className="flex items-center gap-2.5 cursor-pointer text-stone-800 font-semibold text-xs hover:bg-purple-50/60 p-1 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = editBranchData.assignedRiderIds || [];
                            const next = e.target.checked
                              ? [...current, r.userId]
                              : current.filter((id) => id !== r.userId);
                            setEditBranchData({ ...editBranchData, assignedRiderIds: next });
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <span>🚴 {r.fullName} <span className="text-[10px] text-stone-500 font-normal">({r.email})</span></span>
                      </label>
                    );
                  })}
                  {deliveryRiders.length === 0 && (
                    <span className="text-[11px] text-stone-400 italic">No delivery rider accounts registered</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
