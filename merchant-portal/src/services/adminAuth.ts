// Zero-Trust Admin Authentication Service
// All cryptographic verification is processed server-side in Cloudflare Workers

const API_BASE = import.meta.env.VITE_API_URL || 'https://shree-durga-cloth-backend.shreedurgacloth.workers.dev/api';
const SESSION_KEY = 'sd_admin_auth_session';

export interface AdminSession {
  unlockedAt: number;
  expiresAt: number;
  token: string;
}

export interface VerifyTotpResponse {
  success: boolean;
  token?: string;
  expiresAt?: number;
  message?: string;
  error?: string;
}

export const AdminAuthService = {
  // Check if session token exists and is valid (not expired)
  isUnlocked(): boolean {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    try {
      const session: AdminSession = JSON.parse(raw);
      if (session.token && Date.now() < session.expiresAt) {
        return true;
      }
      this.lock();
      return false;
    } catch (e) {
      return false;
    }
  },

  // Get active signed Zero-Trust Bearer Token
  getToken(): string {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return '';
    try {
      const session: AdminSession = JSON.parse(raw);
      return session.token || '';
    } catch (e) {
      return '';
    }
  },

  // Server-side Zero-Trust TOTP verification
  async verifyAndUnlock(code: string): Promise<{ success: boolean; error?: string }> {
    const cleanCode = code.trim();
    if (!cleanCode) {
      return { success: false, error: 'Please enter a 6-digit code.' };
    }

    try {
      const res = await fetch(`${API_BASE}/admin/verify-totp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode })
      });

      const data: VerifyTotpResponse = await res.json();

      if (data.success && data.token && data.expiresAt) {
        const session: AdminSession = {
          unlockedAt: Date.now(),
          expiresAt: data.expiresAt,
          token: data.token
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { unlocked: true } }));
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Incorrect Authenticator code. Check your phone app & try again.'
      };
    } catch (err: any) {
      console.error('Zero-Trust verification network failure:', err);
      return {
        success: false,
        error: 'Unable to connect to Cloudflare authentication service. Please check connection.'
      };
    }
  },

  // Lock portal and clear active session
  lock() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { unlocked: false } }));
  }
};

