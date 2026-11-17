import React from 'react';
import { useStore } from '../../lib/store';

export function ParentTransactions() {
  const {
    ecosystem,
    linkedStudentId,
    parentTxnFilter,
    setParentTxnFilter,
    parentDateRange,
    setParentDateRange,
    setReceiptModalOrder
  } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentTransactions = ecosystem.transactions.filter(
    (t) => t.studentId === parentLinkedStudent.id
  );

  const filteredTransactions = parentTransactions.filter((t) => {
    if (parentDateRange !== 'All Time' && t.month !== parentDateRange) return false;
    if (parentTxnFilter === 'Money Added') return t.type === 'Wallet Funding';
    if (parentTxnFilter === 'Purchases') return t.type === 'Student Purchase';
    if (parentTxnFilter === 'Refunds') return t.type === 'Refund' || t.type === 'Adjustment';
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">Parent Transaction Ledger</h2>
          <p className="text-xs text-slate-400">
            Every funding credit, purchase debit, refund, and adjustment for{' '}
            {parentLinkedStudent.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Money Added', 'Purchases', 'Refunds'].map((f) => (
            <button
              key={f}
              onClick={() => setParentTxnFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                parentTxnFilter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={parentDateRange}
            onChange={(e) => setParentDateRange(e.target.value)}
            className="bg-slate-950 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All Time">Date: All Time</option>
            <option value="Nov 2026">Date: Nov 2026</option>
            <option value="Oct 2026">Date: Oct 2026</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="py-3 px-3">Transaction ID</th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Description / Linked Order</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-right">Wallet Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-white/5">
                <td className="py-3 px-3 font-mono text-emerald-300">{t.id}</td>
                <td className="py-3 px-3 text-slate-300">{t.timestamp}</td>
                <td className="py-3 px-3 font-semibold text-white">{t.type}</td>
                <td className="py-3 px-3 text-slate-300">
                  {t.note}
                  {t.relatedOrderId && (
                    <button
                      onClick={() => {
                        const ord = ecosystem.orders.find((o) => o.id === t.relatedOrderId);
                        if (ord) setReceiptModalOrder(ord);
                      }}
                      className="ml-2 text-indigo-400 hover:underline font-mono"
                    >
                      [{t.relatedOrderId}]
                    </button>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px]">
                    {t.status}
                  </span>
                </td>
                <td
                  className={`py-3 px-3 text-right font-bold ${
                    t.amount > 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                </td>
                <td className="py-3 px-3 text-right font-mono text-white">₹{t.newBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
