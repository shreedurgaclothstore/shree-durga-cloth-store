import React from 'react';
import { Tag, Sparkles, ArrowRight, Layers } from 'lucide-react';
import { Product } from '../types';

interface CategoriesViewProps {
  products: Product[];
  onSelectCategory: (category: string, gender?: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  products,
  onSelectCategory
}) => {
  const categoryData = [
    {
      name: 'Saree',
      displayName: 'Festive & Silk Sarees',
      gender: 'Women',
      tag: 'Up to 75% OFF',
      icon: '🥻',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      description: 'Banarasi, Georgette, Chanderi & Festive Sarees'
    },
    {
      name: 'Kurti & Ethnic',
      displayName: 'Kurtis & Suits',
      gender: 'Women',
      tag: 'Min 60% OFF',
      icon: '👗',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      description: 'Anarkali, Straight Cut & Embroidered Kurtis'
    },
    {
      name: 'Jeans',
      displayName: 'Denim & Jeans',
      gender: 'Men',
      tag: 'Flat 50-70% OFF',
      icon: '👖',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
      description: 'Branded Stretchable & Slim Fit Denim'
    },
    {
      name: 'Shirt',
      displayName: 'Casual & Formal Shirts',
      gender: 'Men',
      tag: 'From ₹399',
      icon: '👔',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      description: 'Pure Linen, Oxford Cotton & Printed Shirts'
    },
    {
      name: 'Jacket & Winter',
      displayName: 'Winterwear & Jackets',
      gender: 'Men',
      tag: 'Clearance Rates',
      icon: '🧥',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      description: 'Bomber Jackets, Hoodies & Windcheaters'
    },
    {
      name: 'Trousers',
      displayName: 'Trousers & Chinos',
      gender: 'Men',
      tag: 'Save ₹600+',
      icon: '🩳',
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
      description: 'Formal Office Wear & Cotton Chinos'
    },
    {
      name: 'Kids Wear',
      displayName: 'Kids Collection',
      gender: 'Kids',
      tag: 'Starting ₹299',
      icon: '👶',
      image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80',
      description: 'Ethnic wear & daily playwear for boys & girls'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-24 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Explore Categories</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Shop clearance lots by garment type</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-rose-400 flex items-center justify-center font-bold">
          <Layers className="w-5 h-5" />
        </div>
      </div>

      {/* Quick Section Shortcuts */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onSelectCategory('All', 'Men')}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs text-center hover:border-brand-500 transition-all active:scale-95"
        >
          <span className="text-xl block mb-1">👔</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Men's</span>
          <span className="text-[10px] text-gray-400">Clearance Lot</span>
        </button>

        <button
          onClick={() => onSelectCategory('All', 'Women')}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs text-center hover:border-brand-500 transition-all active:scale-95"
        >
          <span className="text-xl block mb-1">👗</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Women's</span>
          <span className="text-[10px] text-gray-400">Clearance Lot</span>
        </button>

        <button
          onClick={() => onSelectCategory('Kids Wear', 'Kids')}
          className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs text-center hover:border-brand-500 transition-all active:scale-95"
        >
          <span className="text-xl block mb-1">👶</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white block">Kids</span>
          <span className="text-[10px] text-gray-400">Clearance Lot</span>
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {categoryData.map(cat => {
          const count = products.filter(p => 
            p.category.toLowerCase().includes(cat.name.toLowerCase()) || 
            cat.name.toLowerCase().includes(p.category.toLowerCase())
          ).length;

          return (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.name, cat.gender)}
              className="cursor-pointer group bg-white dark:bg-zinc-900 rounded-3xl p-3.5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-brand-500/50 transition-all flex items-center justify-between gap-3 active:scale-98"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                  <img
                    src={cat.image}
                    alt={cat.displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1 right-1 text-base">{cat.icon}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-extrabold text-brand-600 dark:text-rose-400 bg-rose-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                      {cat.tag}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {count} items
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                    {cat.displayName}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center text-gray-400 transition-colors shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
