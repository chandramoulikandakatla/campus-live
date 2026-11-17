import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Landmark
} from 'lucide-react';
import { useStore } from '../../lib/store';

export function ParentFunding() {
  const {
    ecosystem,
    linkedStudentId,
    parentScreen,
    setParentScreen,
    fundAmount,
    setFundAmount,
    customFundInput,
    setCustomFundInput,
    fundingMethod,
    setFundingMethod,
    parentPayStep,
    executeParentFunding,
    lastFundingReceipt,
    setLoggedStudentId,
    setStudentAuthed,
    setStudentScreen,
    setActivePortal
  } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];

  // Screen 4: Add Money
  if (parentScreen === 'add_money') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">
            Phase 2 — Wallet Top-Up
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">Add Funds to Student Wallet</h2>
          <p className="text-xs text-slate-400">
            Linked Student: {parentLinkedStudent.name} ({parentLinkedStudent.id})
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[250, 500, 1000, 2000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setFundAmount(preset);
                setCustomFundInput(String(preset));
              }}
              className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                Number(fundAmount) === preset
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-slate-950 border-white/10 text-slate-300 hover:bg-white/5'
              }`}
            >
              +₹{preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setFundAmount(750);
              setCustomFundInput('750');
            }}
            className="py-3 rounded-xl text-xs font-bold border bg-slate-950 border-white/10 text-emerald-300"
          >
            Custom
          </button>
        </div>

        <div>
          <label className="block text-xs text-slate-300 mb-1.5">Enter Funding Amount (₹)</label>
          <input
            type="number"
            min="50"
            max="25000"
            value={customFundInput}
            onChange={(e) => {
              setCustomFundInput(e.target.value);
              setFundAmount(Math.max(0, Number(e.target.value) || 0));
            }}
            className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-white/15 text-white text-lg font-extrabold focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Existing Student Wallet Balance</span>
            <span className="font-bold text-white">₹{parentLinkedStudent.walletBalance}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Amount Being Added</span>
            <span className="font-bold text-emerald-400">+₹{fundAmount}</span>
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
            <span>New Projected Wallet Balance</span>
            <span className="text-emerald-300">
              ₹{parentLinkedStudent.walletBalance + Number(fundAmount)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setParentScreen('funding_method')}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
        >
          Continue to Payment →
        </button>
      </div>
    );
  }

  // Screen 5: Select Funding Method
  if (parentScreen === 'funding_method') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Select Parent Funding Method</h2>
          <button
            onClick={() => setParentScreen('add_money')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Simulated prototype payment options — no real bank credentials or card numbers are collected.
        </p>

        <div className="space-y-3">
          {[
            { id: 'UPI', desc: 'Instant UPI AutoPay / QR Verification (Zero Fee)', icon: Smartphone },
            { id: 'Debit Card', desc: 'RuPay / Visa / Mastercard Domestic Debit Card', icon: CreditCard },
            { id: 'Credit Card', desc: 'Instant Campus Wallet Reload via Credit Card', icon: CreditCard },
            { id: 'Net Banking', desc: 'Direct Institutional NEFT / IMPS Portal', icon: Landmark }
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => setFundingMethod(m.id)}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  fundingMethod === m.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                    : 'bg-slate-950/60 border-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-bold">{m.id}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border ${
                    fundingMethod === m.id
                      ? 'bg-emerald-400 border-emerald-400'
                      : 'border-slate-500'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setParentScreen('funding_confirm')}
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all"
        >
          Review Funding Confirmation →
        </button>
      </div>
    );
  }

  // Screen 6: Funding Confirmation
  if (parentScreen === 'funding_confirm') {
    return (
      <div className="max-w-xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Funding Confirmation</h2>
          <button
            onClick={() => setParentScreen('funding_method')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Change Method
          </button>
        </div>

        <div className="bg-slate-950 border border-white/15 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-4 text-slate-400">Parent Account</td>
                <td className="py-3 px-4 text-right font-bold text-white">
                  {parentLinkedStudent.parentName} ({parentLinkedStudent.parentId})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Linked Student</td>
                <td className="py-3 px-4 text-right font-bold text-white">
                  {parentLinkedStudent.name} ({parentLinkedStudent.id})
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Selected Payment Method</td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-300">
                  {fundingMethod} (Simulated)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Existing wallet balance</td>
                <td className="py-3 px-4 text-right font-bold text-white">
                  ₹{parentLinkedStudent.walletBalance}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-slate-400">Amount to add</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                  +₹{fundAmount}
                </td>
              </tr>
              <tr className="bg-emerald-950/30">
                <td className="py-3.5 px-4 font-bold text-white">New projected balance</td>
                <td className="py-3.5 px-4 text-right font-extrabold text-base text-emerald-300">
                  ₹{parentLinkedStudent.walletBalance + Number(fundAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={() => executeParentFunding()}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all"
        >
          Confirm Simulated Payment (₹{fundAmount})
        </button>
      </div>
    );
  }

  // Screen 7: Funding Processing (5s Animation)
  if (parentScreen === 'funding_processing') {
    return (
      <div className="max-w-lg mx-auto my-10 bg-slate-900/95 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-6">
        <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
          Simulated Parent Funding Sequence — No Real Money Collected
        </span>
        <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin mx-auto flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-emerald-300" />
        </div>
        <h2 className="text-xl font-extrabold text-white">
          {parentPayStep === 1 && '0–1s: Initiating Simulated Funding...'}
          {parentPayStep === 2 && `1–3s: Verifying ${fundingMethod} & Authorizing...`}
          {parentPayStep === 3 && '3–5s: Crediting Student Wallet & Generating Ledger Entry...'}
        </h2>
        <div className="text-left bg-slate-950 p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
          <p className={parentPayStep >= 1 ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
            ✓ 0–1s: Initiating ₹{fundAmount} top-up request
          </p>
          <p className={parentPayStep >= 2 ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
            ✓ 1–3s: Simulated {fundingMethod} authorization verified
          </p>
          <p className={parentPayStep >= 3 ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
            ✓ 3–5s: Updating {parentLinkedStudent.name}'s wallet in shared ecosystem state
          </p>
        </div>
      </div>
    );
  }

  // Screen 8: Funding Success
  const rec = lastFundingReceipt || {
    txnId: 'TXN-CK-90012',
    studentName: parentLinkedStudent.name,
    studentId: parentLinkedStudent.id,
    amount: fundAmount,
    method: fundingMethod,
    timestamp: '2026-11-16 14:00',
    previousBalance: parentLinkedStudent.walletBalance - Number(fundAmount),
    newBalance: parentLinkedStudent.walletBalance
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-extrabold text-white">Wallet Funded Successfully!</h2>
      <p className="text-xs text-slate-300">
        The Student Application wallet balance has been updated immediately via shared state.
      </p>

      <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 text-left space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-400">Funding Transaction ID</span>
          <span className="font-mono font-bold text-emerald-300">{rec.txnId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Student Name</span>
          <span className="font-bold text-white">
            {rec.studentName} ({rec.studentId})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Payment Method</span>
          <span className="text-white">{rec.method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date & Time</span>
          <span className="text-white">{rec.timestamp}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Previous Wallet Balance</span>
          <span className="text-white">₹{rec.previousBalance}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Amount Added</span>
          <span className="font-bold text-emerald-400">+₹{rec.amount}</span>
        </div>
        <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
          <span>New Student Wallet Balance</span>
          <span className="text-emerald-300">₹{rec.newBalance}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setParentScreen('dashboard')}
          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
        >
          Return to Parent Dashboard
        </button>
        <button
          onClick={() => {
            setLoggedStudentId(parentLinkedStudent.id);
            setStudentAuthed(true);
            setStudentScreen('wallet');
            setActivePortal('student');
          }}
          className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
        >
          View in Student App →
        </button>
      </div>
    </div>
  );
}
