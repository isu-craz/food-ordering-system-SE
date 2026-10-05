import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  ShoppingBag,
  MapPin,
  Truck,
  Store,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Banknote,
  Search,
  RefreshCw,
  Clock,
  Building2,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight,
  Check,
  ArrowRight
} from 'lucide-react';

export default function CustomerOrdering() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [orderType, setOrderType] = useState('DELIVERY'); // 'PICKUP' | 'DELIVERY'
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Cart Drawer & Food Popup states
  const [cartOpen, setCartOpen] = useState(false);       // Cart drawer slide-over
  const [selectedFood, setSelectedFood] = useState(null); // Food detail modal
  const [modalVariation, setModalVariation] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: 'Home', houseNumber: '', street: '', areaId: '', isDefault: true });

  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const loadInitialData = async () => {
    setLoading(true);

    // 1. Fetch Branches independently (Public Endpoint)
    try {
      let branchRes = await axiosClient.get('/branches?onlyActive=true');
      let branchList = branchRes?.success ? branchRes.data : [];

      // Fallback: If no active branches, load all branches
      if (branchList.length === 0) {
        branchRes = await axiosClient.get('/branches?onlyActive=false');
        branchList = branchRes?.success ? branchRes.data : [];
      }

      if (branchList.length > 0) {
        setBranches(branchList);
        const initialBranchId = branchList[0].branchId;
        setSelectedBranchId(initialBranchId);
        setSelectedCategory('ALL');
        await loadBranchMenuAndAreas(initialBranchId);
      } else {
        console.warn('No branches returned from API. Check backend / DB seed data.');
      }
    } catch (err) {
      console.error('Failed to load branches:', err?.response?.data?.message || err.message);
    }

    // 2. Fetch Customer Addresses independently (Authenticated Endpoint)
    try {
      const addrRes = await axiosClient.get('/customer/addresses');
      if (addrRes?.success && addrRes?.data) {
        setAddresses(addrRes.data);
        if (addrRes.data.length > 0) {
          setSelectedAddressId(addrRes.data[0].addressId);
        }
      }
    } catch (err) {
      console.log('Customer addresses not loaded:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branchId) => {
    if (selectedBranchId === branchId) return;

    if (cart.length > 0) {
      const confirmChange = window.confirm('Changing the restaurant branch will clear your current cart. Do you want to proceed?');
      if (!confirmChange) return;
      setCart([]);
    }

    setSelectedBranchId(branchId);
    setSelectedCategory('ALL');
    loadBranchMenuAndAreas(branchId);
  };

  const loadBranchMenuAndAreas = async (branchId) => {
    try {
      const [menuRes, areaRes, catRes] = await Promise.allSettled([
        axiosClient.get(`/branches/${branchId}/menu-items?onlyActive=false`),
        axiosClient.get(`/branches/${branchId}/delivery-areas?onlyActive=true`),
        axiosClient.get(`/branches/${branchId}/categories?onlyActive=true`),
      ]);

      if (menuRes.status === 'fulfilled' && menuRes.value?.success) {
        setMenuItems(menuRes.value.data || []);
      } else {
        setMenuItems([]);
      }

      if (areaRes.status === 'fulfilled' && areaRes.value?.success) {
        setDeliveryAreas(areaRes.value.data || []);
      } else {
        setDeliveryAreas([]);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        setCategories(catRes.value.data || []);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading branch menu & areas:', err.message);
    }
  };

  // Add item to cart without forcing immediate checkout
  const handleAddToCart = (item, variation = null, quantity = 1, showToast = true) => {
    const unitPrice = variation ? Number(item.basePrice) + Number(variation.additionalPrice) : Number(item.basePrice);
    const cartKey = `${item.itemId}-${variation ? variation.variationId : 'none'}`;

    const existingIndex = cart.findIndex((c) => c.cartKey === cartKey);
    let updated;
    if (existingIndex > -1) {
      updated = [...cart];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...cart,
        {
          cartKey,
          itemId: item.itemId,
          itemName: item.foodName,
          variationId: variation ? variation.variationId : null,
          variationName: variation ? variation.variationName : null,
          unitPrice,
          quantity,
        },
      ];
    }
    setCart(updated);
    if (showToast) {
      triggerToast(`Added "${item.foodName}" to cart!`);
    }
  };

  // Direct Order / Buy Now: Add to cart and immediately open Cart Drawer ready for checkout
  const handleDirectOrder = (item, variation = null, quantity = 1) => {
    handleAddToCart(item, variation, quantity, false);
    setCartOpen(true);
  };

  // Open food popup modal to view full details and choose Add to Cart or Place Order
  const handleOpenFoodModal = (item) => {
    setSelectedFood(item);
    const initialVar = (item.variations && item.variations.length > 0)
      ? selectedVariations[item.itemId] || item.variations[0]
      : null;
    setModalVariation(initialVar);
    setModalQuantity(1);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!newAddr.areaId) {
      alert('Please choose a delivery zone before saving.');
      return;
    }

    try {
      const res = await axiosClient.post('/customer/addresses', newAddr);

      if (res?.success) {
        setShowAddressModal(false);
        const savedAddressId = res.data?.addressId;
        setNewAddr({ label: 'Home', houseNumber: '', street: '', areaId: '', isDefault: true });

        const addrRes = await axiosClient.get('/customer/addresses');
        if (addrRes?.success && addrRes?.data) {
          setAddresses(addrRes.data);
          setSelectedAddressId(savedAddressId || addrRes.data[0]?.addressId || '');
        }
      } else {
        alert(res?.message || 'Failed to save address. Please check all fields and try again.');
      }
    } catch (err) {
      console.error('Save address error:', err);
      alert(err.response?.data?.message || 'Please log in as Customer to save addresses.');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const getSelectedDeliveryFee = () => {
    if (orderType === 'PICKUP') return 0;
    const currentAddr = addresses.find((a) => a.addressId === Number(selectedAddressId));
    return currentAddr ? Number(currentAddr.deliveryFee) : 0;
  };

  const handlePlaceOrder = async () => {
    if (!selectedBranchId) {
      alert('Please select a restaurant branch.');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty! Please add food items to your cart.');
      return;
    }

    if (orderType === 'DELIVERY' && !selectedAddressId) {
      alert('Please select or add a delivery address.');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload = {
        branchId: Number(selectedBranchId),
        orderType,
        paymentMethod,
        deliveryAddressId: orderType === 'DELIVERY' ? Number(selectedAddressId) : null,
        items: cart.map((c) => ({
          itemId: c.itemId,
          variationId: c.variationId,
          quantity: c.quantity,
        })),
      };

      const res = await axiosClient.post('/customer/orders', payload);

      if (res?.success) {
        alert(`Order Placed Successfully! Reference: ${res.data.orderNumber}`);
        setCart([]);
        setCartOpen(false);
        navigate('/my-orders');
      } else {
        alert(res?.message || 'Order could not be placed. Please try again.');
      }
    } catch (err) {
      console.error('Place order error:', err);
      alert(err.response?.data?.message || 'Error placing order. Please ensure you are signed in as a Customer.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.categoryId === Number(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const selectedBranch = branches.find((b) => b.branchId === selectedBranchId);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calculateSubtotal();
  const deliveryFee = getSelectedDeliveryFee();
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-stone-700 animate-in fade-in slide-in-from-bottom duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setCartOpen(true)}
            className="ml-2 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
          >
            <ShoppingBag className="w-3 h-3" />
            View Cart
          </button>
        </div>
      )}

      {/* Header & Order Type Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase mb-1 inline-block">
              Customer Ordering Portal
            </span>
            <h1 className="text-2xl font-black text-stone-900">Browse Menu & Place Order</h1>
            <p className="text-xs text-stone-500">Pick your restaurant branch, choose pickup or delivery, and order your favorite dishes.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pickup vs Delivery Toggle */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setOrderType('DELIVERY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'DELIVERY'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Truck className="w-4 h-4" /> Delivery
              </button>
              <button
                onClick={() => setOrderType('PICKUP')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'PICKUP'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Store className="w-4 h-4" /> Self-Pickup
              </button>
            </div>

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md hover:shadow-orange-600/20"
              title="View your cart"
            >
              <ShoppingBag className="w-4 h-4 text-orange-400 group-hover:text-white" />
              <span>Cart</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                totalCartCount > 0 ? 'bg-orange-600 text-white' : 'bg-stone-700 text-stone-300'
              }`}>
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Branch Selector */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-600" />
              Select Restaurant Branch:
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-stone-500">
                {branches.length} Branches Available
              </span>
              <button
                onClick={loadInitialData}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                title="Refresh branches from DB"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Clickable Branch Cards */}
          {branches.length === 0 ? (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl text-center text-xs text-stone-500">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              No branches found in database. Make sure backend is running.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {branches.map((b) => {
                const isSelected = selectedBranchId === b.branchId;
                return (
                  <div
                    key={b.branchId}
                    onClick={() => handleSelectBranch(b.branchId)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-600 bg-orange-50/50 shadow-md shadow-orange-600/10 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">{b.branchName}</h4>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-orange-600 flex-shrink-0" />
                          {b.streetAddress}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="p-1 bg-orange-600 text-white rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" /> {b.openingTime} - {b.closingTime}
                      </span>
                      <span className="font-semibold text-emerald-600">{b.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => setSelectedCategory(c.categoryId)}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === c.categoryId
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search pizza, burgers, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-600/20 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart ({totalCartCount})</span>
          </button>
        </div>
      </div>

      {/* Food Menu Items Grid */}
      <div>
        {loading ? (
          <div className="py-24 text-center text-stone-400 font-medium">Loading delicious meals...</div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-16 text-center text-stone-400 rounded-3xl border border-stone-200">
            <p className="font-bold text-stone-700 mb-1 text-sm">No food items found.</p>
            <p className="text-xs text-stone-500">
              {selectedCategory !== 'ALL'
                ? 'No items found in this category. Click "All Items" to view all available dishes.'
                : `No menu items registered under ${selectedBranch?.branchName || 'this branch'}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const isItemAvailable = item.isAvailable !== false && item.available !== false;
              const hasVariations = item.variations && item.variations.length > 0;
              const currentVariation = hasVariations
                ? selectedVariations[item.itemId] || item.variations[0]
                : null;
              const itemCurrentPrice = currentVariation
                ? Number(item.basePrice) + Number(currentVariation.additionalPrice)
                : Number(item.basePrice);

              return (
                <div
                  key={item.itemId}
                  className={`bg-white border rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isItemAvailable ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
                  }`}
                >
                  <div>
                    {/* Clickable Food Image to Open Detail Modal */}
                    <div
                      onClick={() => isItemAvailable && handleOpenFoodModal(item)}
                      className="relative h-44 rounded-2xl overflow-hidden mb-3 bg-stone-100 cursor-pointer group"
                    >
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                        alt={item.foodName}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${!isItemAvailable ? 'grayscale' : ''}`}
                      />
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
                          {item.categoryName}
                        </span>
                      </div>
                      {!isItemAvailable && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => isItemAvailable && handleOpenFoodModal(item)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-bold text-stone-900 text-sm hover:text-orange-600 transition-colors line-clamp-1">
                          {item.foodName}
                        </h3>
                        <span className="font-extrabold text-orange-600 text-xs whitespace-nowrap">
                          LKR {itemCurrentPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mb-3">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions & Variation Selector */}
                  <div className="pt-2 border-t border-stone-100 space-y-2.5">
                    {!isItemAvailable ? (
                      <button
                        disabled
                        className="w-full py-2 bg-stone-200 text-stone-400 font-bold rounded-xl text-xs cursor-not-allowed"
                      >
                        Temporarily Unavailable
                      </button>
                    ) : (
                      <>
                        {/* Variations Selector (Portions/Sizes) */}
                        {hasVariations && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                              Portion / Size:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.variations.map((v) => {
                                const isSelected = currentVariation?.variationId === v.variationId;
                                return (
                                  <button
                                    key={v.variationId}
                                    type="button"
                                    onClick={() =>
                                      setSelectedVariations({
                                        ...selectedVariations,
                                        [item.itemId]: v,
                                      })
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                      isSelected
                                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                                    }`}
                                  >
                                    {v.variationName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 2 Clear Options: Add to Cart OR Place Order Now */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item, currentVariation, 1, true)}
                            className="py-2.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all"
                            title="Add item to your cart"
                          >
                            <Plus className="w-3.5 h-3.5 text-stone-700" />
                            <span>Add to Cart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectOrder(item, currentVariation, 1)}
                            className="py-2.5 px-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-600/20"
                            title="Directly proceed to place order"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Place Order</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Pill (Visible when cart has items & drawer is closed) */}
      {totalCartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 bg-stone-900 hover:bg-orange-600 text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-orange-600/30 transition-all transform hover:scale-105"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              <span className="absolute -top-1 -right-2 bg-orange-600 text-white rounded-full text-[10px] font-black w-4 h-4 flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">View Your Cart</p>
              <p className="text-[11px] text-stone-300 font-medium">LKR {subtotal.toFixed(2)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      )}

      {/* Food Detail Modal (When user clicks on food to choose Add to Cart or Place Order) */}
      {selectedFood && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Image */}
            <div className="relative h-56 bg-stone-100 flex-shrink-0">
              <img
                src={selectedFood.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}
                alt={selectedFood.foodName}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                  {selectedFood.categoryName}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-stone-900">{selectedFood.foodName}</h2>
                  <p className="text-xs text-stone-500 mt-1">{selectedFood.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-base font-black text-orange-600 block">
                    LKR {(modalVariation
                      ? Number(selectedFood.basePrice) + Number(modalVariation.additionalPrice)
                      : Number(selectedFood.basePrice)
                    ).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-stone-400">per portion</span>
                </div>
              </div>

              {/* Variations selector if available */}
              {selectedFood.variations && selectedFood.variations.length > 0 && (
                <div className="pt-3 border-t border-stone-100">
                  <label className="text-xs font-bold text-stone-700 block mb-2">
                    Choose Portion / Size:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFood.variations.map((v) => {
                      const isSelected = modalVariation?.variationId === v.variationId;
                      const priceWithVariation = Number(selectedFood.basePrice) + Number(v.additionalPrice);
                      return (
                        <button
                          key={v.variationId}
                          type="button"
                          onClick={() => setModalVariation(v)}
                          className={`p-3 rounded-2xl border text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/70 text-orange-900 ring-2 ring-orange-500/20'
                              : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold">{v.variationName}</p>
                            <p className="text-[11px] text-orange-600 font-semibold">LKR {priceWithVariation.toFixed(2)}</p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Select Quantity:</span>
                  <span className="text-[10px] text-stone-400">Choose how many you want</span>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-2xl p-1.5">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm hover:bg-stone-50"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-sm px-2 text-stone-900">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm hover:bg-stone-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer: 2 Options (Add to Cart vs Place Order) */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  handleAddToCart(selectedFood, modalVariation, modalQuantity, true);
                  setSelectedFood(null);
                }}
                className="flex-1 py-3 px-4 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-stone-600" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDirectOrder(selectedFood, modalVariation, modalQuantity);
                  setSelectedFood(null);
                }}
                className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Place Order Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-Over Drawer (Opens only when user clicks Cart button) */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-base">Your Shopping Cart</h3>
                    <p className="text-[11px] text-stone-500">{totalCartCount} item(s) selected</p>
                  </div>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
                  title="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Cart Items List */}
                {cart.length === 0 ? (
                  <div className="py-16 text-center text-stone-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <p className="font-bold text-stone-700 text-sm">Your shopping cart is empty</p>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                      Explore our menu and click "Add to Cart" to start filling your tray!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Order Items</h4>
                    {cart.map((c, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl text-xs border border-stone-100">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-stone-900 line-clamp-1">{c.itemName}</p>
                          {c.variationName && (
                            <span className="text-[10px] text-stone-500 block">Portion: {c.variationName}</span>
                          )}
                          <span className="font-bold text-orange-600 text-xs">
                            LKR {(c.unitPrice * c.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold text-xs px-1.5">{c.quantity}</span>
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => updateQuantity(idx, -c.quantity)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivery Address (If in Delivery Mode) */}
                {orderType === 'DELIVERY' && cart.length > 0 && (
                  <div className="pt-4 border-t border-stone-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        Delivery Address:
                      </label>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                      >
                        + Add New
                      </button>
                    </div>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {addresses.length === 0 ? (
                        <option value="">No addresses saved. Click "+ Add New" above</option>
                      ) : (
                        addresses.map((a) => (
                          <option key={a.addressId} value={a.addressId}>
                            {a.label}: {a.houseNumber}, {a.street} ({a.areaName} - LKR {Number(a.deliveryFee).toFixed(2)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {/* Payment Method Selector */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-stone-100">
                    <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'CARD'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-500/20'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" /> Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          paymentMethod === 'CASH_ON_DELIVERY'
                            ? 'border-orange-500 bg-orange-50 text-orange-800 ring-2 ring-orange-500/20'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Banknote className="w-4 h-4" /> Cash / COD
                      </button>
                    </div>
                  </div>
                )}

                {/* Bill Summary */}
                {cart.length > 0 && (
                  <div className="space-y-1.5 text-xs text-stone-600 pt-4 border-t border-stone-100">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-stone-900">LKR {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-bold text-stone-900">
                        {orderType === 'DELIVERY' ? `LKR ${deliveryFee.toFixed(2)}` : 'FREE (Pickup)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                      <span>Total Bill</span>
                      <span className="text-orange-600">LKR {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer: Place Order Button */}
              <div className="p-5 border-t border-stone-100 bg-stone-50/70 space-y-2">
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.length === 0}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  {placingOrder ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Placing Order...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Place Order Now
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-bold text-center"
                >
                  ← Continue Browsing Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Delivery Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-900">Add Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Label (e.g. Home, Office)</label>
                <input
                  type="text"
                  required
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  placeholder="Home"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Zone</label>
                <select
                  required
                  value={newAddr.areaId}
                  onChange={(e) => setNewAddr({ ...newAddr, areaId: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                >
                  <option value="">-- Choose Zone --</option>
                  {deliveryAreas.map((a) => (
                    <option key={a.areaId} value={a.areaId}>
                      {a.areaName} (Fee: LKR {Number(a.deliveryFee).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">House Number / Building</label>
                <input
                  type="text"
                  required
                  value={newAddr.houseNumber}
                  onChange={(e) => setNewAddr({ ...newAddr, houseNumber: e.target.value })}
                  placeholder="No. 42/A"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Galle Road, Kollupitiya"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-sm shadow-orange-600/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}