import React, { useState } from 'react';
import { X, Ticket, Sparkles, CheckCircle2, History } from 'lucide-react';
import { TokenReservation, ShopInfo } from '../types';
import { TokenCard } from './TokenCard';

interface MyTokensDrawerProps {
  isOpen: boolean;
  tokens: TokenReservation[];
  shop: ShopInfo;
  onClose: () => void;
  onCancelToken: (tokenId: string) => void;
}

export const MyTokensDrawer: React.FC<MyTokensDrawerProps> = ({
  isOpen,
  tokens,
  shop,
  onClose,
  onCancelToken
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  if (!isOpen) return null;

  const activeTokens = tokens.filter(t => t.status === 'ACTIVE');
  const pastTokens = tokens.filter(t => t.status !== 'ACTIVE');
  const displayedTokens = activeTab === 'ACTIVE' ? activeTokens : pastTokens;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-50 dark:bg-zinc-950 w-full max-w-md h-full flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">My 24h Tokens</h3>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">Show QR at counter to redeem cashback</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs: Active vs History */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Tokens ({activeTokens.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({pastTokens.length})</span>
          </button>
        </div>

        {/* Tokens List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedTokens.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-zinc-500">
                <Ticket className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-gray-800 dark:text-zinc-200 text-sm">
                {activeTab === 'ACTIVE' ? 'No Active 24h Tokens' : 'No Past Tokens Yet'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                {activeTab === 'ACTIVE'
                  ? 'Browse the clearance catalog and hold your favorite piece for 24 hours with counter cashback!'
                  : 'Tokens that you have claimed or expired will appear here.'}
              </p>
            </div>
          ) : (
            displayedTokens.map(token => (
              <TokenCard
                key={token.id}
                token={token}
                shop={shop}
                onCancel={onCancelToken}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};
