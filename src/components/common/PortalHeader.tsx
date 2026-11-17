import React from 'react';
import { ShoppingBag, ShieldCheck, Terminal, Building2, HelpCircle } from 'lucide-react';
import { PortalType, Student } from '../../types/ecosystem';

interface PortalHeaderProps {
  activePortal: PortalType;
  setActivePortal: (portal: PortalType) => void;
  currentStudent: Student;
  students: Student[];
  onSelectStudent?: (id: string) => void;
  ordersCount: number;
  activeOpsOrdersCount: number;
  onOpenDemoModal: () => void;
}

export function PortalHeader({
  activePortal,
  setActivePortal,
  currentStudent,
  ordersCount,
  activeOpsOrdersCount,
  onOpenDemoModal
}: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand & Live Sync Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 font-black text-white text-sm tracking-tighter">
            CK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-sm sm:text-base">
                CAMPUSKART
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Shared Ledger Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Active Student Wallet ({currentStudent?.firstName || 'Student'}):{' '}
              <strong className="text-white">
                ₹{(currentStudent?.walletBalance ?? 0).toLocaleString('en-IN')}
              </strong>{' '}
              · Orders: <strong className="text-white">{ordersCount}</strong>
            </p>
          </div>
        </div>

        {/* 4-Portal Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => setActivePortal('student')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'student'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>1. Student App</span>
          </button>

          <button
            onClick={() => setActivePortal('parent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'parent'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Parent Portal</span>
          </button>

          <button
            onClick={() => setActivePortal('ops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'ops'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>3. Operations</span>
            {activeOpsOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/30 text-[10px]">
                {activeOpsOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePortal('college')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activePortal === 'college'
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>4. College Admin</span>
          </button>
        </div>

        {/* Evaluator Quick-Help & Demo Credentials */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDemoModal}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-medium text-indigo-200 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Evaluator Guide & Keys</span>
            <span className="sm:hidden">Keys</span>
          </button>
        </div>
      </div>
    </header>
  );
}
