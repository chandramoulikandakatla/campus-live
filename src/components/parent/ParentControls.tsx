import React from 'react';
import { useStore } from '../../lib/store';
import { CATEGORIES } from '../../lib/initialData';

export function ParentControls() {
  const { ecosystem, linkedStudentId, updateSpendingControls } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const parentControls =
    ecosystem.spendingControls[parentLinkedStudent.id] ||
    ecosystem.spendingControls['CK-2026-101'] || {
      dailyLimitEnabled: true,
      dailyLimit: 500,
      weeklyLimitEnabled: true,
      weeklyLimit: 2000,
      monthlyLimitEnabled: true,
      monthlyLimit: 5000,
      restrictedCategories: [],
      lowBalanceAlertEnabled: true,
      lowBalanceThreshold: 200,
      instantTxnNotification: true,
      spendingAlertsEnabled: true
    };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Guardian Spending Controls & Alerts</h2>
        <p className="text-xs text-slate-400">
          Rules saved here are enforced immediately during {parentLinkedStudent.name}'s checkout in
          the Student App.
        </p>
      </div>

      <div className="space-y-4">
        {/* Daily Limit */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={parentControls.dailyLimitEnabled}
                onChange={(e) =>
                  updateSpendingControls(parentLinkedStudent.id, {
                    dailyLimitEnabled: e.target.checked
                  })
                }
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-white">Daily Spending Limit</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Blocks student purchases exceeding this daily cap.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max ₹ / Day:</span>
            <input
              type="number"
              value={parentControls.dailyLimit}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  dailyLimit: Math.max(50, Number(e.target.value) || 0)
                })
              }
              className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Weekly Limit */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={parentControls.weeklyLimitEnabled}
                onChange={(e) =>
                  updateSpendingControls(parentLinkedStudent.id, {
                    weeklyLimitEnabled: e.target.checked
                  })
                }
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-white">Weekly Spending Limit</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Caps cumulative 7-day student wallet spend.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max ₹ / Week:</span>
            <input
              type="number"
              value={parentControls.weeklyLimit}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  weeklyLimit: Math.max(100, Number(e.target.value) || 0)
                })
              }
              className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Monthly Limit */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={parentControls.monthlyLimitEnabled}
                onChange={(e) =>
                  updateSpendingControls(parentLinkedStudent.id, {
                    monthlyLimitEnabled: e.target.checked
                  })
                }
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-white">Monthly Allowance Limit</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Enforces monthly budget discipline.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Max ₹ / Month:</span>
            <input
              type="number"
              value={parentControls.monthlyLimit}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  monthlyLimit: Math.max(200, Number(e.target.value) || 0)
                })
              }
              className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Restrictions */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
          <p className="text-sm font-bold text-white">
            Category-Based Restrictions (Click to Block/Allow)
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
              const blocked = parentControls.restrictedCategories?.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    const cur = parentControls.restrictedCategories || [];
                    const next = blocked ? cur.filter((x) => x !== cat) : [...cur, cat];
                    updateSpendingControls(parentLinkedStudent.id, { restrictedCategories: next });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    blocked
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {blocked ? `✕ Blocked: ${cat}` : `✓ Allowed: ${cat}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <label className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={parentControls.lowBalanceAlertEnabled}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  lowBalanceAlertEnabled: e.target.checked
                })
              }
              className="accent-emerald-500"
            />
            <span>Low-Balance Alert (&lt;₹{parentControls.lowBalanceThreshold})</span>
          </label>
          <label className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={parentControls.instantTxnNotification}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  instantTxnNotification: e.target.checked
                })
              }
              className="accent-emerald-500"
            />
            <span>Instant Purchase Alerts</span>
          </label>
          <label className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={parentControls.spendingAlertsEnabled}
              onChange={(e) =>
                updateSpendingControls(parentLinkedStudent.id, {
                  spendingAlertsEnabled: e.target.checked
                })
              }
              className="accent-emerald-500"
            />
            <span>Limit Violation Alerts</span>
          </label>
        </div>
      </div>
    </div>
  );
}
