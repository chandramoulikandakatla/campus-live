import React from 'react';
import { ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { ProductArtwork } from '../common/ProductArtwork';

export function StudentCart() {
  const {
    ecosystem,
    loggedStudentId,
    setStudentScreen,
    cart,
    updateCartQty,
    removeFromCart,
    getCartCount,
    getCartTotal
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];

  const populatedCart = cart
    .map((item) => {
      const prod = ecosystem.products.find((p) => p.id === item.productId);
      if (!prod) return null;
      return {
        ...prod,
        qty: item.qty,
        subtotal: prod.price * item.qty
      };
    })
    .filter(Boolean) as (typeof ecosystem.products[0] & { qty: number; subtotal: number })[];

  const cartItemCount = getCartCount();
  const cartSubtotal = getCartTotal();
  const cartFinalPayable = cartSubtotal; // 0 convenience fee

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Your CampusKart Shopping Bag</h1>
          <p className="text-xs text-slate-400">Contents are preserved across screens</p>
        </div>
        <button
          onClick={() => setStudentScreen('shop')}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </button>
      </div>

      {populatedCart.length === 0 ? (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the student catalogue to add snacks, beverages, academic supplies, or daily essentials.
          </p>
          <button
            onClick={() => setStudentScreen('shop')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            {populatedCart.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/85 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <ProductArtwork
                    category={item.category}
                    id={item.id}
                    className="w-20 h-20 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] text-indigo-400 font-medium">{item.category}</span>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Unit Price: ₹{item.price} · Stock: {item.stock}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-2 bg-slate-950 border border-white/15 rounded-xl px-2.5 py-1">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="p-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="p-1 text-slate-300 hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[60px]">
                    <span className="text-sm font-extrabold text-white">₹{item.subtotal}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4 h-fit">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Cart Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Item Count</span>
                <span className="font-semibold text-white">{cartItemCount} items</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Campus Pilot Handling Charge</span>
                <span className="text-emerald-400 font-semibold">₹0 (Waived)</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                <span>Final Payable Amount</span>
                <span className="text-indigo-400 text-base">₹{cartFinalPayable}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs flex justify-between items-center">
              <span className="text-slate-400">Your Wallet Balance:</span>
              <span
                className={`font-bold ${
                  currentStudent.walletBalance >= cartFinalPayable
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                ₹{currentStudent.walletBalance}
              </span>
            </div>

            <button
              onClick={() => setStudentScreen('order_review')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setStudentScreen('shop')}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
