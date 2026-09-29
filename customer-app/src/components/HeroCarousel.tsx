import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Tag, ArrowRight, Clock } from 'lucide-react';
import { Banner } from '../types';

interface HeroCarouselProps {
  banners: Banner[];
  currentCategory: string;
  onSelectCategory: (category: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  currentCategory,
  onSelectCategory
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Contextual Algorithm: If user selects a category (like Saree or Jeans), auto-slide to matching banner!
  useEffect(() => {
    if (currentCategory && currentCategory !== 'All' && banners.length > 0) {
      const matchIndex = banners.findIndex(
        b => b.targetCategory?.toLowerCase() === currentCategory.toLowerCase()
      );
      if (matchIndex !== -1) {
        setCurrentIndex(matchIndex);
      }
    }
  }, [currentCategory, banners]);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext(); // Swiped left -> next
    } else if (distance < -50) {
      handlePrev(); // Swiped right -> prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!banners || banners.length === 0) return null;
  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div className="relative w-full my-3 sm:my-4 select-none">
      
      {/* Main Slide Card (Flipkart/Amazon styled) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => currentBanner.targetCategory && onSelectCategory(currentBanner.targetCategory)}
        className="cursor-pointer group relative rounded-3xl overflow-hidden aspect-[2.1/1] sm:aspect-[2.8/1] md:aspect-[3.2/1] shadow-xl shadow-gray-200/50 transition-all"
      >
        
        {/* Background Image with Dark Tint */}
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay for high readability */}
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.gradient || 'from-rose-950 via-brand-900 to-black/70'} opacity-90 backdrop-blur-[1px]`}></div>

        {/* Content Box */}
        <div className="relative z-10 h-full p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white max-w-lg">
          
          {/* Top Tag & Discount Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-amber-400 text-black tracking-wider uppercase shadow-md flex items-center gap-1">
              <Tag className="w-3 h-3 text-red-700" />
              {currentBanner.tag}
            </span>

            {currentBanner.discountText && (
              <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/20">
                {currentBanner.discountText}
              </span>
            )}

            {currentBanner.cashbackBadge && (
              <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-emerald-500/90 text-white shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-200" />
                {currentBanner.cashbackBadge}
              </span>
            )}
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-tight drop-shadow-md">
              {currentBanner.title}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-200 mt-1 line-clamp-1 sm:line-clamp-2 font-medium max-w-md">
              {currentBanner.subtitle}
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentBanner.targetCategory) onSelectCategory(currentBanner.targetCategory);
              }}
              className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-white text-gray-900 font-extrabold text-[11px] sm:text-xs hover:bg-amber-300 transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <span>{currentBanner.targetCategory && currentBanner.targetCategory !== 'All' ? `View ${currentBanner.targetCategory} Deals` : 'Shop Clearance'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] text-amber-300/90 font-semibold hidden sm:flex items-center gap-1">
              <Clock className="w-3 h-3" /> 24h Lock Available
            </span>
          </div>

        </div>

        {/* Carousel Desktop Arrows */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-sm transition-all z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white items-center justify-center backdrop-blur-sm transition-all z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Indicators at Bottom */}
        <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-amber-400 shadow-sm'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>

    </div>
  );
};
