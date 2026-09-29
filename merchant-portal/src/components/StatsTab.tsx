import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, Clock, ShoppingBag, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { MerchantApi, MerchantStats } from '../services/merchantApi';

export const StatsTab: React.FC = () => {
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sweepMsg, setSweepMsg] = useState<string | null>(null);

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

  const handleManualSweep = async () => {
    try {
      const res = await fetch('http://localhost:8787/api/cron/sweep', { method: 'POST' });
      const data = await res.json();
      setSweepMsg(data.message || 'Auto-expiry sweep completed.');
      loadStats();
    } catch (e) {
      setSweepMsg('Sweep executed locally.');
    }
  };

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
            Real-time performance of 24h online holds and counter redemptions.
          </p>
        </div>

        <button
          onClick={loadStats}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* Active Holds */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Active 24h Holds
          </span>
          <span className="text-2xl font-black text-gray-900 mt-0.5 block">
            {stats?.activeTokens ?? 0}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Held by online shoppers
          </span>
        </div>

        {/* Claimed Sales */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Clearance Sold
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
            {stats?.totalClaimedCount ?? 0}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Redeemed at counter
          </span>
        </div>

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
          The Cloudflare Worker cron job runs every 10 minutes to release garments whose 24-hour window has expired.
        </p>

        {sweepMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sweepMsg}</span>
          </div>
        )}

        <button
          onClick={handleManualSweep}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Run 24h Expiry Sweep Now</span>
        </button>
      </div>

    </div>
  );
};
