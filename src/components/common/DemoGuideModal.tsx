import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
}

export function DemoGuideModal({ isOpen, onClose, onResetDemo }: DemoGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-white">
                Institutional Evaluation — Demo Credentials & Scenarios
              </h3>
              <p className="text-xs text-slate-400">
                All 4 applications share a live, synchronized ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo modal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 my-4 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
              Student Account #1 (Active)
            </span>
            <p className="text-sm font-bold text-white">Aarav Sharma (2nd Year MPC)</p>
            <p className="text-slate-300">
              Student ID: <code className="text-indigo-300 font-mono">CK-2026-101</code>
            </p>
            <p className="text-slate-300">
              Password: <code className="text-indigo-300 font-mono">PASS101</code>
            </p>
            <p className="text-slate-300">
              CampusKart PIN: <code className="text-indigo-300 font-mono">1234</code>
            </p>
            <p className="text-emerald-300 font-medium">
              Parent PIN (Rajesh Sharma): <code className="font-mono">9999</code>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300">
              Student Account #2 (Active)
            </span>
            <p className="text-sm font-bold text-white">Diya Reddy (1st Year BiPC)</p>
            <p className="text-slate-300">
              Student ID: <code className="text-emerald-300 font-mono">CK-2026-102</code>
            </p>
            <p className="text-slate-300">
              Password: <code className="text-emerald-300 font-mono">PASS102</code>
            </p>
            <p className="text-slate-300">
              CampusKart PIN: <code className="text-emerald-300 font-mono">5678</code>
            </p>
            <p className="text-emerald-300 font-medium">
              Parent PIN (Lakshmi Reddy): <code className="font-mono">8888</code>
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/10">
          <p className="font-semibold text-white">Mandatory Shared-State Evaluation Checklist:</p>
          <p>
            1. <strong>Scenario A (Student Purchase):</strong> Log in as Aarav, add items, complete
            the 5-second wallet payment, and watch the balance debit and order propagate to Parent &
            Operations.
          </p>
          <p>
            2. <strong>Scenario B (Parent Top-Up):</strong> Switch to the <strong>Parent Portal</strong>,
            add ₹500 or ₹1,000 via simulated UPI/Card (5-sec flow), and see the Student Wallet
            balance update immediately.
          </p>
          <p>
            3. <strong>Scenario C (Order Fulfilment):</strong> Switch to <strong>Operations Dashboard</strong> →
            Order Management, advance an order status to Ready/Completed, and inspect the live
            progress tracker in the Student App.
          </p>
          <p>
            4. <strong>Scenario D (Spending Limit):</strong> In <strong>Parent Portal → Spending Controls</strong>,
            lower the Daily Limit to ₹100 or restrict a category, then try purchasing in the
            Student App to verify instant enforcement.
          </p>
        </div>

        <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onResetDemo();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Seeded Demo Data
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Continue Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
