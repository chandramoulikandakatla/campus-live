import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import { ORDER_STATUS_STEPS } from '../../lib/initialData';

export function OpsOrders() {
  const { ecosystem, opsOrderFilter, setOpsOrderFilter, advanceOrderStatus, showToast } = useStore();

  const [otpPromptOrderId, setOtpPromptOrderId] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  const filteredOrders = ecosystem.orders.filter(
    (o) => opsOrderFilter === 'All' || o.status === opsOrderFilter
  );

  const handleAdvance = (orderId: string, nextStatus: string) => {
    const order = ecosystem.orders.find((o) => o.id === orderId);
    if (!order) return;

    if (nextStatus === 'Completed' && order.pickupCode) {
      setOtpPromptOrderId(orderId);
      setEnteredOtp('');
      return;
    }

    const res = advanceOrderStatus(orderId);
    if (!res.success) {
      showToast('Action Failed', res.message, 'error');
    }
  };

  const handleVerifyOtpAndComplete = () => {
    if (!otpPromptOrderId) return;
    const res = advanceOrderStatus(otpPromptOrderId, enteredOtp);
    if (res.success) {
      setOtpPromptOrderId(null);
      setEnteredOtp('');
    } else {
      showToast('Invalid OTP', res.message, 'error');
    }
  };

  return (
    <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">Real-Time Order Fulfilment Queue</h2>
          <p className="text-xs text-slate-400">
            Updating any order status immediately propagates to Student Order Tracking & Parent
            Linked Orders
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Order Placed', 'Accepted', 'Preparing', 'Ready for Collection', 'Completed'].map(
            (f) => (
              <button
                key={f}
                onClick={() => setOpsOrderFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  opsOrderFilter === f
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {otpPromptOrderId && (() => {
        const targetOrder = ecosystem.orders.find((o) => o.id === otpPromptOrderId);
        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Verify Student Pickup OTP</h3>
              <p className="text-xs text-slate-300">
                To hand over Order <strong>{otpPromptOrderId}</strong> to {targetOrder?.studentName}, enter their 6-digit OTP code.
              </p>
              {targetOrder?.pickupCode && (
                <p className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 font-mono">
                  Student Pickup Code: <strong>{targetOrder.pickupCode}</strong>
                </p>
              )}
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-center font-mono font-bold text-lg text-white focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleVerifyOtpAndComplete}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Verify & Hand Over
                </button>
                <button
                  onClick={() => setOtpPromptOrderId(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl">
            No orders found under {opsOrderFilter}.
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const currentIdx = ORDER_STATUS_STEPS.indexOf(ord.status);
            return (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                    <span className="text-indigo-300 font-semibold">
                      {ord.studentName} ({ord.studentId})
                    </span>
                    <span className="text-slate-400">{ord.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">
                      ₹{ord.totalAmount} ({ord.paymentStatus})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {ord.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="text-slate-200 font-medium">
                      Items: {ord.items.map((i) => `${i.qty}× ${i.name}`).join(' | ')}
                    </p>
                    <p className="text-slate-400 mt-0.5">
                      Fulfilment: {ord.fulfilmentMethod} — {ord.collectionPoint}
                    </p>
                    {ord.pickupCode && (
                      <p className="text-amber-400 font-mono mt-0.5">
                        Pickup OTP: {ord.pickupCode}
                      </p>
                    )}
                  </div>

                  {/* One-Click Fulfilment Workflow Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ORDER_STATUS_STEPS.map((st, idx) => (
                      <button
                        key={st}
                        disabled={ord.status === 'Completed' || ord.status === 'Cancelled'}
                        onClick={() => {
                          if (idx === currentIdx + 1) {
                            handleAdvance(ord.id, st);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                          ord.status === st
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : idx === currentIdx + 1
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-amber-500/40'
                            : 'bg-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
