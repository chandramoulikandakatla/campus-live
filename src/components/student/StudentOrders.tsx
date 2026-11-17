import React, { useState } from 'react';
import { useStore } from '../../lib/store';

export function StudentOrders() {
  const {
    ecosystem,
    loggedStudentId,
    setStudentScreen,
    setTrackingOrderId,
    setReceiptModalOrder
  } = useStore();

  const [orderFilter, setOrderFilter] = useState('All Orders');

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentOrders = ecosystem.orders.filter((o) => o.studentId === currentStudent.id);

  const filteredOrders = studentOrders.filter(
    (o) => orderFilter === 'All Orders' || o.status === orderFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My CampusKart Orders</h1>
          <p className="text-xs text-slate-400">
            Synchronized in real time with CampusKart Operations
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            'All Orders',
            'Order Placed',
            'Accepted',
            'Preparing',
            'Ready for Collection',
            'Completed',
            'Cancelled'
          ].map((st) => (
            <button
              key={st}
              onClick={() => setOrderFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                orderFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center text-slate-400 text-xs">
            No orders found under {orderFilter}.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-slate-900/85 border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-white">{ord.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      ord.status === 'Completed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : ord.status === 'Ready for Collection'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {ord.date} · {ord.collectionPoint}
                </p>
                <div className="mt-3 space-y-1">
                  {ord.items.map((it, idx) => (
                    <p key={idx} className="text-xs text-slate-200">
                      {it.qty}× {it.name} <span className="text-slate-400">(₹{it.subtotal})</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {ord.items.reduce((a, b) => a + b.qty, 0)} units
                  </span>
                  <span className="text-base font-extrabold text-white">₹{ord.totalAmount}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReceiptModalOrder(ord)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 transition-colors"
                  >
                    Receipt
                  </button>
                  <button
                    onClick={() => {
                      setTrackingOrderId(ord.id);
                      setStudentScreen('order_tracking');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
                  >
                    View Details & Track →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
