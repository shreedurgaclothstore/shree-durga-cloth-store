import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Trash2, Ban, CheckCircle2, AlertCircle, Plus, Minus } from 'lucide-react';
import { Product } from '../types';
import { MerchantApi } from '../services/merchantApi';

export const StockListTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await MerchantApi.getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}" from the catalog?`)) {
      return;
    }

    const success = await MerchantApi.deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setActionMsg({ type: 'success', text: `Garment "${title}" was deleted from inventory.` });
    } else {
      setActionMsg({ type: 'error', text: 'Failed to delete garment.' });
    }
  };

  const handleToggleSoldOut = async (p: Product) => {
    const newQty = p.availableQuantity > 0 ? 0 : 1;
    const success = await MerchantApi.updateStock(p.id, newQty);
    if (success) {
      setProducts(prev => prev.map(item => {
        if (item.id === p.id) {
          return {
            ...item,
            availableQuantity: newQty,
            totalQuantity: newQty,
            status: newQty > 0 ? 'AVAILABLE' : 'SOLD_OUT'
          };
        }
        return item;
      }));
      setActionMsg({
        type: 'success',
        text: newQty === 0 ? `Marked "${p.title}" as Sold Out!` : `Restocked "${p.title}" (+1 piece)`
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Clearance Inventory & Stock Control</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage quantities, mark sold items, or delete deadstock pieces.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {actionMsg && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Stock Cards */}
      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 text-xs text-gray-500">
          No garments found in database. Use the "Add Stock" tab to upload your first item.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const isSold = p.availableQuantity <= 0 || p.status === 'SOLD_OUT';

            return (
              <div
                key={p.id}
                className={`bg-white p-4 rounded-2xl border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSold ? 'border-gray-200 bg-gray-50/80 opacity-85' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-200"
                    />
                    {isSold && (
                      <span className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-[9px] font-black text-white uppercase">
                        Sold
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {p.category} • Size {p.size}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        !isSold ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {!isSold ? `${p.availableQuantity} in stock` : 'Out of Stock / Sold'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-gray-900 truncate mt-0.5">
                      {p.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="line-through text-gray-400">₹{p.originalPrice}</span>
                      <span className="font-bold text-emerald-700">₹{p.discountedPrice}</span>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                        +₹{p.cashbackAmount} Cashback
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (Mark Sold Out / Restock / Delete) */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
                  
                  {/* Toggle Out of stock / Restock */}
                  <button
                    onClick={() => handleToggleSoldOut(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      !isSold
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {!isSold ? (
                      <>
                        <Ban className="w-3.5 h-3.5 text-amber-700" />
                        <span>Mark Sold</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Restock (+1)</span>
                      </>
                    )}
                  </button>

                  {/* Delete Garment */}
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-500 hover:text-rose-600 transition-colors"
                    title="Delete Garment Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
