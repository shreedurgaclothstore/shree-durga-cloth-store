import { Product, TokenReservation, ShopInfo, Banner } from '../../shared/types';

// Initial shop info
export const DEFAULT_SHOP: ShopInfo = {
  name: 'Royal Heritage Cloth Emporium',
  tagline: 'Exclusive Clearance & Factory Seconds Stock',
  address: 'Shop #14, Main Market, Near Clock Tower, Gandhinagar',
  phone: '+91 98765 43210',
  mapsUrl: 'https://maps.google.com/?q=Shop+14+Main+Market',
  timing: '10:30 AM - 09:30 PM (All 7 Days Open)',
};

// Initial in-memory fallback products (mirrors seed.sql)
export const SEED_PRODUCTS: Product[] = [
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
  },
  {
    id: 'prod-007',
    title: 'Kids Graphic Fleece Warm Hoodie',
    description: 'Super soft brush fleece with kangaroo pocket and vibrant adventure graphic.',
    category: 'Kids Wear',
    gender: 'Kids',
    size: 'S',
    originalPrice: 1299,
    discountedPrice: 399,
    cashbackAmount: 50,
    totalQuantity: 3,
    availableQuantity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-008',
    title: 'Floral Tropical Beach Vacation Shirt',
    description: 'Lightweight rayon fabric, cuban camp collar, relaxed fit for summer outings.',
    category: 'Shirt',
    gender: 'Unisex',
    size: 'M',
    originalPrice: 1499,
    discountedPrice: 449,
    cashbackAmount: 50,
    totalQuantity: 2,
    availableQuantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  }
];


// Seed promotional sliding banners (Flipkart/Amazon style)
export const SEED_BANNERS: Banner[] = [
  {
    id: 'ban-001',
    title: 'Festive Saree & Ethnic Clearance',
    subtitle: 'Pure Banarasi & Embroidered Kurtis at Unbelievable Prices!',
    tag: 'FLAT 65% OFF',
    discountText: 'Starting ₹799',
    cashbackBadge: '+₹200 Counter Cashback',
    targetCategory: 'Saree',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    gradient: 'from-purple-900 via-rose-800 to-amber-700',
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
    gradient: 'from-blue-950 via-indigo-900 to-cyan-800',
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
    gradient: 'from-rose-900 via-brand-700 to-amber-900',
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
    gradient: 'from-emerald-950 via-teal-900 to-blue-900',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// In-Memory store for fast prototyping & seamless local development
class MemoryStore {
  products: Product[] = [...SEED_PRODUCTS];
  tokens: TokenReservation[] = [];
  banners: Banner[] = [...SEED_BANNERS];

  // Banners API
  getBanners(category?: string): Banner[] {
    let list = this.banners.filter(b => b.isActive);
    if (category && category !== 'All') {
      // Prioritize banners matching current category, then 'All'
      const matched = list.filter(b => b.targetCategory?.toLowerCase() === category.toLowerCase());
      const generic = list.filter(b => b.targetCategory === 'All' || !b.targetCategory);
      return [...matched, ...generic];
    }
    return list;
  }

  addBanner(data: Omit<Banner, 'id' | 'createdAt' | 'isActive'>): Banner {
    const newBanner: Banner = {
      ...data,
      id: `ban-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    this.banners.unshift(newBanner);
    return newBanner;
  }

  deleteBanner(id: string): boolean {
    const idx = this.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.banners.splice(idx, 1);
      return true;
    }
    return false;
  }

  getProducts(filters?: { category?: string; gender?: string; size?: string; search?: string }) {
    let list = [...this.products];
    if (!filters) return list;

    if (filters.category && filters.category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.gender && filters.gender !== 'All') {
      list = list.filter(p => p.gender.toLowerCase() === filters.gender!.toLowerCase());
    }
    if (filters.size && filters.size !== 'All') {
      list = list.filter(p => p.size.toLowerCase() === filters.size!.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    return list;
  }

  getProductById(id: string) {
    return this.products.find(p => p.id === id);
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      return true;
    }
    return false;
  }

  updateProductStock(id: string, newTotalQty: number): Product | undefined {
    const product = this.getProductById(id);
    if (product) {
      product.totalQuantity = Math.max(0, newTotalQty);
      product.availableQuantity = Math.max(0, newTotalQty);
      product.status = product.availableQuantity > 0 ? 'AVAILABLE' : 'SOLD_OUT';
      return product;
    }
    return undefined;
  }

  getUserActiveTokensCount(userEmail: string) {
    this.sweepExpired();
    return this.tokens.filter(t => t.userEmail === userEmail && t.status === 'ACTIVE').length;
  }

  getUserTokens(userEmail: string) {
    this.sweepExpired();
    return this.tokens
      .filter(t => t.userEmail === userEmail)
      .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime());
  }

  bookToken(params: {
    productId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
  }): { success: boolean; token?: TokenReservation; error?: string } {
    this.sweepExpired();

    // Check anti-hoarding rule (max 2 active tokens)
    const activeCount = this.getUserActiveTokensCount(params.userEmail);
    if (activeCount >= 2) {
      return { success: false, error: 'Anti-hoarding limit: You already have 2 active tokens. Please visit the store or cancel one.' };
    }

    const product = this.getProductById(params.productId);
    if (!product || product.availableQuantity <= 0) {
      return { success: false, error: 'Sorry! This clearance item is already booked or sold out.' };
    }

    // Atomic decrement
    product.availableQuantity -= 1;
    if (product.availableQuantity <= 0) {
      product.status = 'SOLD_OUT';
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const tokenId = `TK-${randomDigits}`;
    const qrPayload = `CLOTH-TOKEN:${tokenId}:${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const token: TokenReservation = {
      id: tokenId,
      qrPayload,
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      userPhone: params.userPhone,
      productId: product.id,
      productTitle: product.title,
      productSize: product.size,
      productImage: product.imageUrl,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      cashbackAmount: product.cashbackAmount,
      finalPayableAmount: product.discountedPrice - product.cashbackAmount,
      status: 'ACTIVE',
      bookedAt: now.toISOString(),
      expiresAt: expiresAt
    };

    this.tokens.push(token);
    return { success: true, token };
  }

  cancelToken(tokenId: string, userEmail: string): boolean {
    const token = this.tokens.find(t => t.id === tokenId && t.userEmail === userEmail && t.status === 'ACTIVE');
    if (!token) return false;

    token.status = 'CANCELLED';
    const product = this.getProductById(token.productId);
    if (product) {
      product.availableQuantity += 1;
      product.status = 'AVAILABLE';
    }
    return true;
  }

  findTokenForScan(query: string): TokenReservation | undefined {
    this.sweepExpired();
    return this.tokens.find(t => t.id.toLowerCase() === query.toLowerCase() || t.qrPayload === query);
  }

  claimToken(tokenId: string): { success: boolean; token?: TokenReservation; error?: string } {
    this.sweepExpired();
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return { success: false, error: 'Token not found.' };
    if (token.status === 'CLAIMED') return { success: false, error: 'Token has already been claimed and redeemed!' };
    if (token.status === 'EXPIRED') return { success: false, error: 'Token has expired after 24 hours.' };
    if (token.status === 'CANCELLED') return { success: false, error: 'Token was cancelled by the customer.' };

    token.status = 'CLAIMED';
    token.claimedAt = new Date().toISOString();

    // Auto update physical quantity on sale confirmation
    const product = this.getProductById(token.productId);
    if (product) {
      product.totalQuantity = Math.max(0, product.totalQuantity - 1);
      if (product.totalQuantity <= 0 || product.availableQuantity <= 0) {
        product.status = 'SOLD_OUT';
      }
    }

    return { success: true, token };
  }

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'status'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  getMerchantStats() {
    this.sweepExpired();
    const activeTokens = this.tokens.filter(t => t.status === 'ACTIVE').length;
    const claimedTokens = this.tokens.filter(t => t.status === 'CLAIMED');
    const totalClaimedCount = claimedTokens.length;
    const totalCashbackDistributed = claimedTokens.reduce((sum, t) => sum + t.cashbackAmount, 0);
    const totalRevenueRecovered = claimedTokens.reduce((sum, t) => sum + t.finalPayableAmount, 0);
    const totalProducts = this.products.length;
    const inStockCount = this.products.filter(p => p.availableQuantity > 0).length;

    return {
      activeTokens,
      totalClaimedCount,
      totalCashbackDistributed,
      totalRevenueRecovered,
      totalProducts,
      inStockCount
    };
  }

  sweepExpired(): number {
    const now = new Date();
    let expiredCount = 0;
    for (const token of this.tokens) {
      if (token.status === 'ACTIVE' && new Date(token.expiresAt) < now) {
        token.status = 'EXPIRED';
        expiredCount++;
        const product = this.getProductById(token.productId);
        if (product) {
          product.availableQuantity += 1;
          product.status = 'AVAILABLE';
        }
      }
    }
    return expiredCount;
  }
}

export const memoryStore = new MemoryStore();

