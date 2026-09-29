import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, User, LogOut, MapPin, Clock, Phone, 
  MessageCircle, ShieldCheck, Sparkles, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { UserProfile, ShopInfo } from '../types';
import { AuthService } from '../services/auth';
import { themeService, Theme } from '../services/theme';

interface SettingsViewProps {
  user: UserProfile | null;
  shop: ShopInfo;
  onOpenStoreModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  shop,
  onOpenStoreModal
}) => {
  const [theme, setTheme] = useState<Theme>(themeService.getTheme());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    return themeService.subscribe(setTheme);
  }, []);

  const handleSelectTheme = (newTheme: Theme) => {
    themeService.setTheme(newTheme);
  };

  const handleQuickLogin = (email: string, name: string) => {
    AuthService.signInWithGoogle(email, name);
    setShowLoginModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Settings & Preferences</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Manage display mode, account and showroom details</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-rose-400 flex items-center justify-center font-bold">
          ⚙️
        </div>
      </div>

      {/* 2. THEME SWITCHER (APPEARANCE) - USER SPECIFIED LOCATION */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>App Theme (Display Mode)</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Choose between bright showroom light mode or AMOLED dark mode
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-zinc-800 text-brand-600 dark:text-rose-400 uppercase tracking-wider">
            {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
          </span>
        </div>

        {/* Dual Segmented Selector Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Light Mode Card */}
          <button
            onClick={() => handleSelectTheme('light')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
              theme === 'light'
                ? 'border-brand-600 bg-rose-50/50 shadow-sm ring-2 ring-brand-200'
                : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              {theme === 'light' && (
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
              )}
            </div>
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">Light Mode (Default)</h4>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
              Bright & clean showroom view
            </p>
          </button>

          {/* Dark Mode Card */}
          <button
            onClick={() => handleSelectTheme('dark')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
              theme === 'dark'
                ? 'border-brand-600 bg-zinc-800/90 shadow-sm ring-2 ring-brand-500/30'
                : 'border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-900/60 text-amber-300 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              {theme === 'dark' && (
                <CheckCircle2 className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white">Dark Mode</h4>
            <p className="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">
              Deep AMOLED night view
            </p>
          </button>
        </div>
      </div>

      {/* 3. User Google Account Profile */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Customer Account</h3>
        
        {user ? (
          <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/70 rounded-2xl border border-gray-100 dark:border-zinc-700/80">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shadow-xs"
              />
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Google Account Verified
                </span>
              </div>
            </div>

            <button
              onClick={() => AuthService.signOut()}
              className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-center p-5 bg-gradient-to-r from-rose-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-800/80 rounded-2xl border border-amber-200/80 dark:border-zinc-700 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-700 mx-auto flex items-center justify-center shadow-xs">
              <User className="w-5 h-5 text-brand-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-gray-900 dark:text-white">Sign In with 1-Tap Google</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                Hold clearance items for 24h & get exclusive counter cashback tokens
              </p>
            </div>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-brand-600 hover:bg-black text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Physical Store Details */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Store & Showroom Location</h3>
          <button
            onClick={onOpenStoreModal}
            className="text-xs font-bold text-brand-600 dark:text-rose-400 hover:underline"
          >
            View Details
          </button>
        </div>

        <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-700/80 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-gray-700 dark:text-zinc-300">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">{shop.name}</span>
              <span>{shop.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 pt-1">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{shop.timing}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <a
            href={shop.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-gray-900 dark:bg-brand-600 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Open Maps</span>
          </a>
          <a
            href={`tel:${shop.phone}`}
            className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span>Call Counter</span>
          </a>
        </div>
      </div>

      {/* 5. 24-Hour Clearance Policy */}
      <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-3xl p-5 border border-blue-200/80 dark:border-blue-900/40 space-y-2 text-xs text-blue-950 dark:text-blue-300">
        <h4 className="font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Clearance Guarantee & 24h Policy</span>
        </h4>
        <ul className="space-y-1.5 text-blue-900/90 dark:text-blue-200 text-xs">
          <li>• <b>₹0 Online Advance:</b> All reservations are free. Pay only at shop counter.</li>
          <li>• <b>Physical Inspection:</b> Try garment fit & finish at store before purchase.</li>
          <li>• <b>Auto Expiry:</b> Uncollected pieces are released automatically after 24h.</li>
        </ul>
      </div>

      {/* 6. App Info Footer */}
      <div className="text-center text-xs text-gray-400 dark:text-zinc-500 pt-2 space-y-1">
        <p className="font-semibold text-gray-600 dark:text-zinc-400">Clearance Hub • {shop.name}</p>
        <p className="text-[10px]">App Version 1.2.0 • 100% Free & Open Source O2O Platform</p>
      </div>

      {/* Quick Google Sign-In Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 text-center">
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Sign in with Google</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-4">
              Select one-tap profile to reserve clothes & claim counter cashback
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('rahul.verma@gmail.com', 'Rahul Verma')}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center justify-between"
              >
                <span>Rahul Verma (rahul.verma@gmail.com)</span>
                <span className="text-[10px] text-brand-600">Select</span>
              </button>
              <button
                onClick={() => handleQuickLogin('priya.sharma@gmail.com', 'Priya Sharma')}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center justify-between"
              >
                <span>Priya Sharma (priya.sharma@gmail.com)</span>
                <span className="text-[10px] text-brand-600">Select</span>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
