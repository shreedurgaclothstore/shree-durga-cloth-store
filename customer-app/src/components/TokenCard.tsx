import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, MapPin, Sparkles, AlertTriangle, CheckCircle2, XCircle, Navigation, Trash2 } from 'lucide-react';
import { TokenReservation, ShopInfo } from '../types';

interface TokenCardProps {
  token: TokenReservation;
  shop: ShopInfo;
  onCancel?: (tokenId: string) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, shop, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(token.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0 || token.status !== 'ACTIVE') {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [token.expiresAt, token.status]);

  const isCriticalUrgency = timeLeft.hours < 4 && !timeLeft.isExpired && token.status === 'ACTIVE';

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-3xl border shadow-md overflow-hidden transition-all ${
      token.status === 'ACTIVE'
        ? isCriticalUrgency
          ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900/50'
          : 'border-brand-200 dark:border-brand-900/60'
        : 'border-gray-200 dark:border-zinc-800 opacity-80'
    }`}>
      
      {/* Header Bar */}
      <div className={`p-4 flex items-center justify-between text-white text-xs font-bold ${
        token.status === 'ACTIVE'
          ? isCriticalUrgency
            ? 'bg-gradient-to-r from-red-600 to-rose-600 animate-pulse'
            : 'bg-gradient-to-r from-brand-600 to-rose-600'
          : token.status === 'CLAIMED'
          ? 'bg-emerald-600'
          : 'bg-gray-500'
      }`}>
        <div className="flex items-center gap-1.5">
          {token.status === 'ACTIVE' && <Clock className="w-4 h-4 text-amber-300" />}
          {token.status === 'CLAIMED' && <CheckCircle2 className="w-4 h-4 text-white" />}
          {token.status === 'EXPIRED' && <AlertTriangle className="w-4 h-4 text-white" />}
          {token.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-white" />}
          
          <span className="tracking-wide">
            {token.status === 'ACTIVE' ? '24h Reservation Active' : token.status}
          </span>
        </div>

        <span className="font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded-full">
          {token.id}
        </span>
      </div>

      <div className="p-5">
        
        {/* Live Countdown Timer (If Active) */}
        {token.status === 'ACTIVE' && !timeLeft.isExpired ? (
          <div className="text-center mb-5 bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-2xl p-3">
            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest block mb-1">
              Token Expires In
            </span>
            <div className="flex items-center justify-center gap-2 font-mono font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
              <div className="bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-xl shadow-sm border border-amber-100 dark:border-zinc-700">
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="text-[10px] block font-sans font-bold text-gray-400 dark:text-zinc-500">HRS</span>
              </div>
              <span className="text-brand-600 dark:text-brand-400">:</span>
              <div className="bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-xl shadow-sm border border-amber-100 dark:border-zinc-700">
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="text-[10px] block font-sans font-bold text-gray-400 dark:text-zinc-500">MIN</span>
              </div>
              <span className="text-brand-600 dark:text-brand-400">:</span>
              <div className="bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-xl shadow-sm border border-amber-100 dark:border-zinc-700 text-brand-600 dark:text-brand-400">
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="text-[10px] block font-sans font-bold text-gray-400 dark:text-zinc-500">SEC</span>
              </div>
            </div>
            {isCriticalUrgency && (
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-2 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Hurry! Only a few hours left before item is released!
              </p>
            )}
          </div>
        ) : null}

        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800 mb-5 text-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
            <QRCodeSVG
              value={token.qrPayload}
              size={160}
              level="H"
              includeMargin={true}
              className="rounded-lg"
            />
          </div>
          <span className="mt-2 text-xs font-mono font-bold text-gray-700 dark:text-zinc-300 tracking-wider">
            TOKEN: {token.id}
          </span>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
            Show this QR code at the counter to claim your cashback!
          </p>
        </div>

        {/* Product Summary */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700/80 mb-4">
          <img
            src={token.productImage}
            alt={token.productTitle}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-zinc-700"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-400 uppercase">
              Size {token.productSize}
            </span>
            <h4 className="font-extrabold text-xs text-gray-900 dark:text-white truncate">
              {token.productTitle}
            </h4>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">Counter Bill: ₹{token.discountedPrice}</span>
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                +₹{token.cashbackAmount} Cashback
              </span>
            </div>
          </div>
        </div>

        {/* Store & Directions */}
        <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{shop.address}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <a
              href={shop.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-gray-900 dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              Navigate to Shop
            </a>

            {token.status === 'ACTIVE' && onCancel && (
              <button
                onClick={() => onCancel(token.id)}
                className="py-2 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-900 text-gray-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1 transition-all"
                title="Cancel Hold and release stock"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
