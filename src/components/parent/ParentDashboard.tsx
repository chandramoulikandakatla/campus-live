import React from 'react';
import { PlusCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStore } from '../../lib/store';

export function ParentDashboard() {
  const {
    ecosystem,
    linkedStudentId,
    setLinkedStudentId,
    setParentScreen
  } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentOrders = ecosystem.orders.filter((o) => o.studentId === parentLinkedStudent.id);
  const parentTransactions = ecosystem.transactions.filter(
    (t) => t.studentId === parentLinkedStudent.id
  );
  const parentControls =
    ecosystem.spendingControls[parentLinkedStudent.id] ||
    ecosystem.spendingControls['CK-2026-101'] || {
      dailyLimitEnabled: false,
      dailyLimit: 0
    };

  let totalAdded = 0;
  let totalSpent = 0;
  let purchaseCount = 0;

  parentTransactions.forEach((t) => {
    if (t.type === 'Wallet Funding') totalAdded += t.amount;
    else if (t.type === 'Student Purchase') {
      totalSpent += Math.abs(t.amount);
      purchaseCount += 1;
    } else if (t.type === 'Adjustment' && t.amount < 0) {
      totalSpent += Math.abs(t.amount);
    }
  });

  const categoryMap: Record<string, number> = {
    'Food and Snacks': 0,
    Beverages: 0,
    'Personal Care': 0,
    'Daily Essentials': 0,
    'Academic Supplies': 0,
    'Other Services': 0
  };

  parentOrders.forEach((ord) => {
    if (ord.status === 'Cancelled') return;
    ord.items.forEach((it) => {
      const cat = it.category || 'Daily Essentials';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.subtotal;
    });
  });

  const parentCategoryChartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Top Linked Student Financial Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-teal-950/90 border border-emerald-500/30 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Guardian Account: {parentLinkedStudent.parentName}
            </span>
            <select
              value={linkedStudentId}
              onChange={(e) => setLinkedStudentId(e.target.value)}
              className="bg-slate-950 border border-white/15 rounded-lg px-2 py-0.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            >
              {ecosystem.students.map((s) => (
                <option key={s.id} value={s.id}>
                  Linked Student: {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            {parentLinkedStudent.name} — Financial Activity Overview
          </h1>
          <p className="text-xs text-slate-300">
            {parentLinkedStudent.institution} · {parentLinkedStudent.academicYear}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/85 border border-emerald-500/30 rounded-2xl px-5 py-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">
              Current Student Wallet
            </span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{parentLinkedStudent.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <button
            onClick={() => setParentScreen('add_money')}
            className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Add Money to Wallet
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Available Wallet Balance</span>
          <p className="text-2xl font-black text-white mt-1">₹{parentLinkedStudent.walletBalance}</p>
          <span className="text-[11px] text-emerald-400">Reconciled with ledger</span>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Funds Added</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{totalAdded}</p>
          <span className="text-[11px] text-slate-400">Parent wallet top-ups</span>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Total Student Expenditure</span>
          <p className="text-2xl font-black text-amber-400 mt-1">₹{totalSpent}</p>
          <span className="text-[11px] text-slate-400">{purchaseCount} campus orders</span>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4">
          <span className="text-xs text-slate-400">Daily Limit Status</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {parentControls.dailyLimitEnabled ? `₹${parentControls.dailyLimit}/day` : 'Unrestricted'}
          </p>
          <button
            onClick={() => setParentScreen('controls')}
            className="text-[11px] text-emerald-400 hover:underline"
          >
            Configure Limits →
          </button>
        </div>
      </div>

      {/* Financial Visualizations Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">
              Spending by Category (Live Shared Data)
            </h3>
            <button
              onClick={() => setParentScreen('analytics')}
              className="text-xs text-emerald-400 hover:underline"
            >
              Full Analytics →
            </button>
          </div>
          <div className="relative h-64">
            {parentCategoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={parentCategoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {parentCategoryChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No purchases recorded yet for category breakdown.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Recent Financial Transactions</h3>
              <button
                onClick={() => setParentScreen('transactions')}
                className="text-xs text-emerald-400 hover:underline"
              >
                View Ledger →
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {parentTransactions.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{t.note}</p>
                    <p className="text-[11px] text-slate-400">
                      {t.timestamp} · {t.method}
                    </p>
                  </div>
                  <span
                    className={`font-bold ${t.amount > 0 ? 'text-emerald-400' : 'text-white'}`}
                  >
                    {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Parent Helpline: 1800-419-CART</span>
            <span className="text-emerald-400 font-mono">Instant Audit Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
