import apiClient from './apiClient';

/** Alias REST: /api/user/* (sama isi dengan /api/auth/* untuk beberapa endpoint). */
export const userService = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) =>
    apiClient.put('/user/profile', data),
  getBalance: () => apiClient.get('/user/balance'),
  getBalanceHistory: (limit = 50, offset = 0) =>
    apiClient.get('/user/balance-history', { params: { limit, offset } }),
  getNotifications: (limit = 20, offset = 0) =>
    apiClient.get('/user/notifications', { params: { limit, offset } }),
};

export const authService = {
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  loginWithGoogle: (data: { name: string; email: string; google_id: string; avatar_url?: string }) =>
    apiClient.post('/auth/login-google', data),

  getProfile: () =>
    apiClient.get('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) =>
    apiClient.put('/auth/profile', data),

  getBalance: () =>
    apiClient.get('/auth/balance'),

  getBalanceHistory: (limit = 50, offset = 0) =>
    apiClient.get('/auth/balance-history', { params: { limit, offset } }),
};

export const categoryService = {
  getAll: () =>
    apiClient.get('/categories'),

  getById: (id: number) =>
    apiClient.get(`/categories/${id}`),

  create: (data: any) =>
    apiClient.post('/categories', data),

  update: (id: number, data: any) =>
    apiClient.put(`/categories/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),

  getSubCategories: (categoryId: number) =>
    apiClient.get(`/categories/${categoryId}/subcategories`),

  createSubCategory: (data: any) =>
    apiClient.post('/categories/subcategories', data),

  updateSubCategory: (id: number, data: any) =>
    apiClient.put(`/categories/subcategories/${id}`, data),

  deleteSubCategory: (id: number) =>
    apiClient.delete(`/categories/subcategories/${id}`),
};

export const publicService = {
  getLanding: () => apiClient.get('/public/landing'),
  getPublicTheme: () => apiClient.get('/settings/public'),
};

export const productService = {
  getAll: (categoryId?: number, search?: string, limit = 20, offset = 0) =>
    apiClient.get('/products', { params: { category_id: categoryId, search, limit, offset } }),

  getById: (id: string | number) =>
    apiClient.get(`/products/${id}`),

  create: (formData: FormData) =>
    apiClient.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: number, formData: FormData) =>
    apiClient.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: number) =>
    apiClient.delete(`/products/${id}`),

  getReviews: (productId: number) =>
    apiClient.get(`/products/${productId}/reviews`),

  addReview: (productId: number, data: { rating: number; comment?: string }) =>
    apiClient.post(`/products/${productId}/reviews`, data),
};

export const cartService = {
  getItems: () =>
    apiClient.get('/cart/items'),

  addItem: (data: { product_id: number; quantity?: number }) =>
    apiClient.post('/cart/items', data),

  updateQuantity: (cartId: number, quantity: number) =>
    apiClient.put(`/cart/items/${cartId}`, { quantity }),

  removeItem: (cartId: number) =>
    apiClient.delete(`/cart/items/${cartId}`),

  clearCart: () =>
    apiClient.delete('/cart'),
};

export const checkoutService = {
  checkout: (data: { payment_method: 'midtrans_qris' | 'balance'; voucher_code?: string }) =>
    apiClient.post('/cart/checkout', data),

  getTransactions: (limit = 20, offset = 0) =>
    apiClient.get('/cart/transactions', { params: { limit, offset } }),

  getTransactionDetail: (transactionId: number) =>
    apiClient.get(`/cart/transactions/${transactionId}`),

  downloadProduct: (productId: number, transactionId: number) =>
    apiClient.get(`/cart/download/${productId}`, { params: { transactionId } }),
};

export const adminService = {
  getDashboardStats: () =>
    apiClient.get('/admin/dashboard'),

  getSettings: () =>
    apiClient.get('/admin/settings'),

  updateSettingsBulk: (payload: Record<string, string>) =>
    apiClient.put('/admin/settings/bulk/update', payload),

  getTransactions: (limit = 20, offset = 0) =>
    apiClient.get('/admin/transactions', { params: { limit, offset } }),

  updateTransactionStatus: (transactionId: number, status: string) =>
    apiClient.put(`/admin/transactions/${transactionId}/status`, { status }),

  getUsers: (limit = 20, offset = 0) =>
    apiClient.get('/admin/users', { params: { limit, offset } }),

  updateUser: (
    userId: number,
    body: { name?: string; email?: string; phone?: string; role?: string; is_active?: boolean; is_blocked?: boolean }
  ) => apiClient.put(`/admin/users/${userId}`, body),

  deactivateUser: (userId: number) =>
    apiClient.delete(`/admin/users/${userId}`),

  toggleUserBlock: (userId: number) =>
    apiClient.put(`/admin/users/${userId}/block`),

  addUserBalance: (userId: number, amount: number, reason?: string) =>
    apiClient.post(`/admin/users/${userId}/balance/add`, { amount, reason }),

  subtractUserBalance: (userId: number, amount: number, reason?: string) =>
    apiClient.post(`/admin/users/${userId}/balance/subtract`, { amount, reason }),

  // Vouchers
  createVoucher: (data: any) =>
    apiClient.post('/admin/vouchers', data),

  getVouchers: (limit = 20, offset = 0) =>
    apiClient.get('/admin/vouchers', { params: { limit, offset } }),

  updateVoucher: (id: number, data: any) =>
    apiClient.put(`/admin/vouchers/${id}`, data),

  deleteVoucher: (id: number) =>
    apiClient.delete(`/admin/vouchers/${id}`),

  // Custom Orders
  getCustomOrders: (limit = 20, offset = 0) =>
    apiClient.get('/admin/custom-orders', { params: { limit, offset } }),

  getCustomOrderDetail: (orderId: number) =>
    apiClient.get(`/admin/custom-orders/${orderId}`),

  updateCustomOrderStatus: (orderId: number, status: string, result_file_url?: string) =>
    apiClient.put(`/admin/custom-orders/${orderId}/status`, { status, result_file_url }),

  addCustomOrderMessage: (orderId: number, formData: FormData) =>
    apiClient.post(`/admin/custom-orders/${orderId}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  /** Notifikasi in-app: semua pengguna atau satu user_id. */
  sendNotificationBroadcast: (data: {
    title: string;
    message: string;
    send_to_all: boolean;
    user_id?: number;
  }) => apiClient.post('/admin/notifications/broadcast', data),

  getContactInfoList: () => apiClient.get('/admin/contact-info'),
  createContactInfo: (body: {
    title: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => apiClient.post('/admin/contact-info', body),
  updateContactInfo: (
    id: number,
    body: Partial<{ title: string; description: string; phone: string; email: string; address: string }>
  ) => apiClient.put(`/admin/contact-info/${id}`, body),
  deleteContactInfo: (id: number) => apiClient.delete(`/admin/contact-info/${id}`),
};

export const customOrderService = {
  create: (data: FormData) =>
    apiClient.post('/custom-orders', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  getMyOrders: (limit = 20, offset = 0) =>
    apiClient.get('/custom-orders/my-orders', { params: { limit, offset } }),

  getDetail: (orderId: number) =>
    apiClient.get(`/custom-orders/${orderId}`),

  addMessage: (orderId: number, formData: FormData) =>
    apiClient.post(`/custom-orders/${orderId}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  downloadResult: (id: number) =>
    apiClient.get(`/custom-orders/download/${id}`, { responseType: 'blob' }),
};

export const paymentService = {
  topup: (amount: number) =>
    apiClient.post('/topup', { amount }),
};

export const ordersService = {
  /** Direct buy — Snap QRIS */
  create: (body: { product_id: number; quantity?: number }) =>
    apiClient.post('/orders', body),
  /** Riwayat pesanan (tabel orders) */
  listMine: (limit = 50, offset = 0) =>
    apiClient.get('/orders/user', { params: { limit, offset } }),
};

export const reviewsApi = {
  create: (body: { product_id: number; rating: number; comment?: string }) =>
    apiClient.post('/reviews', body),
};

/** GET /api/transactions — riwayat untuk user login. */
export const transactionService = {
  list: (limit = 20, offset = 0) =>
    apiClient.get('/transactions', { params: { limit, offset } }),
  getById: (id: number) => apiClient.get(`/transactions/${id}`),
};
