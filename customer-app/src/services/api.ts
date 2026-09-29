import { Product, TokenReservation, ShopInfo, Banner, UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787/api';

export const ApiService = {
  async getBanners(category?: string): Promise<Banner[]> {
    try {
      const url = category && category !== 'All' 
        ? `${API_BASE}/banners?category=${encodeURIComponent(category)}`
        : `${API_BASE}/banners`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.banners?.length > 0) return data.banners;
    } catch (e) {
      console.warn('Backend not reached for banners, using fallback');
    }
    return [
      {
        id: 'ban-001',
        title: 'Festive Saree & Ethnic Clearance',
        subtitle: 'Pure Banarasi & Embroidered Kurtis at Unbelievable Prices!',
        tag: 'FLAT 65% OFF',
        discountText: 'Starting ₹799',
        cashbackBadge: '+₹200 Counter Cashback',
        targetCategory: 'Saree',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
        gradient: 'from-purple-950 via-rose-900 to-amber-800',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ban-002',
        title: 'Branded Denim Flash Drop',
        subtitle: 'Premium Stretch Jeans Clearance • 24h Hold Available',
        tag: 'HOT CLEARANCE',
        discountText: 'Flat 67% OFF',
        cashbackBadge: '+₹100 Instant Cashback',
        targetCategory: 'Jeans',
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80',
        gradient: 'from-blue-950 via-indigo-900 to-cyan-900',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ban-003',
        title: '24-Hour Free Hold Guarantee',
        subtitle: 'Book online from home • Pay ₹0 advance • Collect & save at store!',
        tag: 'ZERO ADVANCE',
        discountText: 'Hold Any Piece 24h',
        cashbackBadge: 'Guaranteed Cashback',
        targetCategory: 'All',
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
        gradient: 'from-rose-950 via-brand-800 to-amber-900',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'ban-004',
        title: 'Linen & Pure Cotton Shirts',
        subtitle: 'Breathable formal & casual shirts liquidation batch',
        tag: 'MIN. 60% OFF',
        discountText: 'Under ₹599',
        cashbackBadge: '+₹75 Cashback',
        targetCategory: 'Shirt',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
        gradient: 'from-emerald-950 via-teal-900 to-blue-950',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
  },

  async getShopInfo(): Promise<ShopInfo> {
    try {
      const res = await fetch(`${API_BASE}/shop`);
      const data = await res.json();
      if (data.success) return data.shop;
    } catch (e) {
      console.warn('Backend not reached, using default shop info');
    }
    return {
      name: 'Royal Heritage Cloth Emporium',
      tagline: 'Exclusive Clearance & Factory Seconds Stock',
      address: 'Shop #14, Main Market, Near Clock Tower, Gandhinagar',
      phone: '+91 98765 43210',
      mapsUrl: 'https://maps.google.com/?q=Shop+14+Main+Market',
      timing: '10:30 AM - 09:30 PM (All 7 Days Open)',
    };
  },

  async getProducts(filters?: { category?: string; gender?: string; size?: string; search?: string }): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.gender) params.append('gender', filters.gender);
      if (filters?.size) params.append('size', filters.size);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) return data.products;
    } catch (e) {
      console.warn('Backend not reached for products, falling back to local dataset');
    }

    // Local fallback dataset if backend server is starting
    return [
      {
        id: 'prod-001',
        title: "Levi's Slim Fit Dark Indigo Jeans",
        description: "Original stock clearance. Premium stretch denim with classic 5-pocket styling.",
        category: 'Jeans',
        gender: 'Men',
        size: '32',
        originalPrice: 2999,
        discountedPrice: 999,
        cashbackAmount: 100,
        totalQuantity: 2,
        availableQuantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-002',
        title: 'Pure Linen Sky Blue Casual Shirt',
        description: '100% Breathable European linen. Full sleeves, tailored fit, mother of pearl buttons.',
        category: 'Shirt',
        gender: 'Men',
        size: 'L',
        originalPrice: 1799,
        discountedPrice: 599,
        cashbackAmount: 75,
        totalQuantity: 3,
        availableQuantity: 3,
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-003',
        title: 'Anarkali Golden Embroidered Festive Kurti',
        description: 'Festive clearance! Rayon cotton blend with delicate zari work around the neckline.',
        category: 'Kurti & Ethnic',
        gender: 'Women',
        size: 'M',
        originalPrice: 2499,
        discountedPrice: 799,
        cashbackAmount: 100,
        totalQuantity: 1,
        availableQuantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-004',
        title: 'Vintage Suede Bomber Winter Jacket',
        description: 'End of season clearance. Sherpa-lined collar with heavy metal zipper.',
        category: 'Jacket & Winter',
        gender: 'Men',
        size: 'XL',
        originalPrice: 3999,
        discountedPrice: 1399,
        cashbackAmount: 150,
        totalQuantity: 1,
        availableQuantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-005',
        title: 'Classic Khaki Slim-Fit Chino Trousers',
        description: 'Stretch cotton twill fabric with wrinkle-resistant finish.',
        category: 'Trousers',
        gender: 'Men',
        size: '34',
        originalPrice: 1999,
        discountedPrice: 649,
        cashbackAmount: 75,
        totalQuantity: 2,
        availableQuantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-006',
        title: 'Banarasi Silk Weave Party Wear Saree',
        description: 'Clearance batch. Rich floral golden brocade pallu with matching blouse piece.',
        category: 'Saree',
        gender: 'Women',
        size: 'Free Size',
        originalPrice: 4999,
        discountedPrice: 1799,
        cashbackAmount: 200,
        totalQuantity: 2,
        availableQuantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
        createdAt: new Date().toISOString()
      }
    ];
  },

  async bookToken(params: {
    productId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
  }): Promise<{ success: boolean; token?: TokenReservation; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/tokens/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (e: any) {
      // Local fallback token generation if offline/local
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const tokenId = `TK-${randomDigits}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const mockToken: TokenReservation = {
        id: tokenId,
        qrPayload: `CLOTH-TOKEN:${tokenId}:${Date.now()}`,
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        userPhone: params.userPhone,
        productId: params.productId,
        productTitle: 'Reserved Clearance Garment',
        productSize: 'M',
        productImage: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
        originalPrice: 1999,
        discountedPrice: 699,
        cashbackAmount: 100,
        finalPayableAmount: 599,
        status: 'ACTIVE',
        bookedAt: new Date().toISOString(),
        expiresAt
      };

      // Save locally
      const stored = localStorage.getItem('cloth_local_tokens') || '[]';
      const list = JSON.parse(stored);
      list.unshift(mockToken);
      localStorage.setItem('cloth_local_tokens', JSON.stringify(list));

      return { success: true, token: mockToken };
    }
  },

  async getMyTokens(userEmail: string): Promise<TokenReservation[]> {
    try {
      const res = await fetch(`${API_BASE}/tokens/my?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) return data.tokens;
    } catch (e) {
      console.warn('Backend not reached for tokens, reading local store');
    }

    const stored = localStorage.getItem('cloth_local_tokens') || '[]';
    return JSON.parse(stored);
  },

  async cancelToken(tokenId: string, userEmail: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/tokens/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, userEmail })
      });
      const data = await res.json();
      return !!data.success;
    } catch (e) {
      const stored = localStorage.getItem('cloth_local_tokens') || '[]';
      let list: TokenReservation[] = JSON.parse(stored);
      list = list.map(t => t.id === tokenId ? { ...t, status: 'CANCELLED' } : t);
      localStorage.setItem('cloth_local_tokens', JSON.stringify(list));
      return true;
    }
  },

  async syncGoogleUser(params: {
    credential?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
    id?: string;
    phone?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      console.warn('Backend sync failed, using offline fallback', e);
      return {
        success: true,
        user: {
          id: params.id || `google-${Date.now()}`,
          email: params.email || '',
          name: params.name || 'Shopper',
          avatarUrl: params.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(params.name || 'User')}`,
          phone: params.phone || '',
          totalCashbackEarned: 0,
          activeTokensCount: 0
        }
      };
    }
  }
};
