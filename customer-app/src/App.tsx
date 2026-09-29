import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, ShoppingBag, MapPin, Tag, ArrowRight, X, Ticket, History } from 'lucide-react';
import { Product, UserProfile, TokenReservation, ShopInfo, Banner } from './types';
import { AuthService } from './services/auth';
import { ApiService } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { TopSearchBar } from './components/TopSearchBar';
import { ProductCard } from './components/ProductCard';
import { BookingModal } from './components/BookingModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MyTokensDrawer } from './components/MyTokensDrawer';
import { StoreModal } from './components/StoreModal';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { SettingsView } from './components/SettingsView';
import { CategoriesView } from './components/CategoriesView';
import { TokenCard } from './components/TokenCard';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [shop, setShop] = useState<ShopInfo>({
    name: 'Shree Durga Cloth Store',
    tagline: 'Exclusive Clearance & Factory Seconds Stock',
    address: 'Sahajpal, Boudh, Odisha',
    phone: '+91 98765 43210',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=20.820833,84.159972',
    timing: '10:30 AM - 09:30 PM (All 7 Days Open)',
  });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [myTokens, setMyTokens] = useState<TokenReservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Bottom Navigation Bar Active Tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [tokenSubTab, setTokenSubTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  // Filters
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [isTokensDrawerOpen, setIsTokensDrawerOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Categories list
  const categories = ['All', 'Saree', 'Kurti & Ethnic', 'Jeans', 'Shirt', 'Jacket & Winter', 'Trousers', 'Kids Wear'];
  const genders = ['All', 'Men', 'Women', 'Kids'];

  // Subscribe to Auth changes
  useEffect(() => {
    const unsubscribe = AuthService.subscribe((u) => {
      setUser(u);
      if (u) {
        loadUserTokens(u.email);
      } else {
        setMyTokens([]);
      }
    });
    return unsubscribe;
  }, []);

  // Fetch Initial Data & Banners
  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedGender]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [shopData, productsData, bannersData] = await Promise.all([
        ApiService.getShopInfo(),
        ApiService.getProducts({
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          gender: selectedGender === 'All' ? undefined : selectedGender,
          search: searchQuery.trim() || undefined
        }),
        ApiService.getBanners(selectedCategory)
      ]);
      setShop(shopData);
      setProducts(productsData);
      setBanners(bannersData);
    } catch (e) {
      console.error('Failed to load catalog data', e);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTokens = async (email: string) => {
    try {
      const tokens = await ApiService.getMyTokens(email);
      setMyTokens(tokens);
    } catch (e) {
      console.error('Failed to load user tokens', e);
    }
  };

  const handleBookingSuccess = (newToken: TokenReservation) => {
    setBookingProduct(null);
    setMyTokens(prev => [newToken, ...prev]);
    loadData();
    // Switch to tokens tab directly
    setActiveTab('tokens');
    setTokenSubTab('ACTIVE');
  };

  const handleCancelToken = async (tokenId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to cancel this 24h reservation? The piece will be released back to the store.')) {
      return;
    }
    const success = await ApiService.cancelToken(tokenId, user.email);
    if (success) {
      setMyTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'CANCELLED' } : t));
      loadData();
    }
  };

  const activeTokensCount = myTokens.filter(t => t.status === 'ACTIVE').length;

  // Filter products locally for instantaneous typing response
  const filteredProducts = products.filter(p => {
    if (p.status === 'ARCHIVED') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q) ||
      p.gender.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100/60 via-amber-50/40 to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-x-hidden text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Ambient Glow Spheres */}
      <div className="absolute top-0 -left-20 w-80 sm:w-[480px] h-80 sm:h-[480px] bg-gradient-to-br from-rose-400/20 via-pink-300/15 to-transparent dark:from-rose-600/10 dark:via-purple-900/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute top-48 -right-20 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-gradient-to-bl from-amber-400/20 via-orange-300/15 to-transparent dark:from-amber-600/10 dark:via-red-950/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      {/* 1. Clean Top Navbar */}
      <Navbar
        user={user}
        activeTokenCount={activeTokensCount}
        shop={shop}
        onOpenTokens={() => setActiveTab('tokens')}
        onOpenStoreInfo={() => setIsStoreModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 w-full flex-1 pt-2 pb-24 relative z-10">
        
        {/* TAB 1: HOME FEED */}
        {activeTab === 'home' && (
          <div className="space-y-3">
            {/* Top Search Bar */}
            <TopSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              products={products}
              onSelectSuggestion={(suggestion) => {
                setSearchQuery(suggestion);
              }}
            />

            {/* Sliding Hero Carousel */}
            <HeroCarousel
              banners={banners}
              currentCategory={selectedCategory}
              onSelectCategory={(cat) => {
                if (cat === 'All') {
                  setSelectedCategory('All');
                } else {
                  const matched = categories.find(c => c.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(c.toLowerCase()));
                  setSelectedCategory(matched || cat);
                }
              }}
            />

            {/* Category & Section Filters */}
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-3 border border-white/80 dark:border-zinc-800 shadow-sm shadow-rose-950/5 dark:shadow-black/20 my-2.5 space-y-2.5">
              
              {/* Gender Section Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">Section:</span>
                {genders.map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      selectedGender === g
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">Type:</span>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 ${
                      selectedCategory === c
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25 ring-2 ring-brand-300 dark:ring-brand-500/40 ring-offset-1 dark:ring-offset-zinc-900'
                        : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

            </div>

            {/* Contextual Category Offer Notification */}
            {selectedCategory !== 'All' && (
              <div className="bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl p-2.5 sm:p-3 mb-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    ⚡
                  </span>
                  <span className="truncate text-gray-800 dark:text-zinc-200">
                    Showing deals in <b>{selectedCategory}</b> • Guaranteed counter cashback applied
                  </span>
                </div>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold text-[11px] shrink-0 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Show All</span>
                </button>
              </div>
            )}

            {/* Section Header & Refresh */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base">
                  {selectedCategory === 'All' ? 'Clearance Deals' : `${selectedCategory} Clearance`}
                </h3>
                <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400 bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                  {filteredProducts.length} Pieces
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStoreModalOpen(true)}
                  className="text-xs font-semibold text-brand-600 dark:text-rose-400 hover:text-brand-700 flex items-center gap-1 bg-rose-50 dark:bg-zinc-800 px-2.5 py-1 rounded-xl border border-rose-100 dark:border-zinc-700"
                >
                  <MapPin className="w-3 h-3" />
                  <span className="hidden xs:inline">Store</span>
                </button>
                <button
                  onClick={loadData}
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 py-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl p-3 border border-gray-100 dark:border-zinc-800 animate-pulse space-y-2.5">
                    <div className="aspect-[4/5] bg-gray-200 dark:bg-zinc-800 rounded-2xl"></div>
                    <div className="h-3.5 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-md w-1/2"></div>
                    <div className="h-7 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-100 dark:border-zinc-800 shadow-sm my-6">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center mb-3">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-gray-900 dark:text-white text-base">No Matching Pieces Found</h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  We couldn't find any clearance items in this section right now. Try switching categories or clearing search.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSelectedGender('All'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  View All Clearance Stock
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBook={(p) => setBookingProduct(p)}
                    onOpenDetail={(p) => setSelectedProductDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES VIEW */}
        {activeTab === 'categories' && (
          <CategoriesView
            products={products}
            onSelectCategory={(cat, gen) => {
              setSelectedCategory(cat);
              if (gen) setSelectedGender(gen);
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* TAB 3: MY 24H TOKENS VIEW */}
        {activeTab === 'tokens' && (
          <div className="max-w-2xl mx-auto space-y-4 pb-24 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white">My 24h Clearance Passes</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Show QR at store counter to claim guaranteed cashback</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5" />
              </div>
            </div>

            {/* Sub-Tabs: Active vs History */}
            <div className="flex gap-2 p-1 bg-gray-200/70 dark:bg-zinc-800/80 rounded-2xl">
              <button
                onClick={() => setTokenSubTab('ACTIVE')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tokenSubTab === 'ACTIVE'
                    ? 'bg-white dark:bg-zinc-900 text-brand-600 dark:text-rose-400 shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                }`}
              >
                Active 24h Tokens ({myTokens.filter(t => t.status === 'ACTIVE').length})
              </button>
              <button
                onClick={() => setTokenSubTab('HISTORY')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  tokenSubTab === 'HISTORY'
                    ? 'bg-white dark:bg-zinc-900 text-brand-600 dark:text-rose-400 shadow-xs'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700'
                }`}
              >
                History ({myTokens.filter(t => t.status !== 'ACTIVE').length})
              </button>
            </div>

            {/* Token List */}
            <div className="space-y-4">
              {(tokenSubTab === 'ACTIVE'
                ? myTokens.filter(t => t.status === 'ACTIVE')
                : myTokens.filter(t => t.status !== 'ACTIVE')
              ).length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200/80 dark:border-zinc-800 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-brand-950/50 text-brand-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
                    <Ticket className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                    {tokenSubTab === 'ACTIVE' ? 'No Active 24h Tokens' : 'No Past Tokens Yet'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                    {tokenSubTab === 'ACTIVE'
                      ? 'Explore clearance pieces on the Home tab and lock your favorite item for 24 hours with ₹0 advance!'
                      : 'Tokens that you have claimed at the showroom counter or cancelled will show up here.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-500/30"
                  >
                    Browse Clearance Stock
                  </button>
                </div>
              ) : (
                (tokenSubTab === 'ACTIVE'
                  ? myTokens.filter(t => t.status === 'ACTIVE')
                  : myTokens.filter(t => t.status !== 'ACTIVE')
                ).map(token => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    shop={shop}
                    onCancel={handleCancelToken}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & APPEARANCE (LIGHT / DARK MODE SWITCH HERE) */}
        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            shop={shop}
            onOpenStoreModal={() => setIsStoreModalOpen(true)}
          />
        )}

      </main>

      {/* Flipkart-Style Sticky Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeTokenCount={activeTokensCount}
      />

      {/* Flipkart / Amazon Style Fullscreen Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          shop={shop}
          relatedProducts={products.filter(
            p => p.id !== selectedProductDetail.id && p.category === selectedProductDetail.category
          )}
          onClose={() => setSelectedProductDetail(null)}
          onBook={(p) => {
            setSelectedProductDetail(null);
            setBookingProduct(p);
          }}
          onSelectProduct={(p) => setSelectedProductDetail(p)}
        />
      )}

      {/* Booking Confirmation Modal */}
      {bookingProduct && (
        <BookingModal
          product={bookingProduct}
          user={user}
          onClose={() => setBookingProduct(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* My Tokens Drawer (Secondary access) */}
      <MyTokensDrawer
        isOpen={isTokensDrawerOpen}
        tokens={myTokens}
        shop={shop}
        onClose={() => setIsTokensDrawerOpen(false)}
        onCancelToken={handleCancelToken}
      />

      {/* Store Physical Info Modal */}
      <StoreModal
        isOpen={isStoreModalOpen}
        shop={shop}
        onClose={() => setIsStoreModalOpen(false)}
      />

    </div>
  );
};

export default App;
