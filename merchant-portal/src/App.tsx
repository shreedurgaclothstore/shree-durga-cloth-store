import React, { useState } from 'react';
import { Camera, UploadCloud, Layers, BarChart3, Tag, ShieldCheck, Lock } from 'lucide-react';
import { ScannerTab } from './components/ScannerTab';
import { UploadGarmentTab } from './components/UploadGarmentTab';
import { StockListTab } from './components/StockListTab';
import { BannerManagerTab } from './components/BannerManagerTab';
import { StatsTab } from './components/StatsTab';
import { AdminLockScreen } from './components/AdminLockScreen';
import { AdminAuthService } from './services/adminAuth';

export const App: React.FC = () => {
  const [unlocked, setUnlocked] = useState<boolean>(() => AdminAuthService.isUnlocked());
  const [activeTab, setActiveTab] = useState<'SCAN' | 'UPLOAD' | 'STOCK' | 'BANNERS' | 'STATS'>('SCAN');

  React.useEffect(() => {
    const handleAuthChange = (e: any) => {
      if (typeof e.detail?.unlocked === 'boolean') {
        setUnlocked(e.detail.unlocked);
      } else {
        setUnlocked(AdminAuthService.isUnlocked());
      }
    };

    window.addEventListener('admin-auth-changed', handleAuthChange);
    return () => window.removeEventListener('admin-auth-changed', handleAuthChange);
  }, []);

  if (!unlocked) {
    return <AdminLockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* Merchant Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-500/30 shadow-md shadow-amber-600/10 shrink-0 bg-slate-950 flex items-center justify-center">
              <img src="/logo.png" alt="Shree Durga Cloth Store" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-gray-900 text-sm sm:text-base leading-none">
                  Merchant Counter Portal
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" /> Shop Owner
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Shree Durga Cloth Store</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">System Status</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Counter
              </span>
            </div>

            <button
              onClick={() => {
                AdminAuthService.lock();
                setUnlocked(false);
              }}
              title="Lock Counter Console"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-200 text-gray-600 hover:text-rose-600 text-xs font-semibold transition-all shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Controls (Mobile touch optimized) */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 sticky top-16 z-30 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-1 min-w-[340px]">
          
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'SCAN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR</span>
          </button>

          <button
            onClick={() => setActiveTab('UPLOAD')}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'UPLOAD'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Add Stock</span>
          </button>

          <button
            onClick={() => setActiveTab('STOCK')}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'STOCK'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('BANNERS')}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'BANNERS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('STATS')}
            className={`flex-1 py-2 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
              activeTab === 'STATS'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 pb-16">
        {activeTab === 'SCAN' && <ScannerTab />}
        {activeTab === 'UPLOAD' && <UploadGarmentTab onPublished={() => setActiveTab('STOCK')} />}
        {activeTab === 'STOCK' && <StockListTab />}
        {activeTab === 'BANNERS' && <BannerManagerTab />}
        {activeTab === 'STATS' && <StatsTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-[11px] text-gray-400">
        Private Merchant Counter Console • Not visible to customers
      </footer>

    </div>
  );
};

export default App;
