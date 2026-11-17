import React from 'react';
import { useStore } from '../../lib/store';

export function OpsOverview() {
  const { ecosystem, setOpsScreen } = useStore();

  const totalTransactionValue = ecosystem.transactions.reduce(
    (acc, t) => acc + Math.abs(t.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Registered Students</span>
          <p className="text-2xl font-black text-white mt-1">{ecosystem.students.length}</p>
          <span className="text-[11px] text-emerald-400">
            {ecosystem.students.filter((s) => s.status === 'Active').length} Active Accounts
          </span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Orders</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{ecosystem.orders.length}</p>
          <span className="text-[11px] text-slate-400">
            {
              ecosystem.orders.filter(
                (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
              ).length
            }{' '}
            Pending / Active
          </span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Completed vs. Cancelled</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {ecosystem.orders.filter((o) => o.status === 'Completed').length} /{' '}
            {ecosystem.orders.filter((o) => o.status === 'Cancelled').length}
          </p>
          <span className="text-[11px] text-slate-400">Fulfilment completion</span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Demo Transaction Value</span>
          <p className="text-2xl font-black text-indigo-400 mt-1">
            ₹{totalTransactionValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-400">100% Ledger Reconciled</span>
        </div>
      </div>

      {/* Inventory Status & Pending Fulfilment Queue */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Live Incoming Orders Queue</h3>
            <button
              onClick={() => setOpsScreen('orders')}
              className="text-xs text-amber-400 hover:underline"
            >
              Manage All Orders →
            </button>
          </div>
          <div className="space-y-2.5">
            {ecosystem.orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">
                    {ord.id} — {ord.studentName} ({ord.studentId})
                  </p>
                  <p className="text-slate-400">
                    {ord.items.length} items · ₹{ord.totalAmount} · {ord.fulfilmentMethod}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold">
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Inventory Low-Stock Alerts</h3>
            <button
              onClick={() => setOpsScreen('inventory')}
              className="text-xs text-amber-400 hover:underline"
            >
              Manage Catalogue →
            </button>
          </div>
          <div className="space-y-2.5">
            {ecosystem.products
              .filter((p) => p.stock <= 15)
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">
                      {p.name} ({p.id})
                    </p>
                    <p className="text-slate-400">
                      {p.category} · ₹{p.price}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-bold ${
                      p.stock === 0
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {p.stock === 0 ? 'Out of Stock (0)' : `Low Stock (${p.stock})`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
