import React from 'react';
import { ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { ProductArtwork } from '../common/ProductArtwork';

export function StudentProductDetail() {
  const {
    ecosystem,
    selectedProductId,
    detailQty,
    setDetailQty,
    setStudentScreen,
    cart,
    addToCart,
    getCartCount,
    getCartTotal,
    showToast
  } = useStore();

  const product =
    ecosystem.products.find((p) => p.id === selectedProductId) || ecosystem.products[0];
  const inCart = cart.find((c) => c.productId === product.id);

  const cartItemCount = getCartCount();
  const cartSubtotal = getCartTotal();

  return (
    <div className="max-w-4xl mx-auto bg-slate-900/85 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setStudentScreen('shop')}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalogue
        </button>
        <button
          onClick={() => setStudentScreen('cart')}
          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl font-semibold transition-colors"
        >
          <ShoppingBag className="w-4 h-4" /> Cart ({cartItemCount} items · ₹{cartSubtotal})
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <ProductArtwork category={product.category} id={product.id} className="w-full h-64 sm:h-72" />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              {product.category}
            </span>
            {product.offerTag && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-semibold">
                {product.offerTag}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-white">{product.name}</h1>
          <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Campus Price</span>
              <span className="text-3xl font-black text-white">₹{product.price}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Availability</span>
              {product.stock > 0 ? (
                <span className="text-sm font-bold text-emerald-400">
                  {product.stock} Units Available
                </span>
              ) : (
                <span className="text-sm font-bold text-rose-400">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-300">Select Quantity:</span>
            <div className="flex items-center gap-3 bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5">
              <button
                onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-white w-6 text-center">{detailQty}</span>
              <button
                onClick={() => {
                  if (detailQty < product.stock) setDetailQty(detailQty + 1);
                  else showToast('Stock Cap', `Maximum available stock is ${product.stock}.`, 'error');
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {inCart && (
            <p className="text-xs text-indigo-300">
              Currently in your cart:{' '}
              <strong>
                {inCart.qty} unit(s)
              </strong>{' '}
              (Subtotal: ₹{inCart.qty * product.price})
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              disabled={product.stock <= 0}
              onClick={() => addToCart(product, detailQty)}
              className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                product.stock <= 0
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add {detailQty} to Cart (₹{product.price * detailQty})</span>
            </button>
            <button
              onClick={() => setStudentScreen('cart')}
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
