export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  balance: number;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  thumbnail_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface SubCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  sub_category_id?: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  file_url?: string;
  thumbnail_url?: string;
  views: number;
  is_active: boolean;
  created_by: number;
  created_at: string;
  category_name?: string;
  sub_category_name?: string;
  reviews?: Review[];
  stats?: ReviewStats;
}

export interface Cart {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  thumbnail_url?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  user_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  order_id: string;
  gross_amount: number;
  payment_method: 'midtrans_qris' | 'balance';
  status: 'pending' | 'success' | 'failed' | 'expired';
  created_at: string;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface CustomOrder {
  id: number;
  user_id: number;
  order_number: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  result_file_url?: string;
  created_at: string;
}

export interface CustomOrderMessage {
  id: number;
  custom_order_id: number;
  user_id: number;
  message: string;
  file_url?: string;
  user_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface BalanceHistory {
  id: number;
  user_id: number;
  type: 'topup' | 'purchase' | 'refund';
  amount: number;
  description: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
}
