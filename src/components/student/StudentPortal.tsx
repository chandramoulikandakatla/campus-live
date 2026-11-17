import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Package,
  Clock,
  Truck,
  Wallet,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { StudentAuth } from './StudentAuth';
import { StudentHome } from './StudentHome';
import { StudentShop } from './StudentShop';
import { StudentProductDetail } from './StudentProductDetail';
import { StudentCart } from './StudentCart';
import { StudentCheckout } from './StudentCheckout';
import { StudentOrders } from './StudentOrders';
import { StudentTracking } from './StudentTracking';
import { StudentWallet } from './StudentWallet';
import { StudentProfile } from './StudentProfile';

export function StudentPortal() {
  const {
    ecosystem,
    loggedStudentId,
    studentScreen,
    setStudentScreen,
    studentAuthed,
    setStudentAuthed,
    getCartCount
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentOrders = ecosystem.orders.filter((o) => o.studentId === currentStudent.id);
  const cartItemCount = getCartCount();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Student Sub-Navigation & Screen Jumper for Evaluators */}
      <div className="mb-6 bg-slate-900/70 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Student App
          </span>
          {studentAuthed ? (
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: 'home', label: '4. Home', icon: Sparkles },
                { id: 'shop', label: '5. Catalogue', icon: ShoppingBag },
                { id: 'cart', label: `7. Cart (${cartItemCount})`, icon: Package },
                { id: 'my_orders', label: `13. My Orders (${studentOrders.length})`, icon: Clock },
                { id: 'order_tracking', label: '14. Live Tracker', icon: Truck },
                { id: 'wallet', label: `15. Wallet (₹${currentStudent.walletBalance})`, icon: Wallet },
                { id: 'profile', label: '16. Profile', icon: UserCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStudentScreen(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      studentScreen === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Authentication Phase (
              {studentScreen === 'welcome'
                ? 'Screen 1: Welcome'
                : studentScreen === 'credentials'
                ? 'Screen 2: Credentials'
                : 'Screen 3: PIN Verification'}
              )
            </span>
          )}
        </div>

        {/* Evaluator Quick-Jump Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-400 hidden md:inline">Jump to Screen:</label>
          <select
            value={studentScreen}
            onChange={(e) => {
              const val = e.target.value as any;
              if (!['welcome', 'credentials', 'pin'].includes(val)) {
                setStudentAuthed(true);
              }
              setStudentScreen(val);
            }}
            className="bg-slate-950 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="welcome">Screen 1 — Welcome / Login</option>
            <option value="credentials">Screen 2 — Student Credentials</option>
            <option value="pin">Screen 3 — Student PIN Verification</option>
            <option value="home">Screen 4 — Student Home Dashboard</option>
            <option value="shop">Screen 5 — Shop / Product Catalogue</option>
            <option value="product_detail">Screen 6 — Product Details</option>
            <option value="cart">Screen 7 — Shopping Cart</option>
            <option value="order_review">Screen 8 — Order Review</option>
            <option value="payment_method">Screen 9 — Select Payment Method</option>
            <option value="wallet_verify">Screen 10 — Wallet Balance Verification</option>
            <option value="payment_processing">Screen 11 — Payment Processing (5s)</option>
            <option value="order_confirmation">Screen 12 — Order Confirmation</option>
            <option value="my_orders">Screen 13 — My Orders</option>
            <option value="order_tracking">Screen 14 — Order Tracking</option>
            <option value="wallet">Screen 15 — Student Wallet Ledger</option>
            <option value="profile">Screen 16 — Student Profile & Settings</option>
          </select>
        </div>
      </div>

      {/* Screen Routing */}
      {['welcome', 'credentials', 'pin'].includes(studentScreen) && <StudentAuth />}
      {studentScreen === 'home' && <StudentHome />}
      {studentScreen === 'shop' && <StudentShop />}
      {studentScreen === 'product_detail' && <StudentProductDetail />}
      {studentScreen === 'cart' && <StudentCart />}
      {[
        'order_review',
        'payment_method',
        'wallet_verify',
        'payment_processing',
        'order_confirmation'
      ].includes(studentScreen) && <StudentCheckout />}
      {studentScreen === 'my_orders' && <StudentOrders />}
      {studentScreen === 'order_tracking' && <StudentTracking />}
      {studentScreen === 'wallet' && <StudentWallet />}
      {studentScreen === 'profile' && <StudentProfile />}
    </main>
  );
}
