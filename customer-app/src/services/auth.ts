import { UserProfile } from '../types';

const STORAGE_KEY = 'cloth_shop_user';

export class AuthService {
  private static currentUser: UserProfile | null = null;
  private static listeners: ((user: UserProfile | null) => void)[] = [];

  static getUser(): UserProfile | null {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        this.currentUser = null;
      }
    }
    return this.currentUser;
  }

  static subscribe(callback: (user: UserProfile | null) => void) {
    this.listeners.push(callback);
    callback(this.getUser());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  // 1-Tap Google Sign-In
  static async signInWithGoogle(customEmail?: string, customName?: string): Promise<UserProfile> {
    const email = customEmail || 'rahul.verma@gmail.com';
    const name = customName || 'Rahul Verma';
    const user: UserProfile = {
      id: `google-${btoa(email).substring(0, 10)}`,
      email,
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      phone: '',
      totalCashbackEarned: 0,
      activeTokensCount: 0
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();
    return user;
  }

  static updatePhone(phone: string) {
    if (this.currentUser) {
      this.currentUser.phone = phone;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();
    }
  }

  static signOut() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }
}
