import { Product, TokenReservation } from '../types';
import { AdminAuthService } from './adminAuth';

const API_BASE = import.meta.env.VITE_API_URL || 'https://shree-durga-cloth-backend.shreedurgacloth.workers.dev/api';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = AdminAuthService.getToken();
  const headers: Record<string, string> = {
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function handleAuthFailure(res: Response) {
  if (res.status === 401) {
    console.warn('Zero-Trust Authorization failed or session expired. Locking console.');
    AdminAuthService.lock();
  }
}

export interface ScanResult {
  success: boolean;
  valid?: boolean;
  status?: string;
  error?: string;
  claimedAt?: string;
  token?: TokenReservation;
  pricingBreakdown?: {
    originalPrice: number;
    discountedPrice: number;
    cashbackDiscount: number;
    finalPayableAmount: number;
  };
}

export interface MerchantStats {
  activeTokens: number;
  totalClaimedCount: number;
  totalCashbackDistributed: number;
  totalRevenueRecovered: number;
  totalProducts: number;
  inStockCount: number;
}

export const MerchantApi = {
  // 1. Scan customer token
  async scanToken(query: string): Promise<ScanResult> {
    try {
      const res = await fetch(`${API_BASE}/merchant/scan`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ query: query.trim() })
      });
      handleAuthFailure(res);
      return await res.json();
    } catch (e: any) {
      return { success: false, valid: false, error: 'Network connection failed' };
    }
  },

  // 2. Claim & redeem token
  async claimToken(tokenId: string): Promise<{ success: boolean; token?: TokenReservation; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/merchant/claim`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ tokenId })
      });
      handleAuthFailure(res);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: 'Failed to claim token' };
    }
  },

  // 3. Add new garment to inventory and live catalog
  async addProduct(productData: {
    title: string;
    description: string;
    category: string;
    gender: string;
    size: string;
    originalPrice: number;
    discountedPrice: number;
    cashbackAmount: number;
    quantity: number;
    imageUrl: string;
  }): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/merchant/products`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(productData)
      });
      handleAuthFailure(res);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: 'Failed to connect to backend API' };
    }
  },

  // 4. Get merchant dashboard stats
  async getStats(): Promise<MerchantStats> {
    try {
      const res = await fetch(`${API_BASE}/merchant/stats`, {
        headers: getAuthHeaders()
      });
      handleAuthFailure(res);
      const data = await res.json();
      if (data.success && data.stats) return data.stats;
    } catch (e) {
      console.warn('Stats fetch notice', e);
    }
    return {
      activeTokens: 0,
      totalClaimedCount: 0,
      totalCashbackDistributed: 0,
      totalRevenueRecovered: 0,
      totalProducts: 0,
      inStockCount: 0
    };
  },

  // 5. Get public products list
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.success && data.products) return data.products;
    } catch (e) {
      console.warn('Backend products fetch notice', e);
    }
    return [];
  },

  // 6. Delete garment
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthFailure(res);
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to delete product', e);
      return false;
    }
  },

  // 7. Update garment stock
  async updateStock(id: string, quantity: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/products/${id}/stock`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ quantity })
      });
      handleAuthFailure(res);
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to update stock', e);
      return false;
    }
  },

  // 8. Get promotional banners
  async getBanners(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      const data = await res.json();
      if (data.success && data.banners) return data.banners;
    } catch (e) {
      console.warn('Banners fetch notice', e);
    }
    return [];
  },

  // 9. Add promotional banner
  async addBanner(bannerData: any): Promise<{ success: boolean; banner?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/merchant/banners`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(bannerData)
      });
      handleAuthFailure(res);
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to add banner' };
    }
  },

  // 10. Delete promotional banner
  async deleteBanner(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/banners/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      handleAuthFailure(res);
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to delete banner', e);
      return false;
    }
  }
};
