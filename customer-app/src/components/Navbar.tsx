import React, { useState, useEffect } from 'react';
import { Ticket, Sparkles, MapPin, User, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { UserProfile, ShopInfo } from '../types';
import { AuthService } from '../services/auth';
import { themeService, Theme } from '../services/theme';

interface NavbarProps {
  user: UserProfile | null;
  activeTokenCount: number;
  shop: ShopInfo;
  onOpenTokens: () => void;
  onOpenStoreInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTokenCount,
  shop,
  onOpenTokens,
  onOpenStoreInfo
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [theme, setTheme] = useState<Theme>(themeService.getTheme());

  useEffect(() => {
    return themeService.subscribe(setTheme);
  }, []);

  const handleQuickLogin = (email: string, name: string) => {
    AuthService.signInWithGoogle(email, name);
    setShowLoginModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-rose-100/60 dark:border-zinc-800 shadow-xs transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          
          {/* Shop Brand / Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-black text-xl tracking-tighter">
              SD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg tracking-tight leading-none">
                  Shree Durga <span className="text-brand-600 dark:text-rose-400">Clearance</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-2.5 h-2.5" /> 24h Hold
                </span>
              </div>
              <button 
                onClick={onOpenStoreInfo}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors mt-0.5 text-left"
              >
                <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="truncate max-w-[170px] sm:max-w-xs">{shop.address.split(',')[1] || shop.address}</span>
              </button>
            </div>
          </div>

          {/* Clean Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Store Timing & Directions Pill */}
            <button
              onClick={onOpenStoreInfo}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-zinc-800 text-brand-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-zinc-700 transition-colors border border-rose-100 dark:border-zinc-700 text-xs font-bold shadow-2xs"
              title="Store Information & Directions"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Store</span>
            </button>

            {/* Profile Dropdown or 1-Tap Google Sign-In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-300 bg-gray-50 dark:bg-zinc-800 transition-colors"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-brand-100 border border-brand-200 object-cover"
                  />
                  <span className="hidden sm:inline font-bold text-xs text-gray-800 dark:text-gray-200 max-w-[85px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenTokens();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium flex items-center gap-2"
                    >
                      <Ticket className="w-4 h-4 text-brand-600" />
                      Active Tokens ({activeTokenCount})
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        AuthService.signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-800 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* 1-Tap Google Sign-In Simulation Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 mx-auto flex items-center justify-center mb-3">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            
            <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Sign in with Google</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-5">
              Hold clearance clothes for 24h & get exclusive counter cashback.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleQuickLogin('rahul.verma@gmail.com', 'Rahul Verma')}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">R</div>
                  <span>rahul.verma@gmail.com</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">Continue</span>
              </button>

              <button
                onClick={() => handleQuickLogin('priya.sharma@gmail.com', 'Priya Sharma')}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-zinc-200 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">P</div>
                  <span>priya.sharma@gmail.com</span>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500">Continue</span>
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-zinc-800"></div></div>
              <div className="relative flex justify-center text-xs"><span className="bg-white dark:bg-zinc-900 px-2 text-gray-400 dark:text-zinc-500">Or custom email</span></div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your Name (e.g. Amit Kumar)"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="email"
                placeholder="Google Email (e.g. amit@gmail.com)"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={() => {
                  if (loginEmail) handleQuickLogin(loginEmail, loginName || loginEmail.split('@')[0]);
                }}
                className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-brand-600 text-white font-bold text-xs hover:bg-black dark:hover:bg-brand-700 transition-all"
              >
                Proceed with Google
              </button>
            </div>

            <button
              onClick={() => setShowLoginModal(false)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};
