import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  Wallet,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  Download,
  QrCode
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { OrderLineItem } from '../../types/ecosystem';

export function StudentCheckout() {
  const {
    ecosystem,
    loggedStudentId,
    studentScreen,
    setStudentScreen,
    cart,
    checkoutPoint,
    setCheckoutPoint,
    checkoutMethod,
    setCheckoutMethod,
    paymentProcessingStep,
    simulateFailureMode,
    setSimulateFailureMode,
    executeStudentPayment,
    confirmedOrder,
    setTrackingOrderId,
    setReceiptModalOrder,
    setActivePortal,
    setFundAmount,
    setCustomFundInput,
    setParentScreen,
    setParentAuthed,
    setLinkedStudentId
  } = useStore();

  const [fulfilmentType, setFulfilmentType] = useState('Campus Kiosk Pickup');

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];

  const populatedCart = cart
    .map((item) => {
      const prod = ecosystem.products.find((p) => p.id === item.productId);
      if (!prod) return null;
      return {
        productId: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        qty: item.qty,
        subtotal: prod.price * item.qty
      };
    })
    .filter(Boolean) as OrderLineItem[];

  const cartSubtotal = populatedCart.reduce((acc, i) => acc + i.subtotal, 0);
  const cartFinalPayable = cartSubtotal;
  const sufficient = currentStudent.walletBalance >= cartFinalPayable;
  const shortfall = Math.max(0, cartFinalPayable - currentStudent.walletBalance);

  // Screen 8: Order Review
  if (studentScreen === 'order_review') {
    return (
      <div className="max-w-3xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
              Phase 3 — Checkout Step 1
            </span>
            <h2 className="text-xl font-extrabold text-white">Order Review & Fulfilment</h2>
          </div>
          <button
            onClick={() => setStudentScreen('cart')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Edit Cart
          </button>
        </div>

        {/* Section 1: Order Details */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            1. Selected Products
          </h3>
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl divide-y divide-white/5">
            {populatedCart.map((item) => (
              <div key={item.productId} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-slate-400">
                    Qty: {item.qty} × ₹{item.price}
                  </p>
                </div>
                <span className="font-bold text-white">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="p-3.5 flex items-center justify-between text-sm font-extrabold text-white bg-indigo-950/30">
              <span>Total Order Value</span>
              <span className="text-indigo-300">₹{cartFinalPayable}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fulfilment Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            2. Campus Fulfilment Configuration
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {['Campus Kiosk Pickup', 'Hostel Delivery Counter'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setFulfilmentType(method)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  fulfilmentType === method
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}
              >
                <p className="text-xs font-bold">{method}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {method === 'Campus Kiosk Pickup'
                    ? 'Instant QR/PIN collection during break'
                    : 'Delivered to hostel gate dispensary'}
                </p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">
              Designated Campus Collection Point:
            </label>
            <select
              value={checkoutPoint}
              onChange={(e) => setCheckoutPoint(e.target.value)}
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {ecosystem.college.collectionPoints.map((cp) => (
                <option key={cp} value={cp}>
                  {cp}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Ordering & Collection Window:</strong> {ecosystem.college.pilotWindow}
            </span>
          </div>
        </div>

        {/* Section 3: Payment Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            3. Wallet & Payment Summary
          </h3>
          <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Current CampusKart Wallet Balance</span>
              <span className="font-bold text-white">₹{currentStudent.walletBalance}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Payable Amount</span>
              <span className="font-bold text-amber-300">₹{cartFinalPayable}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold">
              <span className="text-white">Remaining Balance After Purchase</span>
              <span
                className={
                  currentStudent.walletBalance - cartFinalPayable >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }
              >
                ₹{currentStudent.walletBalance - cartFinalPayable}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStudentScreen('payment_method')}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Screen 9: Select Payment Method
  if (studentScreen === 'payment_method') {
    return (
      <div className="max-w-2xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
              Phase 3 — Checkout Step 2
            </span>
            <h2 className="text-xl font-extrabold text-white">Select Payment Method</h2>
          </div>
          <button
            onClick={() => setStudentScreen('order_review')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Students are never asked for parent bank passwords, UPI PINs, or card numbers.</span>
        </div>

        {/* Payment Method Cards */}
        <div className="space-y-3">
          <div
            onClick={() => setCheckoutMethod('CampusKart Wallet')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              checkoutMethod === 'CampusKart Wallet'
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-slate-950/60 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    CampusKart Student Wallet (Default)
                  </p>
                  <p className="text-xs text-slate-400">
                    Instant zero-PIN deduction from parent-funded balance
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                Active Pilot Default
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-slate-950/40 opacity-60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/5 text-slate-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  External UPI / Direct Bank Cards
                </p>
                <p className="text-xs text-slate-500">
                  Disabled for student kiosk pilot — Parent Portal only
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Parent Only</span>
          </div>
        </div>

        {/* Wallet Balance Breakdown Table */}
        <div className="bg-slate-950 border border-white/15 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 text-slate-400 border-b border-white/10">
                <th className="text-left py-2.5 px-4 font-semibold">Description</th>
                <th className="text-right py-2.5 px-4 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-4 text-slate-300">Available wallet balance</td>
                <td className="py-3 px-4 text-right font-bold text-white">
                  ₹{currentStudent.walletBalance}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-300">Order amount</td>
                <td className="py-3 px-4 text-right font-bold text-amber-400">
                  ₹{cartFinalPayable}
                </td>
              </tr>
              <tr className="bg-white/5">
                <td className="py-3 px-4 font-bold text-white">Remaining balance</td>
                <td
                  className={`py-3 px-4 text-right font-extrabold text-sm ${
                    sufficient ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {sufficient
                    ? `₹${currentStudent.walletBalance - cartFinalPayable}`
                    : `-₹${shortfall} (Insufficient)`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Insufficient Balance Handler */}
        {!sufficient ? (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-3">
            <div className="flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <div>
                <p className="font-bold text-sm text-white">
                  Insufficient CampusKart Wallet Balance
                </p>
                <p className="mt-0.5">
                  You need an additional <strong>₹{shortfall}</strong> to complete this ₹
                  {cartFinalPayable} order. Payment cannot proceed until your wallet is topped up.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setLinkedStudentId(currentStudent.id);
                  setParentAuthed(true);
                  setFundAmount(Math.max(500, shortfall));
                  setCustomFundInput(String(Math.max(500, shortfall)));
                  setParentScreen('add_money');
                  setActivePortal('parent');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Switch to Parent Portal to Fund Now →
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setStudentScreen('wallet_verify')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <span>Proceed to Wallet Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Screen 10: Wallet Verify
  if (studentScreen === 'wallet_verify') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
              Phase 3 — Final Confirmation
            </span>
            <h2 className="text-xl font-extrabold text-white">Wallet Balance Verification</h2>
          </div>
          <button
            onClick={() => setStudentScreen('payment_method')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Student Name</span>
            <span className="font-bold text-white">{currentStudent.name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">CampusKart Student ID</span>
            <span className="font-mono font-bold text-indigo-300">{currentStudent.id}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Selected Payment Method</span>
            <span className="font-semibold text-white">{checkoutMethod}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Current Wallet Balance</span>
            <span className="font-bold text-white">₹{currentStudent.walletBalance}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Order Amount to Debit</span>
            <span className="font-bold text-amber-400">-₹{cartFinalPayable}</span>
          </div>
          <div className="flex justify-between pt-2 text-sm">
            <span className="font-bold text-white">Remaining Wallet Balance</span>
            <span className="font-extrabold text-emerald-400">
              ₹{currentStudent.walletBalance - cartFinalPayable}
            </span>
          </div>
        </div>

        {/* Evaluator Test Toggle for Failed Payment Scenario */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-slate-200">
              Evaluator Test Mode: Simulate Payment Failure?
            </p>
            <p className="text-[11px] text-slate-400">
              Tests that failed transactions preserve the cart and do not debit the wallet.
            </p>
          </div>
          <input
            type="checkbox"
            checked={simulateFailureMode}
            onChange={(e) => setSimulateFailureMode(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={() => executeStudentPayment()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Confirm and Pay ₹{cartFinalPayable}</span>
        </button>
      </div>
    );
  }

  // Screen 11: Payment Processing Animation
  if (studentScreen === 'payment_processing') {
    return (
      <div className="max-w-lg mx-auto my-10 bg-slate-900/95 border border-white/15 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
          Simulated Prototype Payment Engine — No Real Bank Transfer
        </span>

        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-400 animate-spin mx-auto flex items-center justify-center">
          <Wallet className="w-8 h-8 text-indigo-300 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white">
            {paymentProcessingStep === 1 && '0–1s: Payment Initiated...'}
            {paymentProcessingStep === 2 && '1–3s: Verifying Wallet & Authorizing Debit...'}
            {paymentProcessingStep === 3 && '3–5s: Generating Ledger Reference & Finalizing Order...'}
          </h2>
          <p className="text-xs text-slate-400">
            Please wait while the 5-second demonstration payment sequence completes.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2.5 text-left bg-slate-950 p-4 rounded-2xl border border-white/10 text-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                paymentProcessingStep >= 1 ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <span
              className={paymentProcessingStep >= 1 ? 'text-white font-medium' : 'text-slate-500'}
            >
              Step 1 (0–1s): Initiate CampusKart Wallet transaction
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                paymentProcessingStep >= 2 ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <span
              className={paymentProcessingStep >= 2 ? 'text-white font-medium' : 'text-slate-500'}
            >
              Step 2 (1–3s): Validate ₹{cartFinalPayable} against balance & spending limits
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                paymentProcessingStep >= 3 ? 'text-emerald-400' : 'text-slate-600'
              }`}
            />
            <span
              className={paymentProcessingStep >= 3 ? 'text-white font-medium' : 'text-slate-500'}
            >
              Step 3 (3–5s): Commit ledger debit & dispatch order to Operations
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Screen 12: Order Confirmation
  const ord = confirmedOrder || ecosystem.orders[0];
  if (!ord) return null;

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
          Simulated Wallet Debit Complete
        </span>
        <h1 className="text-2xl font-extrabold text-white">Order Confirmed!</h1>
        <p className="text-xs text-slate-300">
          Your order has been dispatched to the CampusKart Operations Dashboard and your Parent Portal has been updated.
        </p>
      </div>

      {/* Pickup Code Hero Card */}
      {ord.pickupCode && (
        <div className="bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-slate-950/90 border border-indigo-500/40 rounded-2xl p-4 text-center">
          <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">
            Student Kiosk Pickup Verification OTP
          </p>
          <p className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-emerald-400 my-1">
            {ord.pickupCode}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-indigo-300" /> Show this code or scan token at {ord.collectionPoint}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-white/10 text-xs">
        <div>
          <span className="text-slate-400 block">Order ID</span>
          <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Transaction Reference</span>
          <span className="font-mono font-bold text-indigo-300">{ord.txnRef}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Student Name & ID</span>
          <span className="font-semibold text-white">
            {ord.studentName} ({ord.studentId})
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Order Date & Time</span>
          <span className="font-semibold text-white">{ord.date}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Fulfilment Method</span>
          <span className="font-semibold text-emerald-300">{ord.fulfilmentMethod}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Collection Point & Window</span>
          <span className="font-semibold text-white">
            {ord.collectionPoint} ({ord.estimatedTime})
          </span>
        </div>
      </div>

      {/* Purchased Items */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
        <p className="font-mono uppercase text-[10px] text-slate-400">Purchased Products</p>
        {ord.items.map((it, i) => (
          <div key={i} className="flex justify-between py-1 border-b border-white/5">
            <span className="text-white">
              {it.qty}× {it.name}
            </span>
            <span className="font-bold text-white">₹{it.subtotal}</span>
          </div>
        ))}
        <div className="pt-2 flex justify-between text-slate-300">
          <span>Previous Wallet Balance</span>
          <span>₹{ord.previousBalance}</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-white">
          <span>Total Amount Paid</span>
          <span className="text-emerald-400">₹{ord.totalAmount}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Remaining Wallet Balance</span>
          <span className="font-bold text-indigo-300">₹{ord.remainingBalance}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setTrackingOrderId(ord.id);
            setStudentScreen('order_tracking');
          }}
          className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Truck className="w-4 h-4" /> Track Live Status
        </button>
        <button
          onClick={() => setReceiptModalOrder(ord)}
          className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" /> View Receipt
        </button>
        <button
          onClick={() => setStudentScreen('home')}
          className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
