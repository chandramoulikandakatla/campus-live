import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useStore } from '../../lib/store';

export function CollegeOverview() {
  const { ecosystem, setCollegeScreen } = useStore();

  const totalOrderVal = ecosystem.orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalFundedVal = ecosystem.transactions
    .filter((t) => t.type === 'Wallet Funding')
    .reduce((acc, t) => acc + t.amount, 0);

  const aggCatMap: Record<string, number> = {};
  ecosystem.orders.forEach((o) => {
    o.items.forEach((it) => {
      aggCatMap[it.category] = (aggCatMap[it.category] || 0) + it.subtotal;
    });
  });
  const aggCatData = Object.entries(aggCatMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Participating Pilot Students</span>
          <p className="text-3xl font-black text-white mt-1">{ecosystem.students.length}</p>
          <span className="text-[11px] text-emerald-400">
            {ecosystem.students.filter((s) => s.status === 'Active').length} Active Pilot Participants
          </span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Campus Orders Processed</span>
          <p className="text-3xl font-black text-violet-400 mt-1">{ecosystem.orders.length}</p>
          <span className="text-[11px] text-slate-400">100% digital kiosk/web fulfilment</span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Aggregate Order Volume</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">
            ₹{totalOrderVal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Reconciled across all categories</span>
        </div>
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Aggregate Parent Wallet Inflow</span>
          <p className="text-3xl font-black text-amber-400 mt-1">
            ₹{totalFundedVal.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Zero cash handled by college</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">
            Aggregate Product Category Distribution
          </h3>
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggCatData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Aggregate Spend (₹)"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold">
              Institutional Privacy Compliance Active
            </span>
            <h3 className="text-lg font-bold text-white">
              Zero Administrative Overhead & Student Privacy
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with CampusKart’s institutional governance model, individual student
              purchases, personal wallet balances, and parent financial credentials are strictly
              isolated from college administration screens.
            </p>
            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <p>
                ✓ <strong>Kiosk Turnaround Efficiency:</strong> 98.4% orders fulfilled within break
                window
              </p>
              <p>
                ✓ <strong>Collection Points Active:</strong>{' '}
                {ecosystem.college.collectionPoints.length} Campus Zones
              </p>
              <p>
                ✓ <strong>Reconciliation Status:</strong> 100% Automated Ledger Match
              </p>
            </div>
          </div>
          <button
            onClick={() => setCollegeScreen('reports')}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs mt-4 transition-colors"
          >
            View Monthly Consolidated Invoices & Reports →
          </button>
        </div>
      </div>
    </div>
  );
}
