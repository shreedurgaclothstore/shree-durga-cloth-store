import React from 'react';
import { Home, Grid, Ticket, Settings } from 'lucide-react';

export type NavTab = 'home' | 'categories' | 'tokens' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeTokenCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  activeTokenCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'home'
              ? 'text-brand-600 dark:text-rose-400 font-bold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'home' ? 'scale-110' : ''}`} />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600 dark:bg-rose-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Tab 2: Categories */}
        <button
          onClick={() => onTabChange('categories')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'categories'
              ? 'text-brand-600 dark:text-rose-400 font-bold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <Grid className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'categories' ? 'scale-110' : ''}`} />
            {activeTab === 'categories' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600 dark:bg-rose-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Categories</span>
        </button>

        {/* Tab 3: My 24h Tokens */}
        <button
          onClick={() => onTabChange('tokens')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'tokens'
              ? 'text-brand-600 dark:text-rose-400 font-bold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <Ticket className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'tokens' ? 'scale-110' : ''}`} />
            {activeTokenCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                {activeTokenCount}
              </span>
            )}
            {activeTab === 'tokens' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600 dark:bg-rose-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">My Tokens</span>
        </button>

        {/* Tab 4: Account & Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'settings'
              ? 'text-brand-600 dark:text-rose-400 font-bold'
              : 'text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <div className="relative">
            <Settings className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'settings' ? 'scale-110' : ''}`} />
            {activeTab === 'settings' && (
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600 dark:bg-rose-400"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Settings</span>
        </button>

      </div>
    </nav>
  );
};
