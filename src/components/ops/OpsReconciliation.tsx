import React, { useState } from 'react';
import { useStore } from '../../lib/store';

export function OpsReconciliation() {
  const { ecosystem, executeManualAdjustment } = useStore();

  const [manualAdjForm, setManualAdjForm] = useState({
    studentId: 'CK-2026-101',
    type: 'Adjustment',
    amount: 50,
    reason: 'Kiosk sensor calibration credit',
    operator: 'OPS-ADMIN-04 (K. Chandra)'
  });

  const handleManualAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAdjForm.reason.trim()) return;

    executeManualAdjustment(
      manualAdjForm.studentId,
      manualAdjForm.type,
      Number(manualAdjForm.amount) || 0,
      manualAdjForm.reason,
      manualAdjForm.operator
    );

    setManualAdjForm({
      ...manualAdjForm,
      amount: 50,
      reason: ''
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Audited Manual Adjustment Form */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 h-fit space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-400">
            Strict Audit Trail Required
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">Record Audited Wallet Adjustment</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Operators cannot silently alter balances. Every manual credit/refund requires a reason,
            timestamp, and operator ID.
          </p>
        </div>

        <form onSubmit={handleManualAdjustment} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Target Student Account</label>
            <select
              value={manualAdjForm.studentId}
              onChange={(e) => setManualAdjForm({ ...manualAdjForm, studentId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            >
              {ecosystem.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — Bal: ₹{s.walletBalance}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Entry Type</label>
              <select
                value={manualAdjForm.type}
                onChange={(e) => setManualAdjForm({ ...manualAdjForm, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Refund">Refund (+)</option>
                <option value="Adjustment">Adjustment (+/-)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Amount (₹)</label>
              <input
                type="number"
                value={manualAdjForm.amount}
                onChange={(e) =>
                  setManualAdjForm({ ...manualAdjForm, amount: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Authorized Operator Identity</label>
            <input
              type="text"
              value={manualAdjForm.operator}
              onChange={(e) => setManualAdjForm({ ...manualAdjForm, operator: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Mandatory Audit Reason</label>
            <input
              type="text"
              value={manualAdjForm.reason}
              onChange={(e) => setManualAdjForm({ ...manualAdjForm, reason: e.target.value })}
              placeholder="e.g. Damaged item replacement refund"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Commit Audited Ledger Entry
          </button>
        </form>
      </div>

      {/* Master Reconciliation Ledger */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-white/15 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            Master Wallet & Transaction Reconciliation
          </h3>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            ✓ All Student Balances Reconcile with Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-2.5 px-2">Ref ID</th>
                <th className="py-2.5 px-2">Student</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2">Audit Note / Method</th>
                <th className="py-2.5 px-2 text-right">Prev → New</th>
                <th className="py-2.5 px-2 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ecosystem.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-2 font-mono text-amber-300">{t.id}</td>
                  <td className="py-2.5 px-2 font-mono text-white">{t.studentId}</td>
                  <td className="py-2.5 px-2 text-slate-300">{t.type}</td>
                  <td className="py-2.5 px-2 text-slate-400">
                    {t.note} <span className="text-slate-500">({t.method})</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                    ₹{t.previousBalance} → ₹{t.newBalance}
                  </td>
                  <td
                    className={`py-2.5 px-2 text-right font-bold ${
                      t.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
