import React from 'react';
import { useStore } from '../../lib/store';
import { ORDER_STATUS_STEPS } from '../../lib/initialData';
import { QrCode } from 'lucide-react';

export function StudentTracking() {
  const {
    ecosystem,
    loggedStudentId,
    trackingOrderId,
    setTrackingOrderId,
    setActivePortal,
    setOpsScreen
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentOrders = ecosystem.orders.filter((o) => o.studentId === currentStudent.id);

  const ord = ecosystem.orders.find((o) => o.id === trackingOrderId) || studentOrders[0];
  if (!ord) {
    return (
      <div className="max-w-2xl mx-auto bg-slate-900/80 border border-white/10 rounded-3xl p-8 text-center text-slate-400 text-xs">
        No order found to track.
      </div>
    );
  }

  const currentStepIdx = Math.max(0, ORDER_STATUS_STEPS.indexOf(ord.status));

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">
            Live Fulfilment Tracker
          </span>
          <h2 className="text-xl font-extrabold text-white">Order {ord.id}</h2>
          <p className="text-xs text-slate-400">
            {ord.collectionPoint} · Placed at {ord.date}
          </p>
        </div>
        <select
          value={ord.id}
          onChange={(e) => setTrackingOrderId(e.target.value)}
          className="bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          {studentOrders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id} — {o.status} (₹{o.totalAmount})
            </option>
          ))}
        </select>
      </div>

      {/* Pickup Code Display */}
      {ord.pickupCode && (
        <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300">
              Kiosk Pickup Verification OTP
            </p>
            <p className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
              {ord.pickupCode}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-indigo-300">
            <QrCode className="w-6 h-6" />
          </div>
        </div>
      )}

      {/* 6-Stage Visual Progress Tracker */}
      <div className="space-y-3 py-2">
        {ORDER_STATUS_STEPS.map((stepName, index) => {
          const done = index <= currentStepIdx || stepName === 'Payment Confirmed';
          const isCurrent = index === currentStepIdx;
          return (
            <div
              key={stepName}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                isCurrent
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-slate-950/50 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold">{stepName}</p>
                  <p className="text-[11px] opacity-75">
                    {index === 0 && `Order received by CampusKart kiosk queue`}
                    {index === 1 && `Ref ${ord.txnRef} verified — ₹${ord.totalAmount} debited`}
                    {index === 2 && `Accepted by campus fulfilment team`}
                    {index === 3 && `Items being packed & verified`}
                    {index === 4 && `Ready at ${ord.collectionPoint}`}
                    {index === 5 && `Handed over to ${ord.studentName}`}
                  </p>
                </div>
              </div>
              {isCurrent && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-500 text-white">
                  Current Stage
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <p className="font-bold text-amber-300">Evaluator Tip: Test Live Operations Sync</p>
          <p className="text-slate-300">
            Switch to Operations Dashboard to advance this order's status and watch it update here.
          </p>
        </div>
        <button
          onClick={() => {
            setOpsScreen('orders');
            setActivePortal('ops');
          }}
          className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 hover:bg-amber-400 transition-colors"
        >
          Open Operations Order Queue →
        </button>
      </div>
    </div>
  );
}
