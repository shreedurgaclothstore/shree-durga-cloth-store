import React from 'react';
import { X, MapPin, Clock, Phone, Navigation, ShieldCheck } from 'lucide-react';
import { ShopInfo } from '../types';

interface StoreModalProps {
  isOpen: boolean;
  shop: ShopInfo;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, shop, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <img
          src="/logo.png"
          alt="Shree Durga Cloth Store"
          className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3 shadow-md border border-amber-200/60 dark:border-amber-700/50 bg-white dark:bg-zinc-800 p-1"
        />

        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">{shop.name}</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-5">{shop.tagline}</p>

        <div className="space-y-3 text-left text-xs text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-800/80 p-4 rounded-2xl border border-gray-100 dark:border-zinc-700 mb-5">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-gray-900 dark:text-white">Address</span>
              <span>{shop.address}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-gray-900 dark:text-white">Store Hours</span>
              <span>{shop.timing}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-gray-900 dark:text-white">Contact Number</span>
              <span>{shop.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={shop.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Navigation className="w-4 h-4 text-amber-300" />
            Open in Google Maps
          </a>
          <a
            href={`tel:${shop.phone}`}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
            Call Store Counter
          </a>
        </div>
      </div>
    </div>
  );
};
