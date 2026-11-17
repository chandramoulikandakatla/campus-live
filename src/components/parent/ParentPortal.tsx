import React from 'react';
import { useStore } from '../../lib/store';
import { ParentAuth } from './ParentAuth';
import { ParentDashboard } from './ParentDashboard';
import { ParentFunding } from './ParentFunding';
import { ParentTransactions } from './ParentTransactions';
import { ParentAnalytics } from './ParentAnalytics';
import { ParentControls } from './ParentControls';
import { ParentOrders } from './ParentOrders';
import { ParentNotifications } from './ParentNotifications';
import { ParentStatements } from './ParentStatements';

export function ParentPortal() {
  const {
    ecosystem,
    linkedStudentId,
    parentScreen,
    setParentScreen,
    parentAuthed,
    setParentAuthed
  } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Parent Top Navigation Bar */}
      <div className="mb-6 bg-slate-900/80 backdrop-blur-xl border border-emerald-500/25 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Parent FinTech Portal
          </span>
          {parentAuthed ? (
            [
              { id: 'dashboard', label: '3. Overview' },
              { id: 'add_money', label: '4. Add Money' },
              { id: 'transactions', label: '9. Transactions' },
              { id: 'analytics', label: '10. Spending Analytics' },
              { id: 'controls', label: '11. Spending Controls' },
              { id: 'orders', label: '12. Student Orders' },
              {
                id: 'notifications',
                label: `13. Alerts (${
                  ecosystem.notifications.filter((n) => n.studentId === parentLinkedStudent.id).length
                })`
              },
              { id: 'statements', label: '14. Statements & Receipts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setParentScreen(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  parentScreen === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              Parent Authentication Flow (Screens 1–2)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={parentScreen}
            onChange={(e) => {
              const val = e.target.value as any;
              if (!['welcome', 'login'].includes(val)) setParentAuthed(true);
              setParentScreen(val);
            }}
            className="bg-slate-950 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="welcome">Screen 1 — Parent Portal Welcome</option>
            <option value="login">Screen 2 — Parent Login</option>
            <option value="dashboard">Screen 3 — Parent Dashboard Overview</option>
            <option value="add_money">Screen 4 — Add Money</option>
            <option value="funding_method">Screen 5 — Select Funding Method</option>
            <option value="funding_confirm">Screen 6 — Funding Confirmation</option>
            <option value="funding_processing">Screen 7 — Parent Payment Processing (5s)</option>
            <option value="funding_success">Screen 8 — Wallet Funding Success</option>
            <option value="transactions">Screen 9 — Transaction History</option>
            <option value="analytics">Screen 10 — Spending Analytics</option>
            <option value="controls">Screen 11 — Spending Controls</option>
            <option value="orders">Screen 12 — Linked Student Orders</option>
            <option value="notifications">Screen 13 — Parent Notifications</option>
            <option value="statements">Screen 14 — Monthly Statements & Receipts</option>
          </select>
        </div>
      </div>

      {/* Screen Routing */}
      {['welcome', 'login'].includes(parentScreen) && <ParentAuth />}
      {parentScreen === 'dashboard' && <ParentDashboard />}
      {[
        'add_money',
        'funding_method',
        'funding_confirm',
        'funding_processing',
        'funding_success'
      ].includes(parentScreen) && <ParentFunding />}
      {parentScreen === 'transactions' && <ParentTransactions />}
      {parentScreen === 'analytics' && <ParentAnalytics />}
      {parentScreen === 'controls' && <ParentControls />}
      {parentScreen === 'orders' && <ParentOrders />}
      {parentScreen === 'notifications' && <ParentNotifications />}
      {parentScreen === 'statements' && <ParentStatements />}
    </main>
  );
}
