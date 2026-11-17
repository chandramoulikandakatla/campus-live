import React from 'react';
import { useStore } from '../../lib/store';
import { OpsOverview } from './OpsOverview';
import { OpsOrders } from './OpsOrders';
import { OpsInventory } from './OpsInventory';
import { OpsStudents } from './OpsStudents';
import { OpsReconciliation } from './OpsReconciliation';

export function OpsPortal() {
  const { ecosystem, opsScreen, setOpsScreen } = useStore();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Operations Navigation */}
      <div className="mb-6 bg-slate-900/85 border border-amber-500/30 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Operations Control Center
          </span>
          {[
            { id: 'overview', label: '1. Operations Overview' },
            { id: 'orders', label: `2. Order Management (${ecosystem.orders.length})` },
            { id: 'inventory', label: `3. Inventory Management (${ecosystem.products.length})` },
            { id: 'students', label: `4. Student Management (${ecosystem.students.length})` },
            { id: 'reconciliation', label: '5. Wallet & Ledger Reconciliation' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setOpsScreen(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                opsScreen === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Routing */}
      {opsScreen === 'overview' && <OpsOverview />}
      {opsScreen === 'orders' && <OpsOrders />}
      {opsScreen === 'inventory' && <OpsInventory />}
      {opsScreen === 'students' && <OpsStudents />}
      {opsScreen === 'reconciliation' && <OpsReconciliation />}
    </main>
  );
}
