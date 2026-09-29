export type ProductCategory = 
  | 'Shirt' 
  | 'T-Shirt' 
  | 'Jeans' 
  | 'Trousers' 
  | 'Kurti & Ethnic' 
  | 'Jacket & Winter' 
  | 'Saree' 
  | 'Kids Wear' 
  | 'Other';

export type ProductGender = 'Men' | 'Women' | 'Kids' | 'Unisex';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Free Size' | string;

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: ProductCategory;
  gender: ProductGender;
  size: ProductSize;
  originalPrice: number;
  discountedPrice: number;
  cashbackAmount: number;
  totalQuantity: number;
  availableQuantity: number;
  imageUrl: string;
  status: 'AVAILABLE' | 'SOLD_OUT' | 'ARCHIVED';
  createdAt: string;
}

export type TokenStatus = 'ACTIVE' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';

export interface TokenReservation {
  id: string; // e.g. "TK-849201"
  qrPayload: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  productId: string;
  productTitle: string;
  productSize: string;
  productImage: string;
  originalPrice: number;
  discountedPrice: number;
  cashbackAmount: number;
  finalPayableAmount: number;
  status: TokenStatus;
  bookedAt: string;
  expiresAt: string; // ISO string 24h from bookedAt
  claimedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  fcmToken?: string;
  totalCashbackEarned: number;
  activeTokensCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  targetCategory?: string; // e.g. 'Saree', 'Jeans', 'Shirt', 'All'
  discountText: string;
  cashbackBadge?: string;
  gradient: string; // e.g. 'from-rose-600 to-amber-600'
  isActive: boolean;
  createdAt: string;
}

export interface ShopInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  mapsUrl: string;
  timing: string;
}
