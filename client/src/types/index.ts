export interface Variant {
  id: string;
  name: string;
  price: number;
  weight?: string;
  cut?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  outlet_id?: string | null;
  short_description: string;
  description: string;
  base_price: number;
  original_price?: number | null;
  unit: string;
  in_stock: boolean;
  stock_quantity: number;
  is_featured: boolean;
  is_best_seller: boolean;
  freshness_badge: string;
  image_url: string;
  gallery: string[];
  variants: Variant[];
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  product_count?: number;
}

export interface Outlet {
  id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: string;
  is_active: boolean | number;
}

export interface CartItem {
  id: string; // product.id + (variant?.id || '')
  product: Product;
  variant: Variant | null;
  price: number;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  variant_name?: string;
  price: number;
  quantity: number;
  image_url: string;
  weight?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  outlet_id: string;
  outlet_name?: string;
  outlet_phone?: string;
  delivery_date: string;
  delivery_time_slot: string;
  payment_method: 'cod' | 'card' | 'bank';
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  items: OrderItem[];
  special_notes?: string;
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  location: string;
  rating: number;
  review_text: string;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean | number;
  created_at: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockCount: number;
  unreadMessages: number;
  ordersByStatus: { order_status: string; count: number }[];
  revenueByOutlet: { outlet_name: string; revenue: number; orders_count: number }[];
  recentOrders: any[];
}
