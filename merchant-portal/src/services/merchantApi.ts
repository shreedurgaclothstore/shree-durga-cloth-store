import { Product, TokenReservation } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

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
  async scanToken(query: string): Promise<ScanResult> {
    try {
      const res = await fetch(`${API_BASE}/merchant/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      return await res.json();
    } catch (e: any) {
      // Local fallback simulator if backend is offline
      const localTokens: TokenReservation[] = JSON.parse(localStorage.getItem('cloth_local_tokens') || '[]');
      const token = localTokens.find(t => t.id.toLowerCase() === query.trim().toLowerCase() || t.qrPayload === query.trim());
      
      if (!token) {
        return { success: false, valid: false, error: 'Token not found in system.' };
      }

      if (token.status === 'CLAIMED') {
        return { success: true, valid: false, status: 'CLAIMED', error: 'Token was ALREADY CLAIMED!' };
      }

      if (token.status === 'EXPIRED') {
        return { success: true, valid: false, status: 'EXPIRED', error: 'Token has EXPIRED!' };
      }

      return {
        success: true,
        valid: true,
        status: 'ACTIVE',
        token,
        pricingBreakdown: {
          originalPrice: token.originalPrice,
          discountedPrice: token.discountedPrice,
          cashbackDiscount: token.cashbackAmount,
          finalPayableAmount: token.finalPayableAmount
        }
      };
    }
  },

  async claimToken(tokenId: string): Promise<{ success: boolean; token?: TokenReservation; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/merchant/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });
      return await res.json();
    } catch (e: any) {
      const localTokens: TokenReservation[] = JSON.parse(localStorage.getItem('cloth_local_tokens') || '[]');
      const token = localTokens.find(t => t.id === tokenId);
      if (token) {
        token.status = 'CLAIMED';
        token.claimedAt = new Date().toISOString();
        localStorage.setItem('cloth_local_tokens', JSON.stringify(localTokens));
        return { success: true, token };
      }
      return { success: false, error: 'Failed to claim token locally' };
    }
  },

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: 'Failed to connect to backend API' };
    }
  },

  async getStats(): Promise<MerchantStats> {
    try {
      const res = await fetch(`${API_BASE}/merchant/stats`);
      const data = await res.json();
      if (data.success) return data.stats;
    } catch (e) {
      console.warn('Backend offline, returning mock stats');
    }
    return {
      activeTokens: 2,
      totalClaimedCount: 14,
      totalCashbackDistributed: 1150,
      totalRevenueRecovered: 9850,
      totalProducts: 8,
      inStockCount: 6
    };
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (data.success) return data.products;
    } catch (e) {
      console.warn('Backend offline, returning empty products list');
    }
    return [];
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to delete product', e);
      return false;
    }
  },

  async updateStock(id: string, quantity: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/products/${id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to update stock', e);
      return false;
    }
  },

  async getBanners(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/banners`);
      const data = await res.json();
      if (data.success) return data.banners;
    } catch (e) {
      console.warn('Backend offline for banners');
    }
    return [];
  },

  async addBanner(bannerData: any): Promise<{ success: boolean; banner?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/merchant/banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to add banner' };
    }
  },

  async deleteBanner(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/merchant/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      console.error('Failed to delete banner', e);
      return false;
    }
  }
};
