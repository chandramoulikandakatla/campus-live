import React from 'react';
import { useStore } from '../../lib/store';

export function StudentWallet() {
  const {
    ecosystem,
    loggedStudentId,
    setActivePortal,
    setParentScreen,
    setParentAuthed,
    setLinkedStudentId,
    setFundAmount,
    setCustomFundInput,
    showToast
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentTransactions = ecosystem.transactions.filter(
    (t) => t.studentId === currentStudent.id
  );

  let totalAdded = 0;
  let totalSpent = 0;
  let totalRefunds = 0;
  let purchaseCount = 0;

  studentTransactions.forEach((t) => {
    if (t.type === 'Wallet Funding') totalAdded += t.amount;
    else if (t.type === 'Student Purchase') {
      totalSpent += Math.abs(t.amount);
      purchaseCount += 1;
    } else if (t.type === 'Refund' || (t.type === 'Adjustment' && t.amount > 0)) {
      totalRefunds += t.amount;
    } else if (t.type === 'Adjustment' && t.amount < 0) {
      totalSpent += Math.abs(t.amount);
    }
  });

  const handleRequestParentTopUp = () => {
    setLinkedStudentId(currentStudent.id);
    setParentAuthed(true);
    setFundAmount(1000);
    setCustomFundInput('1000');
    setParentScreen('add_money');
    setActivePortal('parent');
    showToast('Switched to Parent Portal', `Opened Add Money screen for ${currentStudent.firstName}`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 rounded-2xl p-5">
          <span className="text-xs text-indigo-200">Current Reconciled Balance</span>
          <p className="text-3xl font-black text-white mt-1">
            ₹{currentStudent.walletBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
            Student cannot independently create funds
          </p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Funds Received (Parent + Refunds)</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
            +₹{(totalAdded + totalRefunds).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Funded by {currentStudent.parentName}</p>
        </div>
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
          <span className="text-xs text-slate-400">Total Campus Expenditure</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">
            -₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {purchaseCount} verified orders
          </p>
        </div>
      </div>

      <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Complete Student Wallet Ledger</h3>
          <button
            onClick={handleRequestParentTopUp}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Request Parent Top-Up
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/10">
                <th className="py-2.5 px-3">Ref ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Details / Linked Order</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {studentTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <td className="py-3 px-3 font-mono text-indigo-300">{t.id}</td>
                  <td className="py-3 px-3 text-slate-300">{t.timestamp}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.amount > 0
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {t.note}{' '}
                    {t.relatedOrderId && (
                      <span className="font-mono text-indigo-400">({t.relatedOrderId})</span>
                    )}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      t.amount > 0 ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">₹{t.newBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
