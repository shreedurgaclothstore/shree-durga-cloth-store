import { UserProfile } from '../types';
import { ApiService } from './api';
import { FirebaseService } from './firebase';

const STORAGE_KEY = 'cloth_shop_user';
const CLIENT_ID_KEY = 'cloth_shop_google_client_id';

// Decode Google JWT ID token payload safely (if using GSI)
function decodeGoogleJwt(token: string): { sub?: string; email?: string; name?: string; picture?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn('Failed to parse Google JWT', e);
    return null;
  }
}

export class AuthService {
  private static currentUser: UserProfile | null = null;
  private static listeners: ((user: UserProfile | null) => void)[] = [];
  private static initializedGsi = false;
  private static firebaseAuthListenerBound = false;

  static initFirebaseListener() {
    if (this.firebaseAuthListenerBound) return;
    this.firebaseAuthListenerBound = true;

    FirebaseService.onUserChanged((fbUser) => {
      if (fbUser) {
        this.currentUser = {
          ...fbUser,
          phone: this.currentUser?.phone || fbUser.phone || '',
          totalCashbackEarned: this.currentUser?.totalCashbackEarned || 0,
          activeTokensCount: this.currentUser?.activeTokensCount || 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
        this.notify();
      }
    });

    // Check redirect result if user returned from redirect
    FirebaseService.checkRedirectResult().then(user => {
      if (user) {
        this.currentUser = user;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.notify();
      }
    });
  }

  static getGoogleClientId(): string {
    return localStorage.getItem(CLIENT_ID_KEY) || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  static setGoogleClientId(id: string) {
    if (id) {
      localStorage.setItem(CLIENT_ID_KEY, id.trim());
    } else {
      localStorage.removeItem(CLIENT_ID_KEY);
    }
    this.initializedGsi = false;
    this.initGoogleIdentity();
  }

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
    this.initFirebaseListener();
    this.listeners.push(callback);
    callback(this.getUser());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private static notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  // 1. Sign in with Firebase Google Authentication (Primary method)
  static async signInWithFirebaseGoogle(): Promise<UserProfile> {
    const user = await FirebaseService.signInWithGoogle();
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();

    // Async sync with Cloudflare D1 Backend
    ApiService.syncGoogleUser({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone
    }).catch(err => console.warn('D1 backend sync warning:', err));

    return user;
  }

  // 2. Check if official Google GSI script is loaded on window
  static isGsiAvailable(): boolean {
    return typeof (window as any).google?.accounts?.id !== 'undefined';
  }

  // Initialize official Google Identity Services
  static initGoogleIdentity(onAuthSuccess?: (user: UserProfile) => void) {
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      return false;
    }

    const checkAndInit = () => {
      const google = (window as any).google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential: string }) => {
              if (response?.credential) {
                const user = await this.handleCredential(response.credential);
                if (user && onAuthSuccess) {
                  onAuthSuccess(user);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          this.initializedGsi = true;
          return true;
        } catch (err) {
          console.warn('Google GSI initialize error:', err);
          return false;
        }
      }
      return false;
    };

    if (checkAndInit()) {
      return true;
    }

    const timer = setInterval(() => {
      if (checkAndInit()) {
        clearInterval(timer);
      }
    }, 300);

    setTimeout(() => clearInterval(timer), 5000);
    return false;
  }

  // Render official Google button into a target container
  static renderGoogleButton(
    container: HTMLElement | null,
    options?: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      text?: 'signin_with' | 'signup_with' | 'continue_with';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
    }
  ) {
    if (!container) return;
    const clientId = this.getGoogleClientId();
    if (!clientId) return;

    this.initGoogleIdentity();

    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.renderButton(container, {
          theme: options?.theme || 'outline',
          size: options?.size || 'large',
          text: options?.text || 'continue_with',
          shape: options?.shape || 'pill',
          width: options?.width || 280,
          logo_alignment: 'left'
        });
      } catch (e) {
        console.warn('Failed to render Google button:', e);
      }
    }
  }

  // Trigger Google 1-Tap prompt
  static promptOneTap() {
    const clientId = this.getGoogleClientId();
    if (!clientId) return;

    this.initGoogleIdentity();
    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('Google One-Tap not displayed:', notification.getNotDisplayedReason());
          }
        });
      } catch (e) {
        console.warn('Google One-Tap prompt notice:', e);
      }
    }
  }

  // Process incoming Google credential token
  static async handleCredential(credential: string): Promise<UserProfile | null> {
    const payload = decodeGoogleJwt(credential);
    if (!payload || !payload.email) return null;

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const avatarUrl = payload.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const id = payload.sub ? `google-${payload.sub}` : `google-${btoa(email).substring(0, 10)}`;

    const user: UserProfile = {
      id,
      email,
      name,
      avatarUrl,
      phone: this.currentUser?.phone || '',
      totalCashbackEarned: this.currentUser?.totalCashbackEarned || 0,
      activeTokensCount: 0
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();

    // Async sync with Cloudflare D1 Backend
    ApiService.syncGoogleUser({
      credential,
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone
    }).catch(err => console.warn('D1 backend sync warning:', err));

    return user;
  }

  // Direct Sign-In (Direct or Seamless Fallback)
  static async signInWithGoogle(customEmail?: string, customName?: string, customAvatar?: string): Promise<UserProfile> {
    const email = customEmail || 'customer@gmail.com';
    const name = customName || (customEmail ? customEmail.split('@')[0] : 'Valued Shopper');
    const avatarUrl = customAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const user: UserProfile = {
      id: `google-${btoa(email).substring(0, 10)}`,
      email,
      name,
      avatarUrl,
      phone: this.currentUser?.phone || '',
      totalCashbackEarned: 0,
      activeTokensCount: 0
    };

    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.notify();

    // Sync to backend
    ApiService.syncGoogleUser({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone
    }).catch(err => console.warn('D1 backend sync warning:', err));

    return user;
  }

  static updatePhone(phone: string) {
    if (this.currentUser) {
      this.currentUser.phone = phone;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
      this.notify();

      // Sync phone to backend
      ApiService.syncGoogleUser({
        id: this.currentUser.id,
        email: this.currentUser.email,
        name: this.currentUser.name,
        avatarUrl: this.currentUser.avatarUrl,
        phone
      }).catch(err => console.warn('D1 phone sync warning:', err));
    }
  }

  static async signOut() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();

    try {
      await FirebaseService.signOut();
    } catch (e) {}

    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
  }
}
