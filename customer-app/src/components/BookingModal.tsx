import React, { useState } from 'react';
import { X, Sparkles, Clock, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, UserProfile, TokenReservation } from '../types';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';
import { GoogleSignInModal } from './GoogleSignInModal';

interface BookingModalProps {
  product: Product;
  user: UserProfile | null;
  onClose: () => void;
  onSuccess: (token: TokenReservation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  product,
  user,
  onClose,
  onSuccess
}) => {
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleConfirmBooking = async () => {
    if (!user) {
      setError('Please sign in with Google to reserve this item.');
      return;
    }

    if (phone.trim() && phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number for WhatsApp alerts.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save phone if provided
      if (phone.trim()) {
        AuthService.updatePhone(phone.trim());
      }

      const res = await ApiService.bookToken({
        productId: product.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userPhone: phone.trim()
      });

      if (!res.success || !res.token) {
        setError(res.error || 'Failed to book token. Please try again.');
        setLoading(false);
        return;
      }

      // Trigger Confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onSuccess(res.token);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const netPayable = product.discountedPrice - product.cashbackAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-600 to-rose-600 p-6 text-white text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-300" /> 24-Hour Free Hold
          </div>
          <h3 className="font-extrabold text-xl">Confirm Your Token</h3>
          <p className="text-xs text-rose-100 mt-1">
            Reserve at the shop counter with guaranteed cashback
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Selected Product Summary */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/80 mb-5">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-zinc-700"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-wider">
                {product.category} • Size {product.size}
              </span>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-sm truncate">
                {product.title}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">₹{product.originalPrice}</span>
                <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">₹{product.discountedPrice}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Cashback Breakdown */}
          <div className="space-y-2 text-xs mb-5 bg-amber-50/60 dark:bg-zinc-800 border border-amber-100 dark:border-zinc-700 p-3.5 rounded-2xl">
            <div className="flex justify-between text-gray-600 dark:text-zinc-300">
              <span>Clearance Price at Counter:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{product.discountedPrice}</span>
            </div>
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Guaranteed Store Cashback:
              </span>
              <span>- ₹{product.cashbackAmount}</span>
            </div>
            <div className="border-t border-amber-200/80 dark:border-zinc-700 pt-2 flex justify-between font-extrabold text-sm text-gray-900 dark:text-white">
              <span>Net Effective Price:</span>
              <span className="text-emerald-700 dark:text-emerald-400">₹{netPayable}</span>
            </div>
          </div>

          {/* User Sign In check */}
          {!user ? (
            <div className="text-center p-4 rounded-2xl bg-rose-50 dark:bg-zinc-800 border border-rose-100 dark:border-zinc-700 mb-5">
              <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mb-3">
                Sign in with Google to reserve this piece
              </p>
              <button
                onClick={() => setShowGoogleModal(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-600 border border-gray-200 dark:border-zinc-600 text-xs font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Logged in as <b>{user.name}</b> ({user.email})</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  WhatsApp / Mobile Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
                  We'll send your 24h token reminder before it expires!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirmBooking}
            disabled={loading || !user}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
              loading || !user
                ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30'
            }`}
          >
            {loading ? (
              <span>Generating 24h Token...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Generate 24h Token (₹0 Advance)</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400 dark:text-zinc-500 mt-2.5">
            🔒 Stock will be locked for you for 24 hours. Cancel anytime from your tokens tab.
          </p>

        </div>
      </div>

      {/* Google Sign-In & 1-Tap Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(newUser) => {
          if (newUser.phone) setPhone(newUser.phone);
        }}
      />
    </div>
  );
};
