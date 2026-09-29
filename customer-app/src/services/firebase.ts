import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { UserProfile } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyDxZxZL7GxGrvzoma-Czzi9J1PMWVd80W0",
  authDomain: "shree-durga-cloth-store.firebaseapp.com",
  projectId: "shree-durga-cloth-store",
  storageBucket: "shree-durga-cloth-store.firebasestorage.app",
  messagingSenderId: "935052817951",
  appId: "1:935052817951:web:3505c901ccfb7c4bd7c72a",
  measurementId: "G-ZV977FRSKP"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function mapFirebaseUser(user: User): UserProfile {
  const email = user.email || '';
  const name = user.displayName || (email ? email.split('@')[0] : 'Customer');
  const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  return {
    id: user.uid,
    email,
    name,
    avatarUrl,
    phone: user.phoneNumber || '',
    totalCashbackEarned: 0,
    activeTokensCount: 0
  };
}

export const FirebaseService = {
  auth,

  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return mapFirebaseUser(result.user);
    } catch (popupError: any) {
      console.warn('Popup login failed or blocked, attempting fallback:', popupError);
      // If popup was blocked or closed, rethrow or allow redirect
      if (popupError?.code === 'auth/popup-blocked' || popupError?.code === 'auth/popup-closed-by-user') {
        throw popupError;
      }
      throw popupError;
    }
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  onUserChanged(callback: (user: UserProfile | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  async checkRedirectResult(): Promise<UserProfile | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        return mapFirebaseUser(result.user);
      }
    } catch (e) {
      console.warn('Redirect auth check notice:', e);
    }
    return null;
  }
};
