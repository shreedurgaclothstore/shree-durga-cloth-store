import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, KeyRound, QrCode, Copy, Check, AlertCircle, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { AdminAuthService } from '../services/adminAuth';

interface AdminLockScreenProps {
  onUnlock: () => void;
}

export const AdminLockScreen: React.FC<AdminLockScreenProps> = ({ onUnlock }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('');
  const [showEmergencyInput, setShowEmergencyInput] = useState(false);
  const [qrConfig, setQrConfig] = useState<{ secret: string; otpauthUrl: string }>({
    secret: 'KRDG4ZDPNU6T2ZLS',
    otpauthUrl: 'otpauth://totp/Shree%20Durga%20Cloth%20Store:CounterAdmin?secret=KRDG4ZDPNU6T2ZLS&issuer=Shree%20Durga%20Cloth%20Store&algorithm=SHA1&digits=6&period=30'
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    inputRefs.current[0]?.focus();

    // Fetch dynamic Cloudflare Worker QR config
    AdminAuthService.getQrSetup().then(cfg => {
      if (cfg && cfg.secret) {
        setQrConfig(cfg);
      }
    });
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

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await AdminAuthService.verifyAndUnlock(emergencyCode.trim());
      if (res.success) {
        onUnlock();
      } else {
        setError(res.error || 'Invalid emergency master passcode.');
      }
    } catch (e) {
      setError('Connection failure during emergency unlock.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(qrConfig.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
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

        {/* Helper Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium"
          >
            <QrCode className="w-4 h-4" />
            <span>Setup / View QR</span>
          </button>

          <button
            onClick={() => setShowEmergencyInput(!showEmergencyInput)}
            className="flex items-center gap-1.5 hover:text-slate-200 transition-colors font-medium"
          >
            <KeyRound className="w-4 h-4" />
            <span>Emergency Passcode</span>
          </button>
        </div>

        {/* Emergency Passcode Form */}
        {showEmergencyInput && (
          <form onSubmit={handleEmergencySubmit} className="mt-4 p-3 bg-slate-900/95 rounded-2xl border border-slate-700/80 text-left space-y-2 animate-in fade-in">
            <p className="text-[11px] text-slate-400">
              Enter backup emergency passcode (provided during initial deployment):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SD-2026-DURGA"
                value={emergencyCode}
                onChange={(e) => setEmergencyCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-white uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-colors"
              >
                Bypass
              </button>
            </div>
          </form>
        )}

      </div>

      {/* QR Code Setup Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">Scan in Google Authenticator</h3>
              <p className="text-xs text-gray-500 mt-1">
                Open Google Authenticator on your phone, tap <b>+</b>, and scan this QR code:
              </p>
            </div>

            {/* QR Code Display */}
            <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl inline-block shadow-inner">
              <QRCodeSVG
                value={qrConfig.otpauthUrl}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Manual Secret Key */}
            <div className="bg-gray-100 p-2.5 rounded-xl border border-gray-200 text-left space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Or enter key manually:
              </span>
              <div className="flex items-center justify-between">
                <code className="text-xs font-mono font-black text-gray-800 tracking-wider">
                  {qrConfig.secret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="p-1 text-gray-500 hover:text-emerald-600"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all"
            >
              Done, Return to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
