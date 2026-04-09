export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  categoryName: string;
  subcategoryName?: string;
  thumbnail: string;
  screenshots: string[];
  rating: number;
  reviewCount: number;
  downloads: number;
  featured: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  balance: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  discount: number;
  paymentMethod: 'qris' | 'balance';
  status: 'pending' | 'success' | 'failed';
  voucherCode?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'percentage' | 'nominal';
  value: number;
  expiresAt: string;
  isActive: boolean;
}

export interface CustomOrder {
  id: string;
  userId: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'in_progress' | 'completed';
  messages: CustomOrderMessage[];
  fileUrl?: string;
  createdAt: string;
}

export interface CustomOrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface BalanceHistory {
  id: string;
  userId: string;
  type: 'topup' | 'purchase';
  amount: number;
  description: string;
  createdAt: string;
}
