import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../../lib/store';

export function ParentAuth() {
  const {
    parentScreen,
    setParentScreen,
    parentLookupStudentId,
    setParentLookupStudentId,
    parentPinInput,
    setParentPinInput,
    parentAuthError,
    setParentAuthError,
    loginParent
  } = useStore();

  if (parentScreen === 'welcome') {
    return (
      <div className="max-w-xl mx-auto my-8 bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/30">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
          CampusKart Guardian Financial Suite
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Transparent Student Wallet Oversight
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Instantly fund your child’s CampusKart wallet, inspect item-level receipts, analyze monthly
          nutrition and stationary expenditure, and set automated daily or category spending rules.
        </p>
        <button
          onClick={() => setParentScreen('login')}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all"
        >
          Access Parent Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-8 bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
      <h2 className="text-xl font-bold text-white">Parent Account Verification</h2>
      <p className="text-xs text-slate-400">
        Enter your child's CampusKart ID and your dedicated Parent Access PIN (never shares the
        student's password).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginParent();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-xs text-slate-300 mb-1">
            Linked Student CampusKart ID
          </label>
          <input
            type="text"
            value={parentLookupStudentId}
            onChange={(e) => setParentLookupStudentId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">Parent Verification PIN</label>
          <input
            type="password"
            value={parentPinInput}
            onChange={(e) => setParentPinInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {parentAuthError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {parentAuthError}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
        >
          Secure Parent Login
        </button>
      </form>

      <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
        <button
          onClick={() => {
            setParentLookupStudentId('CK-2026-101');
            setParentPinInput('9999');
            setParentAuthError('');
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors"
        >
          <p className="font-bold text-white">Rajesh (Aarav's Parent)</p>
          <p className="text-emerald-400 font-mono text-[11px]">ID: CK-2026-101 | PIN: 9999</p>
        </button>
        <button
          onClick={() => {
            setParentLookupStudentId('CK-2026-102');
            setParentPinInput('8888');
            setParentAuthError('');
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-colors"
        >
          <p className="font-bold text-white">Lakshmi (Diya's Parent)</p>
          <p className="text-emerald-400 font-mono text-[11px]">ID: CK-2026-102 | PIN: 8888</p>
        </button>
      </div>
    </div>
  );
}
