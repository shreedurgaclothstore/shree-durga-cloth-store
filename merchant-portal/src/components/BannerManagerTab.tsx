import React, { useState, useEffect } from 'react';
import { Tag, Trash2, Plus, Sparkles, Image, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { MerchantApi } from '../services/merchantApi';
import { Banner } from '../types';

export const BannerManagerTab: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('HOT CLEARANCE');
  const [discountText, setDiscountText] = useState('Flat 65% OFF');
  const [cashbackBadge, setCashbackBadge] = useState('+₹150 Cashback');
  const [targetCategory, setTargetCategory] = useState('All');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80');
  const [gradient, setGradient] = useState('from-purple-950 via-rose-900 to-amber-800');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await MerchantApi.getBanners();
      setBanners(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this promo banner from the customer app?')) return;
    const ok = await MerchantApi.deleteBanner(id);
    if (ok) {
      setBanners(prev => prev.filter(b => b.id !== id));
      setMsg({ type: 'success', text: 'Banner deleted successfully.' });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tag.trim()) {
      setMsg({ type: 'error', text: 'Title and Tag are required.' });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const res = await MerchantApi.addBanner({
        title: title.trim(),
        subtitle: subtitle.trim(),
        tag: tag.trim(),
        discountText: discountText.trim(),
        cashbackBadge: cashbackBadge.trim(),
        targetCategory,
        imageUrl,
        gradient
      });

      if (res.success) {
        setMsg({ type: 'success', text: '🎉 Banner published to customer app carousel!' });
        setShowAddForm(false);
        setTitle('');
        setSubtitle('');
        loadBanners();
      } else {
        setMsg({ type: 'error', text: res.error || 'Failed to save banner' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Storefront Sliding Banners</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage Flipkart/Amazon style offer slides shown to customers on the homepage.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'New Banner'}</span>
        </button>
      </div>

      {msg && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add New Banner Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-3xl p-5 border border-emerald-200 shadow-md space-y-3.5 animate-in fade-in zoom-in-95">
          <h3 className="font-extrabold text-sm text-gray-900">Create Promotional Slide</h3>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Offer Tag / Pill (e.g. FLAT 70% OFF)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. FESTIVE CLEARANCE"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Headline Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Saree & Ethnic Festive Blowout!"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Subtitle / Deal Details</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Pure Banarasi & Embroidered Kurtis at Unbelievable Prices!"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Discount Tag</label>
              <input
                type="text"
                value={discountText}
                onChange={(e) => setDiscountText(e.target.value)}
                placeholder="e.g. Starting ₹499"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cashback Pill</label>
              <input
                type="text"
                value={cashbackBadge}
                onChange={(e) => setCashbackBadge(e.target.value)}
                placeholder="e.g. +₹150 Cashback"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Target Section/Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                <option value="All">All Categories</option>
                <option value="Saree">Saree</option>
                <option value="Kurti & Ethnic">Kurti & Ethnic</option>
                <option value="Jeans">Jeans</option>
                <option value="Shirt">Shirt</option>
                <option value="Jacket & Winter">Jacket & Winter</option>
                <option value="Trousers">Trousers</option>
                <option value="Kids Wear">Kids Wear</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Color Theme</label>
              <select
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                <option value="from-purple-950 via-rose-900 to-amber-800">Purple / Crimson / Gold</option>
                <option value="from-blue-950 via-indigo-900 to-cyan-900">Navy / Denim Blue</option>
                <option value="from-rose-950 via-brand-800 to-amber-900">Rose Red / Festive Gold</option>
                <option value="from-emerald-950 via-teal-900 to-blue-950">Forest Emerald / Teal</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            {saving ? 'Publishing...' : 'Publish Banner to Storefront'}
          </button>
        </form>
      )}

      {/* Active Banners List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-gray-500 border border-gray-200">
            No banners active. Click "New Banner" to add one.
          </div>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-black aspect-[3/1]">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover opacity-60" />
              <div className={`absolute inset-0 bg-gradient-to-r ${b.gradient} opacity-80`}></div>
              
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black">
                    {b.tag} • {b.targetCategory || 'All'}
                  </span>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm sm:text-base leading-snug drop-shadow">{b.title}</h4>
                  <p className="text-[11px] text-gray-200 truncate mt-0.5">{b.subtitle}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
