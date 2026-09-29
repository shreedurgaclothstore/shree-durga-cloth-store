import React, { useState } from 'react';
import { 
  X, Sparkles, Clock, Flame, ShieldCheck, MapPin, 
  Share2, ArrowRight, CheckCircle2, Store, ArrowLeft, ArrowUpRight
} from 'lucide-react';
import { Product, ShopInfo } from '../types';

interface ProductDetailModalProps {
  product: Product;
  shop: ShopInfo;
  relatedProducts: Product[];
  onClose: () => void;
  onBook: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  shop,
  relatedProducts,
  onClose,
  onBook,
  onSelectProduct
}) => {
  const [copied, setCopied] = useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
  );

  const isLowStock = product.availableQuantity === 1 && product.status === 'AVAILABLE';
  const isOutOfStock = product.availableQuantity <= 0 || product.status === 'SOLD_OUT';
  const netEffectivePrice = product.discountedPrice - product.cashbackAmount;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Clearance Deal: ${product.title} at ₹${product.discountedPrice} + ₹${product.cashbackAmount} Cashback!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    /* 1. Full Screen Overlay (Amazon / Flipkart Native Mobile App Experience) */
    <div className="fixed inset-0 z-50 w-full h-full bg-white dark:bg-zinc-950 overflow-y-auto flex flex-col animate-in fade-in duration-200">
      
      {/* Sticky Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl px-4 h-14 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-extrabold">Clearance Details</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 transition-colors"
            title="Share"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Full-Screen Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 space-y-6 pb-28">
        
        {/* Large Garment Hero Image */}
        <div className="relative aspect-[4/4] sm:aspect-[16/10] rounded-3xl overflow-hidden bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-md">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* Discount Tag */}
          <div className="absolute top-4 left-4 bg-brand-600 text-white font-black text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-lg tracking-wider">
            {discountPercent}% OFF
          </div>

          {/* Scarcity Indicator */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-gray-900 font-black text-sm px-5 py-2.5 rounded-full uppercase tracking-wider shadow-xl">
                Currently Sold Out / Reserved
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute bottom-4 left-4 bg-amber-500/95 backdrop-blur-sm text-black font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-700 fill-red-700 animate-bounce-soft" />
              <span>Only 1 Left in Store!</span>
            </div>
          ) : null}

          <div className="absolute top-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm text-gray-900 dark:text-gray-100 text-xs font-black px-3 py-1 rounded-xl shadow-md border border-gray-100 dark:border-zinc-700">
            {product.gender} Wear
          </div>
        </div>

        {/* Title, Category & Size */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            <span>{product.category}</span>
            <span>•</span>
            <span className="text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold">
              Size {product.size}
            </span>
          </div>
          
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
            {product.title}
          </h1>
        </div>

        {/* Pricing & Exclusive Counter Cashback Card (Flipkart/Amazon style) */}
        <div className="bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 border border-amber-200/80 dark:border-zinc-700 rounded-3xl p-4 sm:p-6 space-y-3.5 shadow-sm">
          
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              ₹{product.discountedPrice}
            </span>
            <span className="text-base sm:text-lg text-gray-400 dark:text-gray-400 line-through font-semibold">
              M.R.P. ₹{product.originalPrice}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-lg">
              Save ₹{product.originalPrice - product.discountedPrice}
            </span>
          </div>

          {/* Guaranteed Cashback Box */}
          <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-3.5 border border-amber-200 dark:border-zinc-700 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400 block">
                  +₹{product.cashbackAmount} Guaranteed Store Cashback
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                  Deducted directly from bill at shop counter
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-bold uppercase">Effective Price</span>
              <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400">₹{netEffectivePrice}</span>
            </div>
          </div>

        </div>

        {/* Specifications & Details */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            Garment Specifications & Fabric Details
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
            {product.description || 'Authentic retail stock clearance. Clean, undamaged, genuine garment from showroom inventory available for 24h reservation.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Category</span>
              <span className="font-bold text-gray-900 dark:text-white">{product.category}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Section</span>
              <span className="font-bold text-gray-900 dark:text-white">{product.gender}'s Wear</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Garment Size</span>
              <span className="font-bold text-gray-900 dark:text-white">{product.size}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Availability</span>
              <span className={`font-bold ${!isOutOfStock ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {!isOutOfStock ? `${product.availableQuantity} in Store` : 'Sold Out'}
              </span>
            </div>
          </div>
        </div>

        {/* 24-Hour In-Store Reservation Assurance */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 sm:p-5 space-y-2 text-xs">
          <h4 className="font-extrabold text-blue-950 dark:text-blue-300 flex items-center gap-1.5 text-xs sm:text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>How 24-Hour Counter Hold Works:</span>
          </h4>
          <ul className="space-y-1.5 text-blue-900/90 dark:text-blue-200 text-xs">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><b>Zero Advance Payment:</b> Pay nothing online. No credit card or advance required.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><b>Physical Inspection:</b> Try the fabric, fitting, and condition at the showroom counter before buying.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span><b>24-Hour Locked Guarantee:</b> This piece is reserved exclusively under your token for 24 hours.</span>
            </li>
          </ul>
        </div>

        {/* Physical Showroom Location */}
        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-start gap-2.5 min-w-0">
            <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-900 dark:text-white block">{shop.name}</span>
              <span className="text-gray-500 dark:text-gray-400 text-[11px] truncate block">{shop.address}</span>
            </div>
          </div>
          <a
            href={shop.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 shrink-0"
          >
            Directions
          </a>
        </div>

        {/* 2. SIMILAR / RECOMMENDED PRODUCTS (RENDERED AS FULL CARDS JUST LIKE MAIN SCREEN) */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                  Similar Clearance Deals in {product.category}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Customers also checked out these clearance pieces
                </p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400 px-2.5 py-1 rounded-full">
                {relatedProducts.length} Items
              </span>
            </div>

            {/* FULL SIZE CARDS GRID (Flipkart/Amazon style recommendation) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {relatedProducts.map(item => {
                const itemDiscount = Math.round(
                  ((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100
                );
                const itemOutOfStock = item.availableQuantity <= 0 || item.status === 'SOLD_OUT';

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      // Scroll to top smoothly
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cursor-pointer group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-brand-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        {itemDiscount}% OFF
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-white/90 dark:bg-zinc-800/90 text-gray-800 dark:text-gray-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Size {item.size}
                      </div>
                      {item.availableQuantity === 1 && !itemOutOfStock && (
                        <div className="absolute bottom-2 left-2 bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 fill-red-700 text-red-700" /> Only 1 Left!
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                          {item.category} • {item.gender}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <div className="flex items-baseline justify-between mb-2">
                          <div>
                            <span className="text-[10px] text-gray-400 line-through mr-1">₹{item.originalPrice}</span>
                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{item.discountedPrice}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            +₹{item.cashbackAmount}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(item);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full py-1.5 rounded-xl bg-gray-900 dark:bg-zinc-800 hover:bg-brand-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          <span>View Piece</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Action Bar (Flipkart / Amazon Mobile Style) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 p-3 sm:p-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Net Price After Cashback
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{netEffectivePrice}</span>
              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
            </div>
          </div>

          <button
            onClick={() => onBook(product)}
            disabled={isOutOfStock}
            className={`flex-1 max-w-sm py-3.5 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
              isOutOfStock
                ? 'bg-gray-200 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-300" />
            <span>{isOutOfStock ? 'Sold Out' : 'Book for 24h & Get Token'}</span>
            {!isOutOfStock && <ArrowRight className="w-4 h-4 ml-0.5" />}
          </button>
        </div>
      </footer>

    </div>
  );
};
