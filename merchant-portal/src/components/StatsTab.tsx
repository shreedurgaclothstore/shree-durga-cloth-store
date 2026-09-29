import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  IndianRupee, 
  Clock, 
  ShoppingBag, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  X, 
  User, 
  Tag, 
  ChevronRight, 
  AlertCircle,
  ExternalLink,
  Search
} from 'lucide-react';
import { MerchantApi, MerchantStats } from '../services/merchantApi';
import { TokenReservation } from '../types';

export const StatsTab: React.FC = () => {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sweepMsg, setSweepMsg] = useState<string | null>(null);

  // History modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState<'ACTIVE' | 'CLAIMED' | 'ALL'>('ACTIVE');
  const [tokensList, setTokensList] = useState<TokenReservation[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await MerchantApi.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (status: 'ACTIVE' | 'CLAIMED' | 'ALL') => {
    setHistoryTab(status);
    setIsModalOpen(true);
    setSearchQuery('');
    await fetchTokens(status);
  };

  const fetchTokens = async (status: 'ACTIVE' | 'CLAIMED' | 'ALL') => {
    setTokensLoading(true);
    try {
      const data = await MerchantApi.getTokens(status);
      setTokensList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setTokensLoading(false);
    }
  };

  const handleTabChange = async (tab: 'ACTIVE' | 'CLAIMED' | 'ALL') => {
    setHistoryTab(tab);
    await fetchTokens(tab);
  };

  const handleRedeemDirect = async (tokenId: string) => {
    setRedeemingId(tokenId);
    try {
      const res = await MerchantApi.claimToken(tokenId);
      if (res.success) {
        // Refresh both list and stats
        await fetchTokens(historyTab);
        await loadStats();
      } else {
        alert(res.error || 'Failed to redeem token');
      }
    } catch (e: any) {
      alert(e.message || 'Redemption error');
    } finally {
      setRedeemingId(null);
    }
  };

  const handleManualSweep = async () => {
    try {
      const res = await fetch('https://shree-durga-cloth-backend.shreedurgacloth.workers.dev/api/cron/sweep', { method: 'POST' });
      const data = await res.json();
      setSweepMsg(data.message || 'Auto-expiry sweep completed.');
      loadStats();
      if (isModalOpen) fetchTokens(historyTab);
    } catch (e) {
      setSweepMsg('Sweep executed.');
    }
  };

  const formatRemainingTime = (expiresAtStr: string) => {
    const diffMs = new Date(expiresAtStr).getTime() - Date.now();
    if (diffMs <= 0) return 'Expired just now';
    const totalMins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hrs > 0) return `${hrs}h ${mins}m left`;
    return `${mins}m left`;
  };

  const filteredTokens = tokensList.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id.toLowerCase().includes(q) ||
      t.productTitle.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      (t.userPhone && t.userPhone.includes(q))
    );
  });

  return (
    <div className="max-w-xl mx-auto space-y-5">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Deadstock Liquidation Analytics</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Click on cards below to view garment hold & sales history.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Interactive Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Active Holds — CLICKABLE */}
        <button
          type="button"
          onClick={() => openHistory('ACTIVE')}
          className="bg-white p-4 rounded-3xl border-2 border-amber-200/80 hover:border-amber-400 shadow-sm hover:shadow-md transition-all text-left group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-amber-200 transition-colors">
              View List <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Active 24h Holds
          </span>
          <span className="text-3xl font-black text-gray-900 mt-0.5 block">
            {stats?.activeTokens ?? 0}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Held by online shoppers
          </span>
        </button>

        {/* Claimed Sales — CLICKABLE */}
        <button
          type="button"
          onClick={() => openHistory('CLAIMED')}
          className="bg-white p-4 rounded-3xl border-2 border-emerald-200/80 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all text-left group active:scale-98 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-emerald-200 transition-colors">
              View History <ChevronRight className="w-3 h-3" />
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Clearance Sold
          </span>
          <span className="text-3xl font-black text-emerald-700 mt-0.5 block">
            {stats?.totalClaimedCount ?? 0}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Redeemed at counter
          </span>
        </button>

        {/* Total Deadstock Revenue */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <IndianRupee className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Revenue Recovered
          </span>
          <span className="text-2xl font-black text-gray-900 mt-0.5 block">
            ₹{stats?.totalRevenueRecovered?.toLocaleString('en-IN') ?? 0}
          </span>
          <span className="text-[10px] text-gray-500 font-medium mt-1 block">
            Cash collected from deadstock
          </span>
        </div>

        {/* Cashback Distributed */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Cashback Given
          </span>
          <span className="text-2xl font-black text-rose-600 mt-0.5 block">
            ₹{stats?.totalCashbackDistributed?.toLocaleString('en-IN') ?? 0}
          </span>
          <span className="text-[10px] text-rose-700 font-medium mt-1 block">
            Discounts provided as incentive
          </span>
        </div>

      </div>

      {/* 24-hr Expiry Trigger & Cron Helper */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
          Background Automation & Stock Sweeper
        </h3>
        <p className="text-xs text-gray-500">
          The Cloudflare Worker cron job automatically releases garments whose 24-hour window has expired back to available inventory.
        </p>

        {sweepMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sweepMsg}</span>
          </div>
        )}

        <button
          onClick={handleManualSweep}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Run 24h Expiry Sweep Now</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: 24h Hold & Sales History Modal */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  {historyTab === 'ACTIVE' && <Clock className="w-5 h-5 text-amber-600" />}
                  {historyTab === 'CLAIMED' && <ShoppingBag className="w-5 h-5 text-emerald-600" />}
                  {historyTab === 'ALL' && <BarChart3 className="w-5 h-5 text-blue-600" />}
                  <span>
                    {historyTab === 'ACTIVE' && 'Active 24h Garment Holds'}
                    {historyTab === 'CLAIMED' && 'Clearance Sold / Redeemed History'}
                    {historyTab === 'ALL' && 'All Reservation Tokens'}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Detailed ledger of customer reservations and counter redemptions.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="p-3 sm:p-4 border-b border-gray-100 bg-white space-y-2.5">
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-2xl">
                <button
                  onClick={() => handleTabChange('ACTIVE')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    historyTab === 'ACTIVE'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Active Holds
                </button>
                <button
                  onClick={() => handleTabChange('CLAIMED')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    historyTab === 'CLAIMED'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sold / Redeemed
                </button>
                <button
                  onClick={() => handleTabChange('ALL')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    historyTab === 'ALL'
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Records
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Customer, Token ID, or Garment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Token Items List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {tokensLoading ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                  <p className="text-xs font-medium">Fetching history records from Cloudflare D1...</p>
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-2">
                  <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="text-xs font-bold text-gray-600">No records found</p>
                  <p className="text-[11px] text-gray-400">
                    {historyTab === 'ACTIVE' 
                      ? 'No garments are currently in 24h hold status.' 
                      : 'No items redeemed under this filter.'}
                  </p>
                </div>
              ) : (
                filteredTokens.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 shadow-xs space-y-2.5 transition-all"
                  >
                    {/* Top Row: Product Info & Status */}
                    <div className="flex items-start gap-3">
                      <img
                        src={t.productImage}
                        alt={t.productTitle}
                        className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-mono text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            {t.id}
                          </span>
                          {t.status === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <Clock className="w-2.5 h-2.5" />
                              {formatRemainingTime(t.expiresAt)}
                            </span>
                          )}
                          {t.status === 'CLAIMED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              SOLD & CLAIMED
                            </span>
                          )}
                          {t.status === 'EXPIRED' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              EXPIRED
                            </span>
                          )}
                          {t.status === 'CANCELLED' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              CANCELLED
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-xs text-gray-900 truncate">
                          {t.productTitle}
                        </h4>
                        <p className="text-[10px] text-gray-500">Size: <b>{t.productSize}</b></p>
                      </div>
                    </div>

                    {/* Customer Row */}
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1 truncate font-medium">
                        <User className="w-3 h-3 text-gray-400 shrink-0" />
                        <b>{t.userName}</b> ({t.userPhone || t.userEmail})
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                        Hold: {new Date(t.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Financial Breakdown & Redeem Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 block leading-tight">Counter Cash:</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm text-gray-900">₹{t.finalPayableAmount}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">(+₹{t.cashbackAmount} Cashback)</span>
                        </div>
                      </div>

                      {t.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRedeemDirect(t.id)}
                          disabled={redeemingId === t.id}
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{redeemingId === t.id ? 'Redeeming...' : 'Redeem Now'}</span>
                        </button>
                      )}

                      {t.status === 'CLAIMED' && t.claimedAt && (
                        <span className="text-[10px] text-gray-400">
                          Redeemed: {new Date(t.claimedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(t.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredTokens.length} records</span>
              <button
                onClick={() => fetchTokens(historyTab)}
                className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh List
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
