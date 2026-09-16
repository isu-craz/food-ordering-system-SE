import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { mockBranches, mockCategories, mockMenuItems } from '../../api/mockData';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import { UtensilsCrossed, Plus, Search, Layers, CheckCircle, XCircle, Trash2, Edit3, Image as ImageIcon, Sparkles, Filter, ChefHat, Building2 } from 'lucide-react';

export default function MenuManagement() {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(user?.branchId || 1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [showEditVariationModal, setShowEditVariationModal] = useState(false);
  const [selectedItemForVariation, setSelectedItemForVariation] = useState(null);
  const [editVariationData, setEditVariationData] = useState({ variationId: null, variationName: '', additionalPrice: 0 });

  // Form states
  const [newCategory, setNewCategory] = useState({ categoryName: '', description: '' });
  const [newItem, setNewItem] = useState({
    categoryId: '',
    foodName: '',
    description: '',
    basePrice: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  });
  const [editItemData, setEditItemData] = useState({
    itemId: null,
    categoryId: '',
    foodName: '',
    description: '',
    basePrice: '',
    imageUrl: '',
  });
  const [newVariation, setNewVariation] = useState({ variationName: '', additionalPrice: 0 });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      setSelectedCategory('ALL');
      loadBranchMenu();
    }
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const res = await axiosClient.get('/branches?onlyActive=false');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setBranches(res.data);
        setSelectedBranchId(res.data[0].branchId);
      } else {
        setBranches(mockBranches);
        setSelectedBranchId(mockBranches[0].branchId);
      }
    } catch (err) {
      console.error('Error fetching branches, fallback to mock:', err);
      setBranches(mockBranches);
      setSelectedBranchId(mockBranches[0].branchId);
    }
  };

  const loadBranchMenu = async () => {
    try {
      setLoading(true);
      const [catRes, itemRes] = await Promise.all([
        axiosClient.get(`/branches/${selectedBranchId}/categories?onlyActive=false`),
        axiosClient.get(`/branches/${selectedBranchId}/menu-items?onlyActive=false`),
      ]);
      if (catRes && catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setCategories(catRes.data);
      } else {
        setCategories(mockCategories);
      }

      if (itemRes && itemRes.success && Array.isArray(itemRes.data) && itemRes.data.length > 0) {
        setMenuItems(itemRes.data);
      } else {
        setMenuItems(mockMenuItems);
      }
    } catch (err) {
      console.error('Error loading branch menu, fallback to mock:', err);
      setCategories(mockCategories);
      setMenuItems(mockMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/categories', {
        branchId: selectedBranchId,
        ...newCategory,
      });
      if (res.success) {
        setShowCategoryModal(false);
        setNewCategory({ categoryName: '', description: '' });
        alert('Food Category Created Successfully!');
        loadBranchMenu();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/menu-items', {
        branchId: selectedBranchId,
        categoryId: Number(newItem.categoryId),
        foodName: newItem.foodName,
        description: newItem.description,
        basePrice: Number(newItem.basePrice),
        imageUrl: newItem.imageUrl,
      });
      if (res.success) {
        setShowItemModal(false);
        setNewItem({
          categoryId: '',
          foodName: '',
          description: '',
          basePrice: '',
          imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
        });
        alert('Menu Item Created Successfully!');
        loadBranchMenu();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating menu item');
    }
  };

  const handleToggleAvailability = async (itemId, currentAvailability) => {
    const isAvail = currentAvailability !== false;
    const nextAvailability = !isAvail;
    try {
      const res = await axiosClient.patch(`/menu-items/${itemId}/availability?isAvailable=${nextAvailability}`);
      if (res.success) {
        loadBranchMenu();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling availability');
    }
  };

  const openEditItemModal = (item) => {
    setEditItemData({
      itemId: item.itemId,
      categoryId: item.categoryId || '',
      foodName: item.foodName || '',
      description: item.description || '',
      basePrice: item.basePrice || '',
      imageUrl: item.imageUrl || '',
    });
    setShowEditItemModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        categoryId: Number(editItemData.categoryId),
        foodName: editItemData.foodName,
        description: editItemData.description,
        basePrice: Number(editItemData.basePrice),
        imageUrl: editItemData.imageUrl,
      };
      await axiosClient.put(`/menu-items/${editItemData.itemId}`, payload);
      setShowEditItemModal(false);
      setMenuItems((prev) =>
        prev.map((i) => (i.itemId === editItemData.itemId ? { ...i, ...payload } : i))
      );
      alert('Menu Item Updated Successfully!');
      loadBranchMenu();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to deactivate this menu item?')) return;
    try {
      await axiosClient.put(`/menu-items/${itemId}`, { status: 'INACTIVE' });
      setMenuItems((prev) => prev.filter((i) => i.itemId !== itemId));
      alert('Menu item deactivated successfully!');
    } catch (err) {
      setMenuItems((prev) => prev.filter((i) => i.itemId !== itemId));
    }
  };

  const handleAddVariation = async (e) => {
    e.preventDefault();
    if (!selectedItemForVariation) return;
    try {
      const res = await axiosClient.post(`/menu-items/${selectedItemForVariation.itemId}/variations`, newVariation);
      if (res.success) {
        setShowVariationModal(false);
        setNewVariation({ variationName: '', additionalPrice: 0 });
        alert('Size/Portion Variation Added!');
        loadBranchMenu();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding variation');
    }
  };

  const handleDeleteVariation = async (variationId) => {
    if (!window.confirm('Delete this size variation?')) return;
    try {
      const res = await axiosClient.delete(`/variations/${variationId}`);
      if (res.success) {
        loadBranchMenu();
      }
    } catch (err) {
      alert('Error deleting variation');
    }
  };

  const handleUpdateVariation = async (e) => {
    e.preventDefault();
    if (!editVariationData.variationId) return;
    try {
      const res = await axiosClient.put(`/variations/${editVariationData.variationId}`, {
        variationName: editVariationData.variationName,
        additionalPrice: editVariationData.additionalPrice,
      });
      if (res.success) {
        setShowEditVariationModal(false);
        setEditVariationData({ variationId: null, variationName: '', additionalPrice: 0 });
        alert('Size variation updated!');
        loadBranchMenu();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating variation');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' || item.categoryId === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        badgeIcon={UtensilsCrossed}
        badgeText="Branch Menu Management"
        badgeColor="bg-orange-600/90"
        title="Food Items & Size Variations"
        description="Manage food categories, menu offerings, dynamic portion/size variations, and 1-click stock availability."
        switcherTabs={[
          { label: 'Kitchen Queue', to: '/kitchen-queue', icon: ChefHat, active: false },
          { label: 'Menu Management', to: '/menu-admin', icon: UtensilsCrossed, active: true },
        ]}
      >
        {/* Branch Indicator: Read-only badge for Branch Manager, dropdown for Admin/Ops */}
        {user?.role === 'BRANCH_MANAGER' ? (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3.5 py-2 rounded-2xl">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-stone-300">Branch:</span>
            <span className="text-xs font-black text-white">
              {branches.find((b) => b.branchId === selectedBranchId)?.branchName || 'Spice Avenue - Colombo Main'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-stone-800 border border-stone-700 px-3 py-2 rounded-2xl">
            <Building2 className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-stone-300">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId} className="bg-stone-900 text-white">
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => setShowCategoryModal(true)}
          className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-2xl border border-stone-700 text-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Category
        </button>
        <button
          onClick={() => setShowItemModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </PageHeader>

      {/* 🏷️ CLICKABLE CATEGORIES FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {/* All Categories Button */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/20'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            All Categories ({menuItems.length})
          </button>

          {/* Individual Category Filter Buttons */}
          {categories.map((c) => {
            const isSelected = selectedCategory === c.categoryId;
            const categoryItemCount = menuItems.filter(m => m.categoryId === c.categoryId).length;
            return (
              <button
                key={c.categoryId}
                onClick={() => setSelectedCategory(c.categoryId)}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 ring-2 ring-orange-500/30'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <span>{c.categoryName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-orange-700 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {categoryItemCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Menu Item Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">Loading menu catalog...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white p-12 text-center text-stone-400 rounded-3xl border border-stone-200">
          <p className="font-bold text-stone-700 mb-1">No items found in this category.</p>
          <p className="text-xs text-stone-500">Click "Add Food Item" above or select "All Categories".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isItemAvailable = item.isAvailable !== false && item.available !== false;
            return (
              <div
                key={item.itemId}
                className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                      alt={item.foodName}
                      className={`w-full h-full object-cover transition-all ${
                        !isItemAvailable ? 'grayscale opacity-60' : ''
                      }`}
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${
                          isItemAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isItemAvailable ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                        {item.categoryName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-stone-900 text-sm">{item.foodName}</h3>
                    <span className="font-black text-orange-600 text-sm whitespace-nowrap">
                      LKR {Number(item.basePrice).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 line-clamp-2 mb-4">{item.description}</p>

                  {/* Variations Section */}
                  <div className="pt-3 border-t border-stone-100 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                        Portion Variations ({item.variations ? item.variations.length : 0})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedItemForVariation(item);
                          setShowVariationModal(true);
                        }}
                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add Size
                      </button>
                    </div>

                    <div className="space-y-1">
                      {item.variations && item.variations.length > 0 ? (
                        item.variations.map((v) => (
                          <div
                            key={v.variationId}
                            className="flex items-center justify-between bg-stone-50 px-2.5 py-1.5 rounded-xl text-xs"
                          >
                            <span className="font-medium text-stone-700">{v.variationName}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-stone-900 text-[11px]">
                                +LKR {Number(v.additionalPrice).toFixed(2)}
                              </span>
                              <button
                                onClick={() => {
                                  setEditVariationData({
                                    variationId: v.variationId,
                                    variationName: v.variationName,
                                    additionalPrice: v.additionalPrice,
                                  });
                                  setShowEditVariationModal(true);
                                }}
                                className="text-stone-400 hover:text-stone-700 p-0.5"
                                title="Edit variation"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVariation(v.variationId)}
                                className="text-rose-400 hover:text-rose-600 p-0.5"
                                title="Remove variation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-stone-400 italic">No size variations configured.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Controls */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium text-stone-400">
                    ID: #{item.itemId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditItemModal(item)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 flex items-center gap-1 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-600" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item.itemId)}
                      className="p-1.5 rounded-xl border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                      title="Deactivate item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(item.itemId, isItemAvailable)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        isItemAvailable
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isItemAvailable ? 'Out of Stock' : 'In Stock'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Category */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-3">Create Food Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategory.categoryName}
                  onChange={(e) => setNewCategory({ ...newCategory, categoryName: e.target.value })}
                  placeholder="e.g. Pasta & Lasagna"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Fresh oven-baked Italian pastas"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Item */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-4">Add New Food Item</h3>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Category</label>
                <select
                  required
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Food Item Name</label>
                <input
                  type="text"
                  required
                  value={newItem.foodName}
                  onChange={(e) => setNewItem({ ...newItem, foodName: e.target.value })}
                  placeholder="e.g. Crispy Fried Chicken Burger"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Crispy fried chicken breast with garlic mayo..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Base Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newItem.basePrice}
                    onChange={(e) => setNewItem({ ...newItem, basePrice: e.target.value })}
                    placeholder="1200.00"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Menu Item */}
      {showEditItemModal && editItemData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-3">Edit Menu Item Details</h3>
            <form onSubmit={handleUpdateItem} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Food Category</label>
                <select
                  required
                  value={editItemData.categoryId}
                  onChange={(e) => setEditItemData({ ...editItemData, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={editItemData.foodName}
                  onChange={(e) => setEditItemData({ ...editItemData, foodName: e.target.value })}
                  placeholder="e.g. Double Cheese Beef Smash Burger"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editItemData.description}
                  onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Base Price (LKR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editItemData.basePrice}
                    onChange={(e) => setEditItemData({ ...editItemData, basePrice: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editItemData.imageUrl}
                    onChange={(e) => setEditItemData({ ...editItemData, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditItemModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold">
                  Update Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Variation */}
      {showVariationModal && selectedItemForVariation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">Add Portion Variation</h3>
            <p className="text-xs text-stone-500 mb-3">Item: {selectedItemForVariation.foodName}</p>
            <form onSubmit={handleAddVariation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Variation Name</label>
                <input
                  type="text"
                  required
                  value={newVariation.variationName}
                  onChange={(e) => setNewVariation({ ...newVariation, variationName: e.target.value })}
                  placeholder="e.g. Large (12-inch)"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Additional Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newVariation.additionalPrice}
                  onChange={(e) => setNewVariation({ ...newVariation, additionalPrice: Number(e.target.value) })}
                  placeholder="500.00"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVariationModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold">
                  Add Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Variation */}
      {showEditVariationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900 mb-1">Edit Portion Variation</h3>
            <p className="text-xs text-stone-500 mb-3">Update size option details</p>
            <form onSubmit={handleUpdateVariation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Variation Name</label>
                <input
                  type="text"
                  required
                  value={editVariationData.variationName}
                  onChange={(e) => setEditVariationData({ ...editVariationData, variationName: e.target.value })}
                  placeholder="e.g. Large (12-inch)"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Additional Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editVariationData.additionalPrice}
                  onChange={(e) => setEditVariationData({ ...editVariationData, additionalPrice: Number(e.target.value) })}
                  placeholder="500.00"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditVariationModal(false)}
                  className="px-3 py-1.5 bg-stone-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 bg-orange-600 text-white rounded-xl font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
