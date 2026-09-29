import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { AdminAuthService } from '../services/adminAuth';

interface AdminLockScreenProps {
  onUnlock: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({ onUnlock }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const cleaned = val.replace(/\D/g, ''); // Numbers only

    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    // If user pasted a full 6-digit code
    if (cleaned.length === 6) {
      const pasted = cleaned.split('').slice(0, 6);
      setDigits(pasted);
      inputRefs.current[5]?.focus();
      triggerVerify(pasted.join(''));
      return;
    }

    const next = [...digits];
    next[index] = cleaned[cleaned.length - 1];
    setDigits(next);

    // Auto advance to next box
    if (index < 5 && cleaned) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 filled
    const allFilled = next.every(d => d !== '');
    if (allFilled) {
      triggerVerify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerVerify = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminAuthService.verifyAndUnlock(code);
      if (res.success) {
        onUnlock();
      } else {
        setError(res.error || 'Incorrect Authenticator code. Check your phone app & try again.');
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (e) {
      setError('Verification connection error. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Lock Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center">
        
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-5">
          <Shield className="w-8 h-8" />
        </div>

        {/* Title & Shop Brand */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Merchant Security Lock
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Shree Durga Cloth Store • Zero-Trust Cloudflare Protection
        </p>

        {/* Instructions */}
        <div className="my-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
            Enter 6-Digit Authenticator Code
          </span>

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center items-center gap-2 sm:gap-2.5">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl border bg-slate-800/80 text-white shadow-inner transition-all focus:outline-none ${
                  digit
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-800'
                    : 'border-slate-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 text-left animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Unlock Button */}
        <button
          onClick={() => triggerVerify(digits.join(''))}
          disabled={loading || digits.some(d => !d)}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            digits.every(d => d) && !loading
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 active:scale-[0.99]'
              : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Verifying with Server...</span>
            </>
          ) : (
            <>
              <span>Unlock Console</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-600" />
          <span>Authorized Counter Personnel Only</span>
        </div>

      </div>

    </div>
  );
};
