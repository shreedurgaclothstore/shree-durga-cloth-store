import React from 'react';
import { MapPin, Phone, Clock, Navigation, Gift, Sparkles } from 'lucide-react';
import { ShopInfo } from '../types';

interface ShopBannerProps {
  shop: ShopInfo;
}

export const ShopBanner: React.FC<ShopBannerProps> = ({ shop }) => {
  return (
    <div className="bg-gradient-to-br from-rose-900 via-brand-700 to-amber-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-brand-700/15 relative overflow-hidden my-5">
      {/* Background Decorative Rings */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
      <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-amber-400/10 pointer-events-none blur-xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400 text-black mb-3 tracking-wide uppercase shadow">
            <Gift className="w-3.5 h-3.5" /> Deadstock & Clearance Sale
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {shop.name}
          </h2>
          <p className="text-xs sm:text-sm text-rose-100/90 mt-1 max-w-xl font-medium">
            {shop.tagline}. Reserve online for 24 hours — collect at physical counter with instant cashback!
          </p>

          {/* Quick Info Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 text-xs text-rose-100">
            <span className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {shop.address}
            </span>
            <span className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {shop.timing}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 sm:self-center shrink-0">
          <a
            href={shop.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-100 shadow-md transition-all active:scale-95"
          >
            <Navigation className="w-4 h-4 text-brand-600" />
            Directions
          </a>
          <a
            href={`tel:${shop.phone}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition-all active:scale-95"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            Call Store
          </a>
        </div>
      </div>
    </div>
  );
};
