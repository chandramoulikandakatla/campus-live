import React from 'react';
import {
  Clock,
  Wallet,
  UserCheck,
  Truck,
  Star,
  Plus,
  RefreshCw,
  Package
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { CATEGORIES } from '../../lib/initialData';
import { ProductArtwork } from '../common/ProductArtwork';

export function StudentHome() {
  const {
    ecosystem,
    loggedStudentId,
    setStudentScreen,
    setSelectedProductId,
    setDetailQty,
    setSelectedCategory,
    addToCart,
    setTrackingOrderId,
    setShowDemoModal
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentOrders = ecosystem.orders.filter((o) => o.studentId === currentStudent.id);

  const handleOpenProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setDetailQty(1);
    setStudentScreen('product_detail');
  };

  return (
    <div className="space-y-6">
      {/* Personalized Header Bar */}
      <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-purple-950/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {currentStudent.institution}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentStudent.id} · {currentStudent.academicYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hey {currentStudent.firstName}, ready for your break?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Upcoming Pickup Window:</strong> {ecosystem.college.pilotWindow}
            </span>
          </p>
        </div>

        {/* Live Wallet Card & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 border border-white/15 rounded-2xl px-5 py-3.5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Available Wallet Balance
              </span>
              <span className="text-2xl font-black text-white">
                ₹{currentStudent.walletBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={() => setStudentScreen('wallet')}
              className="ml-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-indigo-300 transition-colors"
            >
              Ledger →
            </button>
          </div>

          <button
            onClick={() => setStudentScreen('profile')}
            className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 transition-colors"
            title="Student Profile"
          >
            <UserCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Current Offers & Order Tracking Shortcut Banner */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-gradient-to-r from-fuchsia-600/25 via-indigo-600/20 to-sky-600/25 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              Current Campus Offer
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">
              Zero Convenience Fee + 15% Off Insulated Flasks
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Pre-order before 12:30 PM for express priority pickup at Block A & Block B Smart Kiosks.
            </p>
          </div>
          <button
            onClick={() => setStudentScreen('shop')}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs shrink-0 hover:bg-indigo-50 transition-all"
          >
            Explore Catalogue →
          </button>
        </div>

        {/* Live Order Tracking Shortcut */}
        <div className="bg-slate-900/85 border border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Live Order Tracker
            </span>
            <span className="text-xs font-semibold text-white">
              {studentOrders[0]?.id || 'No Active Order'}
            </span>
          </div>
          {studentOrders[0] ? (
            <div className="my-2">
              <p className="text-sm font-bold text-white">{studentOrders[0].status}</p>
              <p className="text-xs text-slate-400 truncate">{studentOrders[0].collectionPoint}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 my-2">Place an order to track real-time preparation.</p>
          )}
          <button
            onClick={() => {
              if (studentOrders[0]) setTrackingOrderId(studentOrders[0].id);
              setStudentScreen('order_tracking');
            }}
            className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
          >
            Track My Order →
          </button>
        </div>
      </div>

      {/* Shop by Category */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white">Shop by Category</h2>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setStudentScreen('shop');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View Full Catalogue ({ecosystem.products.length} items) →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setStudentScreen('shop');
              }}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-indigo-950/60 border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
            >
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">{cat}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {ecosystem.products.filter((p) => p.category === cat && p.active).length} products
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Featured Campus Products
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ecosystem.products
            .filter((p) => p.featured && p.active)
            .slice(0, 4)
            .map((prod) => (
              <div
                key={prod.id}
                className="bg-slate-900/85 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div
                    className="cursor-pointer"
                    onClick={() => handleOpenProductDetail(prod.id)}
                  >
                    <ProductArtwork category={prod.category} id={prod.id} className="w-full h-32" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                      {prod.category}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400">{prod.offerTag}</span>
                  </div>
                  <h3
                    onClick={() => handleOpenProductDetail(prod.id)}
                    className="text-sm font-bold text-white mt-1.5 cursor-pointer hover:text-indigo-300 line-clamp-1"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-base font-extrabold text-white">₹{prod.price}</span>
                    <span className="block text-[10px] text-emerald-400">{prod.stock} in stock</span>
                  </div>
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Frequently Purchased & Recent Orders Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Frequently Purchased */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" /> Frequently Purchased by{' '}
            {currentStudent.firstName}
          </h3>
          <div className="space-y-2.5">
            {ecosystem.products
              .filter((p) => p.frequent && p.active)
              .slice(0, 4)
              .map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="min-w-0 pr-3">
                    <p
                      onClick={() => handleOpenProductDetail(prod.id)}
                      className="text-xs font-semibold text-white truncate cursor-pointer hover:text-indigo-300"
                    >
                      {prod.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {prod.category} · ₹{prod.price}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold shrink-0 transition-colors"
                  >
                    + Reorder
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Orders & Help */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" /> Recent Orders
              </h3>
              <button
                onClick={() => setStudentScreen('my_orders')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                See All →
              </button>
            </div>
            <div className="space-y-2.5">
              {studentOrders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div>
                    <p className="font-bold text-white">
                      {ord.id}{' '}
                      <span className="text-slate-400 font-normal">
                        ({ord.items.length} items)
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {ord.date} · {ord.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">₹{ord.totalAmount}</span>
                    <button
                      onClick={() => {
                        setTrackingOrderId(ord.id);
                        setStudentScreen('order_tracking');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] transition-colors"
                    >
                      Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Campus Kiosk Support Helpline: Ext #402</span>
            <button
              onClick={() => setShowDemoModal(true)}
              className="text-indigo-400 hover:underline"
            >
              Help & Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
