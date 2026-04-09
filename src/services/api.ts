import apiClient from './apiClient';

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

export const productService = {
  getAll: (categoryId?: number, search?: string, limit = 20, offset = 0) =>
    apiClient.get('/products', { params: { category_id: categoryId, search, limit, offset } }),

  getById: (id: number) =>
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

  getTransactions: (limit = 20, offset = 0) =>
    apiClient.get('/admin/transactions', { params: { limit, offset } }),

  updateTransactionStatus: (transactionId: number, status: string) =>
    apiClient.put(`/admin/transactions/${transactionId}/status`, { status }),

  getUsers: (limit = 20, offset = 0) =>
    apiClient.get('/admin/users', { params: { limit, offset } }),

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
};

export const customOrderService = {
  create: (data: { title: string; description: string; budget: number }) =>
    apiClient.post('/custom-orders', data),

  getMyOrders: (limit = 20, offset = 0) =>
    apiClient.get('/custom-orders/my-orders', { params: { limit, offset } }),

  getDetail: (orderId: number) =>
    apiClient.get(`/custom-orders/${orderId}`),

  addMessage: (orderId: number, formData: FormData) =>
    apiClient.post(`/custom-orders/${orderId}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const paymentService = {
  topup: (amount: number) =>
    apiClient.post('/admin/topup', { amount }),

  topupCallback: (orderId: string) =>
    apiClient.post('/admin/topup/callback', { order_id: orderId }),
};
