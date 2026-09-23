import { Product, Category, Outlet, Order, ContactMessage, AdminStats, Review } from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('tsg_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Products
  async getProducts(params?: {
    category?: string;
    outlet?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    bestSeller?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.outlet) query.append('outlet', params.outlet);
    if (params?.search) query.append('search', params.search);
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.inStock) query.append('inStock', 'true');
    if (params?.featured) query.append('featured', 'true');
    if (params?.bestSeller) query.append('bestSeller', 'true');
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(idOrSlug: string): Promise<{ product: Product }> {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: any): Promise<{ product: Product }> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: string, data: any): Promise<{ product: Product }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: any): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, data: any): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Outlets
  async getOutlets(): Promise<{ outlets: Outlet[] }> {
    const res = await fetch(`${API_BASE}/outlets`);
    if (!res.ok) throw new Error('Failed to fetch outlets');
    return res.json();
  },

  // Orders
  async createOrder(data: any): Promise<{ order: Order; message: string }> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async trackOrder(orderNumber: string): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Order not found');
    }
    return res.json();
  },

  async getAdminOrders(params?: { status?: string; search?: string; outlet?: string }): Promise<{ orders: Order[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.outlet) query.append('outlet', params.outlet);

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin orders');
    return res.json();
  },

  async updateOrderStatus(id: string, data: { order_status?: string; payment_status?: string }): Promise<{ order: Order }> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Messages
  async submitContact(data: { name: string; email: string; phone?: string; subject: string; message: string }): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async getMessages(): Promise<{ messages: ContactMessage[] }> {
    const res = await fetch(`${API_BASE}/messages`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async markMessageRead(id: string, is_read: boolean): Promise<any> {
    const res = await fetch(`${API_BASE}/messages/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ is_read }),
    });
    return res.json();
  },

  async deleteMessage(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return res.json();
  },

  // Reviews
  async getReviews(): Promise<{ reviews: Review[] }> {
    const res = await fetch(`${API_BASE}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  // Admin Auth & Stats
  async adminLogin(username: string, password: string): Promise<{ token: string; admin: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },
};
