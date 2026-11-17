import React from 'react';
import { useStore } from '../../lib/store';

export function ParentOrders() {
  const { ecosystem, linkedStudentId, setReceiptModalOrder } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentOrders = ecosystem.orders.filter((o) => o.studentId === parentLinkedStudent.id);

  return (
    <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-white">
          Linked Student Order History ({parentLinkedStudent.name})
        </h2>
        <p className="text-xs text-slate-400">
          Inspect item-level receipts and live fulfilment statuses
        </p>
      </div>
      <div className="space-y-3">
        {parentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl">
            No orders found for {parentLinkedStudent.name}.
          </div>
        ) : (
          parentOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">{ord.id}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    {ord.status}
                  </span>
                  <span className="text-slate-400">{ord.date}</span>
                </div>
                <p className="text-slate-200 mt-1">
                  {ord.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Payment: {ord.paymentStatus} (Ref: {ord.txnRef}) · Point: {ord.collectionPoint}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-white">₹{ord.totalAmount}</span>
                <button
                  onClick={() => setReceiptModalOrder(ord)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                >
                  Inspect Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
