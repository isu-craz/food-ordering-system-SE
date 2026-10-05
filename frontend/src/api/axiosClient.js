import axios from 'axios';
import {
  mockUsers,
  mockBranches,
  mockCategories,
  mockMenuItems,
  mockOrders,
  mockRiderTasks,
  mockRiderHistory,
  mockComplaints,
  mockReviews,
  mockUsersList,
  mockAuditLogs,
  mockSystemSettings,
} from './mockData';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token if present
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor with Automatic Standalone Mock Fallback
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // If backend endpoint is missing, fails, or network error occurs, fallback seamlessly to Mock Data
    if (!error.response || error.code === 'ERR_NETWORK' || error.response.status >= 400) {
      const url = error.config.url;
      const method = error.config.method.toUpperCase();
      console.warn(`[UI Standalone Mode] Backend offline or endpoint error at ${method} ${url}. Serving Mock Fallback.`);

      // 1. Auth Login
      if (url.includes('/auth/login') && method === 'POST') {
        const body = JSON.parse(error.config.data || '{}');
        const user = mockUsers[body.email] || {
          userId: 99,
          fullName: body.email ? body.email.split('@')[0] : 'Demo User',
          email: body.email || 'demo@spiceavenue.com',
          role: 'CUSTOMER',
          token: 'mock-jwt-token',
        };
        return { success: true, message: 'Login successful (UI Standalone Mode)', data: user };
      }

      // 2. Auth Profile
      if (url.includes('/auth/profile')) {
        const saved = localStorage.getItem('user');
        const user = saved ? JSON.parse(saved) : mockUsers['customer.john@gmail.com'];
        return { success: true, data: user };
      }

      // 3. Branches
      if (url.includes('/branches') && method === 'GET') {
        if (url.includes('/performance')) {
          return {
            success: true,
            data: { totalOrders: 1450, totalRevenue: 2850000.0, averageRating: 4.8, totalComplaints: 3 },
          };
        }
        if (url.includes('/delivery-areas')) {
          return { success: true, data: mockBranches[0].deliveryAreas };
        }
        return { success: true, data: mockBranches };
      }

      // 4. Categories & Menu Items
      if (url.includes('/categories')) {
        if (method === 'POST') {
          const body = JSON.parse(error.config.data || '{}');
          const newCat = {
            categoryId: Date.now(),
            branchId: body.branchId || 1,
            categoryName: body.categoryName || 'New Category',
            description: body.description || '',
            status: 'ACTIVE',
          };
          mockCategories.push(newCat);
          return { success: true, message: 'Category created successfully', data: newCat };
        }
        return { success: true, data: mockCategories };
      }
      if (url.includes('/menu-items')) {
        if (method === 'POST') {
          const body = JSON.parse(error.config.data || '{}');
          const cat = mockCategories.find(c => c.categoryId === Number(body.categoryId));
          const newItem = {
            itemId: Date.now(),
            branchId: body.branchId || 1,
            categoryId: Number(body.categoryId) || 1,
            categoryName: cat ? cat.categoryName : 'Main Dishes',
            foodName: body.foodName || 'New Food Item',
            description: body.description || '',
            basePrice: Number(body.basePrice) || 1200.0,
            imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
            isAvailable: true,
            status: 'ACTIVE',
            variations: [],
          };
          mockMenuItems.push(newItem);
          return { success: true, message: 'Menu item created successfully', data: newItem };
        }
        return { success: true, data: mockMenuItems };
      }

      // 5. Customer Ordering
      if (url.includes('/customer/addresses')) {
        return {
          success: true,
          data: [
            { addressId: 1, label: 'Home', houseNumber: '24', street: 'Galle Road', areaId: 1, areaName: 'Colombo 03 (Kollupitiya)', isDefault: true },
            { addressId: 2, label: 'Office', houseNumber: '100', street: 'Union Place', areaId: 2, areaName: 'Colombo 07 (Cinnamon Gardens)', isDefault: false },
          ],
        };
      }
      if (url.includes('/customer/orders') && method === 'GET') {
        return { success: true, data: mockOrders };
      }

      // 6. Fulfillment Kitchen Queue
      if (url.includes('/fulfillment/orders/incoming')) {
        return { success: true, data: mockOrders };
      }

      // 7. Rider Portal & Available Riders
      if (url.includes('/delivery/my-tasks')) {
        return { success: true, data: mockRiderTasks };
      }
      if (url.includes('/delivery/my-history')) {
        return { success: true, data: mockRiderHistory };
      }
      if (url.includes('/delivery/riders/available')) {
        return {
          success: true,
          data: [
            { userId: 5, fullName: 'Kamal Fernando', riderStatus: 'AVAILABLE' },
            { userId: 6, fullName: 'Nimal Bandara', riderStatus: 'AVAILABLE' },
          ],
        };
      }

      // 8. Customer Service Supervisor
      if (url.includes('/supervisor/complaints')) {
        return { success: true, data: mockComplaints };
      }
      if (url.includes('/supervisor/feedback-analytics')) {
        return {
          success: true,
          data: { overallRating: 4.7, totalReviews: 128, pendingComplaints: 1, resolvedComplaints: 14, reviews: mockReviews },
        };
      }

      // 9. Admin Endpoints
      if (url.includes('/admin/users')) {
        if (method === 'POST') {
          const body = JSON.parse(error.config.data || '{}');
          const createdUser = {
            userId: Date.now(),
            fullName: body.fullName || 'New Staff User',
            email: body.email || 'staff@spiceavenue.com',
            role: body.role || 'BRANCH_MANAGER',
            status: 'ACTIVE',
            branchName: 'Unassigned',
            createdAt: new Date().toISOString().split('T')[0],
          };
          mockUsersList.unshift(createdUser);
          return { success: true, message: 'Staff user created successfully', data: createdUser };
        }
        return { success: true, data: mockUsersList };
      }
      if (url.includes('/admin/logs')) {
        return { success: true, data: mockAuditLogs };
      }
      if (url.includes('/admin/settings')) {
        return { success: true, data: mockSystemSettings };
      }

      // Default fallback response for POST / PUT / PATCH / DELETE mutations
      return {
        success: true,
        message: 'Action simulated successfully in UI Standalone Mode!',
        data: { id: Date.now() },
      };
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
