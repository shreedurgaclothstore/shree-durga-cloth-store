import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, ShieldCheck, Check, Settings, ChevronDown, ChevronUp, AlertCircle, Loader2 } from 'lucide-react';
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
  const [clientId, setClientId] = useState(AuthService.getGoogleClientId());
  const [showConfig, setShowConfig] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [savedConfigMessage, setSavedConfigMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setAuthError(null);
    setLoading(false);

    // Initialize GIS if client ID is configured
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
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  // 1. Official Firebase Google Popup Authentication
  const handleFirebaseGoogleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await AuthService.signInWithFirebaseGoogle();
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Google Sign-In error:', err);
      const code = err?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (code === 'auth/operation-not-allowed') {
        setAuthError('Google sign-in is not enabled yet in Firebase Console. (Authentication > Sign-in method > Enable Google)');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized in Firebase. Add this domain under Firebase Console > Authentication > Settings > Authorized domains.');
      } else {
        setAuthError(err?.message || 'Could not complete Google Sign-In. You can use the direct option below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClientId = () => {
    AuthService.setGoogleClientId(clientId);
    setSavedConfigMessage(true);
    setTimeout(() => setSavedConfigMessage(false), 2500);
  };

  const handleQuickLogin = async (email: string, name: string) => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithGoogle(email, name);
      if (onSuccess) onSuccess(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const hasGsiClientId = !!AuthService.getGoogleClientId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-200/80 dark:border-zinc-800 relative transition-all max-h-[90vh] overflow-y-auto"
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

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-50 to-rose-100 dark:from-zinc-800 dark:to-zinc-800/80 mx-auto flex items-center justify-center shadow-xs border border-rose-100 dark:border-zinc-700">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
        <div className="grid grid-cols-2 gap-2 mb-5 text-[11px] font-bold text-gray-700 dark:text-zinc-300">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50/70 dark:bg-zinc-800/60 border border-rose-100/80 dark:border-zinc-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-rose-400 shrink-0" />
            <span>24h Zero-Risk Hold</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50/70 dark:bg-zinc-800/60 border border-emerald-100/80 dark:border-zinc-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Instant Cashback QR</span>
          </div>
        </div>

        {/* Error Notice */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{authError}</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                You can also continue instantly below by selecting or typing your Google account.
              </p>
            </div>
          </div>
        )}

        {/* Primary Action: Official Google Sign-In Popup */}
        <div className="space-y-3 mb-5">
          <button
            onClick={handleFirebaseGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 border-2 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-98 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
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

          <p className="text-[10px] text-center text-gray-400 dark:text-zinc-500">
            Official Firebase Authentication • SSL Encrypted
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white dark:bg-zinc-900 px-3 text-gray-400 dark:text-zinc-500">
              Or Fast Direct Profile
            </span>
          </div>
        </div>

        {/* Quick Google Test Profiles */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('karan.sharma@gmail.com', 'Karan Sharma')}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-brand-500 bg-gray-50 dark:bg-zinc-800 hover:bg-rose-50/40 dark:hover:bg-zinc-700/60 flex items-center gap-2.5 text-left transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                K
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Karan Sharma</p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">karan.sharma@gmail.com</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickLogin('shree.customer@gmail.com', 'Shree Durga Customer')}
              disabled={loading}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-brand-500 bg-gray-50 dark:bg-zinc-800 hover:bg-rose-50/40 dark:hover:bg-zinc-700/60 flex items-center gap-2.5 text-left transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                S
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Shree Durga Customer</p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-400 truncate">shree.customer@gmail.com</p>
              </div>
            </button>
          </div>

          {/* Custom Google Email Form */}
          <div className="pt-1 space-y-2">
            <input
              type="text"
              placeholder="Your Full Name (e.g. Ramesh Patel)"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-zinc-800"
            />
            <input
              type="email"
              placeholder="Your Google Email (e.g. name@gmail.com)"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-zinc-700 bg-gray-50/60 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-zinc-800"
            />
            <button
              onClick={() => {
                if (inputEmail.trim()) {
                  handleQuickLogin(inputEmail.trim(), inputName.trim() || inputEmail.split('@')[0]);
                }
              }}
              disabled={!inputEmail.trim() || loading}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>Continue with Entered Google Email</span>
            </button>
          </div>
        </div>

        {/* Optional Google Cloud OAuth Client ID Manager */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Firebase / Google Project Details</span>
            </span>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showConfig && (
            <div className="mt-2.5 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 space-y-2 animate-in fade-in">
              <div className="text-[10px] text-gray-500 dark:text-zinc-400 space-y-1">
                <p>• <b>Project ID:</b> <code className="bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">shree-durga-cloth-store</code></p>
                <p>• <b>Auth Domain:</b> <code className="bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">shree-durga-cloth-store.firebaseapp.com</code></p>
                <p className="pt-1 text-gray-600 dark:text-zinc-300">
                  Tip: Ensure Google provider is enabled in Firebase Console (Authentication &gt; Sign-in method &gt; Google) and <code className="text-brand-600">shree-durga-clearance.pages.dev</code> is added under Authorized domains.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-zinc-700">
                <label className="block text-[10px] font-bold text-gray-600 dark:text-zinc-400 mb-1">
                  Optional GSI Client ID Override:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-[11px] font-mono border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    onClick={handleSaveClientId}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    {savedConfigMessage ? <Check className="w-3 h-3" /> : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
