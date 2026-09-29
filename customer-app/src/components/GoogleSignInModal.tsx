import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { AuthService } from '../services/auth';
import { UserProfile } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAuthError(null);
    setLoading(false);

    // Initialize GIS if configured
    const initAndRender = () => {
      AuthService.initGoogleIdentity((user) => {
        if (onSuccess) onSuccess(user);
        onClose();
      });

      if (googleBtnRef.current && AuthService.getGoogleClientId()) {
        AuthService.renderGoogleButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: 320
        });
      }

      AuthService.promptOneTap();
    };

    const timer = setTimeout(initAndRender, 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Official Google Authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await AuthService.signInWithFirebaseGoogle();
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign-In error:', err);
      const code = err?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in was closed. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Popup was blocked. Please allow popups or use in-app sign in.');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Google sign-in is not enabled in Firebase Console.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized in Firebase.');
      } else {
        setAuthError(err?.message || 'Could not complete Google Sign-In. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasGsiClientId = !!AuthService.getGoogleClientId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-200/80 dark:border-zinc-800 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Emblem */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-800/80 mx-auto flex items-center justify-center shadow-xs border border-rose-100 dark:border-zinc-700">
            <svg className="w-9 h-9" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Sign in with Google
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">
            Reserve clearance deadstock for 24h & claim instant counter cashback at Shree Durga Cloth Store.
          </p>
        </div>

        {/* Benefits Badges */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] font-bold text-gray-700 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50/70 dark:bg-zinc-800/60 border border-rose-100/80 dark:border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>24h Zero-Risk Hold</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50/70 dark:bg-zinc-800/60 border border-emerald-100/80 dark:border-zinc-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Instant Cashback QR</span>
          </div>
        </div>

        {/* Error Notice */}
        {authError && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium">{authError}</p>
          </div>
        )}

        {/* Primary Action: Official Google Sign-In Button */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-700 hover:border-gray-300 text-gray-900 dark:text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google Account</span>
              </>
            )}
          </button>
          
          {hasGsiClientId && (
            <div className="flex justify-center pt-1" ref={googleBtnRef}></div>
          )}

          <p className="text-[11px] text-center text-gray-400 dark:text-zinc-500">
            Official Google Authentication • SSL Encrypted
          </p>
        </div>

      </div>
    </div>
  );
};
