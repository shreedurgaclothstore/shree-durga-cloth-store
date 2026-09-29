import React from 'react';
import { Sparkles, Clock, Flame, ArrowRight, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onBook: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onBook, onOpenDetail }) => {
  const discountPercent = Math.round(
    ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
  );

  const isLowStock = product.availableQuantity === 1 && product.status === 'AVAILABLE';
  const isOutOfStock = product.availableQuantity <= 0 || product.status === 'SOLD_OUT';

  return (
    <div 
      onClick={() => onOpenDetail(product)}
      className="cursor-pointer group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/5] bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-brand-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md tracking-wider">
          {discountPercent}% OFF
        </div>

        {/* Scarcity / Stock Alert */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 dark:bg-zinc-900/90 text-gray-900 dark:text-white font-extrabold text-xs px-4 py-2 rounded-full uppercase tracking-wider shadow">
              Reserved / Sold
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-3 left-3 bg-amber-500/95 backdrop-blur-sm text-black text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-700 fill-red-700 animate-bounce-soft" />
            Only 1 Left in Shop!
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {product.availableQuantity} pieces in store
          </div>
        )}

        {/* Category & Gender Pill */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-gray-700 dark:text-zinc-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
          {product.gender} • {product.size}
        </div>
      </div>

      {/* Content & Pricing */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <span>•</span>
            <span>Size {product.size}</span>
          </div>

          <h3 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-base leading-snug line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-3 pt-2 sm:pt-3 border-t border-gray-100 dark:border-zinc-800">
          
          {/* Price & Cashback row */}
          <div className="flex items-baseline justify-between gap-1.5 mb-2">
            <div>
              <span className="text-[11px] sm:text-xs text-gray-400 dark:text-zinc-500 line-through mr-1 font-medium">
                ₹{product.originalPrice}
              </span>
              <span className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white">
                ₹{product.discountedPrice}
              </span>
            </div>

            {/* Cashback Tag */}
            <div className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-[10px] sm:text-xs font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>+₹{product.cashbackAmount}</span>
            </div>
          </div>

          {/* 24-hr Token Hold Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(product);
            }}
            disabled={isOutOfStock}
            className={`w-full py-2 sm:py-2.5 px-3 rounded-xl font-bold text-[11px] sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isOutOfStock
                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Book for 24h & Get Token'}</span>
            {!isOutOfStock && <ArrowRight className="w-3 h-3 ml-0.5" />}
          </button>

          <p className="text-[9px] sm:text-[10px] text-center text-gray-400 dark:text-zinc-500 mt-1 font-medium">
            Tap card to inspect piece • Pay ₹{product.discountedPrice - product.cashbackAmount} after cashback
          </p>
        </div>
      </div>

    </div>
  );
};
