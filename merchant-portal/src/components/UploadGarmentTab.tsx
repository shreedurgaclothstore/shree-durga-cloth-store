import React, { useState } from 'react';
import { UploadCloud, Camera, CheckCircle2, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { MerchantApi } from '../services/merchantApi';

export const UploadGarmentTab: React.FC<{ onPublished?: () => void }> = ({ onPublished }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Shirt');
  const [gender, setGender] = useState('Men');
  const [size, setSize] = useState('L');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [cashbackAmount, setCashbackAmount] = useState('50');
  const [quantity, setQuantity] = useState('1');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Photo Selection or Camera Snap
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample stock images for quick testing if no camera handy
  const handlePresetPhoto = (url: string) => {
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please enter a title for the garment.');
      return;
    }
    if (!originalPrice || !discountedPrice) {
      setErrorMsg('Please enter Original Price and Clearance Price.');
      return;
    }
    if (!imagePreview) {
      setErrorMsg('Please snap a photo of the cloth or select an image.');
      return;
    }

    setLoading(true);
    try {
      const res = await MerchantApi.addProduct({
        title: title.trim(),
        description: description.trim(),
        category,
        gender,
        size,
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        cashbackAmount: Number(cashbackAmount) || 0,
        quantity: Number(quantity) || 1,
        imageUrl: imagePreview
      });

      if (res.success) {
        setSuccessMsg('🎉 Garment added to clearance catalog! Now live for customers to reserve.');
        // Reset form
        setTitle('');
        setDescription('');
        setOriginalPrice('');
        setDiscountedPrice('');
        setImagePreview(null);
        if (onPublished) onPublished();
      } else {
        setErrorMsg(res.error || 'Failed to add product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const discountPercent = originalPrice && discountedPrice
    ? Math.round(((Number(originalPrice) - Number(discountedPrice)) / Number(originalPrice)) * 100)
    : 0;

  const netEffective = discountedPrice
    ? Number(discountedPrice) - (Number(cashbackAmount) || 0)
    : 0;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-200">
      
      <div className="mb-5">
        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-emerald-600" />
          <span>Upload Clearance Garment</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Take a quick photo of old/clearance stock from your phone camera and publish with cashback.
        </p>
      </div>

      {successMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Photo Upload / Camera Snap */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Garment Photo (Camera / Gallery) *
          </label>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100 border border-gray-200 mb-2">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Dual Action: Live Camera OR Photo Gallery */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. Live Camera Snap */}
                <label className="py-4 px-3 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs">
                  <Camera className="w-7 h-7 mb-1.5 text-emerald-600" />
                  <span className="text-xs font-black">Live Camera</span>
                  <span className="text-[10px] text-emerald-700/80 mt-0.5">Click with phone camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* 2. Choose from Gallery / Files */}
                <label className="py-4 px-3 bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-2 border-dashed border-blue-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shadow-2xs">
                  <ImageIcon className="w-7 h-7 mb-1.5 text-blue-600" />
                  <span className="text-xs font-black">Choose Gallery</span>
                  <span className="text-[10px] text-blue-700/80 mt-0.5">Pick from phone storage</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

              </div>

              {/* Sample Stock Photos for Fast Testing */}
              <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Or preset photo:</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80')}
                    className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Shirt
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80')}
                    className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Jeans
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80')}
                    className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Kurti
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80')}
                    className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Saree
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Product Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Raymond Dark Grey Formal Trouser"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Category, Gender, Size in a row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Shirt">Shirt</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Jeans">Jeans</option>
              <option value="Trousers">Trousers</option>
              <option value="Kurti & Ethnic">Kurti</option>
              <option value="Jacket & Winter">Jacket</option>
              <option value="Saree">Saree</option>
              <option value="Kids Wear">Kids</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Kids">Kids</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Size
            </label>
            <input
              type="text"
              placeholder="e.g. M, 32"
              value={size}
              onChange={(e) => setSize(e.target.value.toUpperCase())}
              className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Pricing & Cashback Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Original MRP (₹) *
            </label>
            <input
              type="number"
              placeholder="1999"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-1">
              Clearance Price (₹) *
            </label>
            <input
              type="number"
              placeholder="699"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-emerald-300 text-emerald-700 font-extrabold rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
              Store Cashback (₹)
            </label>
            <input
              type="number"
              placeholder="50"
              value={cashbackAmount}
              onChange={(e) => setCashbackAmount(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 text-amber-700 font-bold rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Stock Qty
            </label>
            <input
              type="number"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-bold"
            />
          </div>
        </div>

        {/* Live Deal Preview Badge */}
        {discountPercent > 0 && (
          <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200">
            <span className="font-semibold text-gray-600">
              Customer Deal: <b className="text-rose-600">{discountPercent}% OFF</b>
            </span>
            <span className="font-bold text-emerald-700">
              Customer effectively pays: ₹{netEffective}
            </span>
          </div>
        )}

        {/* Short Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Short Description (Optional)
          </label>
          <textarea
            placeholder="e.g. Slim fit pure cotton with subtle stretch. Clearance batch."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{loading ? 'Publishing Garment...' : 'Publish to Clearance Catalog'}</span>
        </button>

      </form>
    </div>
  );
};
