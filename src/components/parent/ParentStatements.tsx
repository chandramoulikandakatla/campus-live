import React from 'react';
import { Download, Printer } from 'lucide-react';
import { useStore } from '../../lib/store';

export function ParentStatements() {
  const { ecosystem, linkedStudentId, showToast } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentOrders = ecosystem.orders.filter((o) => o.studentId === parentLinkedStudent.id);
  const parentTransactions = ecosystem.transactions.filter(
    (t) => t.studentId === parentLinkedStudent.id
  );

  let totalAdded = 0;
  let totalSpent = 0;
  let totalRefunds = 0;

  parentTransactions.forEach((t) => {
    if (t.type === 'Wallet Funding') totalAdded += t.amount;
    else if (t.type === 'Student Purchase') totalSpent += Math.abs(t.amount);
    else if (t.type === 'Refund' || (t.type === 'Adjustment' && t.amount > 0)) totalRefunds += t.amount;
    else if (t.type === 'Adjustment' && t.amount < 0) totalSpent += Math.abs(t.amount);
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

  const parentCategoryBreakdown = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  return (
    <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Monthly Wallet Statements & Reconciled Summary
          </h2>
          <p className="text-xs text-slate-400">
            Account: {parentLinkedStudent.name} ({parentLinkedStudent.id}) — November 2026
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              showToast(
                'Statement Downloaded',
                `CampusKart_Statement_${parentLinkedStudent.id}_Nov2026.pdf downloaded.`,
                'success'
              )
            }
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF Statement
          </button>
          <button
            onClick={() =>
              showToast('Print Job Prepared', 'Formatted monthly statement ready for printing.', 'info')
            }
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Statement
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-400">Total Credits (Funding)</span>
          <p className="text-lg font-extrabold text-emerald-400 mt-1">+₹{totalAdded}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-400">Total Debits (Purchases)</span>
          <p className="text-lg font-extrabold text-amber-400 mt-1">-₹{totalSpent}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-400">Refunds & Adjustments</span>
          <p className="text-lg font-extrabold text-cyan-400 mt-1">+₹{totalRefunds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10">
          <span className="text-slate-400">Closing Reconciled Balance</span>
          <p className="text-lg font-extrabold text-white mt-1">
            ₹{parentLinkedStudent.walletBalance}
          </p>
        </div>
      </div>

      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
          Category-Wise Statement Breakdown
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          {parentCategoryBreakdown.map((c) => (
            <div key={c.name} className="p-3 rounded-xl bg-white/5 flex justify-between">
              <span className="text-slate-300">{c.name}</span>
              <span className="font-bold text-white">₹{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
