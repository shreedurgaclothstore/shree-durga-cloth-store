import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Tag, ArrowRight, TrendingUp } from 'lucide-react';
import { Product } from '../types';

interface TopSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  products: Product[];
  onSelectSuggestion: (query: string) => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  products,
  onSelectSuggestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-curated trending search suggestions
  const trendingSuggestions = [
    { text: 'Banarasi Saree', tag: 'Festive' },
    { text: 'Levi\'s Jeans', tag: 'Men' },
    { text: 'Pure Linen Shirt', tag: 'Men' },
    { text: 'Anarkali Kurti', tag: 'Ethnic' },
    { text: 'Bomber Jacket', tag: 'Winter' },
    { text: 'Size 32', tag: 'Size' },
    { text: 'Size L', tag: 'Size' },
  ];

  // Live matching products from catalog
  const matchingProducts = searchQuery.trim()
    ? products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.size.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePick = (text: string) => {
    onSelectSuggestion(text);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-30 pt-3">
      
      {/* Search Input Box (Top position, mobile optimized) */}
      <div className="relative">
        <Search className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search clearance Sarees, Jeans, Kurtis, Shirts, or Sizes (M, 32)..."
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white dark:bg-zinc-900 rounded-2xl text-xs sm:text-sm border border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
        />

        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Auto-suggest Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in zoom-in-95">
          
          {/* Matching Products Live Results */}
          {matchingProducts.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider px-2 block mb-2">
                Matching Clearance Pieces
              </span>
              <div className="space-y-1.5">
                {matchingProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handlePick(p.title)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={p.imageUrl} alt={p.title} className="w-9 h-9 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-zinc-700" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-zinc-100 truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-400">{p.category} • Size {p.size}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-brand-600 dark:text-brand-400">₹{p.discountedPrice}</span>
                      <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+₹{p.cashbackAmount} back</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Trending Searches */}
          <div className="p-3 bg-gray-50/70 dark:bg-zinc-900/90 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider px-1 mb-2">
              <TrendingUp className="w-3 h-3 text-brand-600 dark:text-brand-400" />
              <span>Trending Clearance Searches</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {trendingSuggestions.map(s => (
                <button
                  key={s.text}
                  onClick={() => handlePick(s.text)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:border-brand-500 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-rose-50 dark:hover:bg-zinc-700 transition-all flex items-center gap-1 shadow-2xs"
                >
                  <span>{s.text}</span>
                  <span className="text-[9px] text-gray-400 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-700 px-1 py-0.2 rounded">{s.tag}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
