import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Wallet,
  Clock,
  Shield,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useStore } from '../../lib/store';

export function StudentAuth() {
  const {
    ecosystem,
    studentScreen,
    setStudentScreen,
    credIdInput,
    setCredIdInput,
    credPassInput,
    setCredPassInput,
    credError,
    setCredError,
    pinInput,
    setPinInput,
    pinError,
    setPinError,
    pendingStudent,
    validateStudentCredentials,
    verifyStudentPin,
    setShowDemoModal
  } = useStore();

  const [pinMasked, setPinMasked] = useState(true);

  // Screen 1: Welcome
  if (studentScreen === 'welcome') {
    return (
      <div className="max-w-xl mx-auto my-8 bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-pink-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-500 mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-5">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 mb-3">
          <MapPin className="w-3.5 h-3.5" /> {ecosystem.college.name}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to CampusKart
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Your campus commerce and student wallet platform. Browse approved campus snacks, beverages, academic supplies, and daily essentials with zero cash friction.
        </p>

        <div className="grid grid-cols-3 gap-3 my-6 text-left">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Wallet className="w-5 h-5 text-indigo-400 mb-1.5" />
            <p className="text-xs font-semibold text-white">Pre-Funded Wallet</p>
            <p className="text-[11px] text-slate-400">Instant parent top-ups, no bank PINs required.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Clock className="w-5 h-5 text-purple-400 mb-1.5" />
            <p className="text-xs font-semibold text-white">Break Pickup</p>
            <p className="text-[11px] text-slate-400">Skip long queues during lunch & dispersal.</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 text-pink-400 mb-1.5" />
            <p className="text-xs font-semibold text-white">Campus Verified</p>
            <p className="text-[11px] text-slate-400">100% college-approved inventory & pricing.</p>
          </div>
        </div>

        <button
          onClick={() => setStudentScreen('credentials')}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <span>Continue to Login</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Institution ID: <strong className="text-slate-200 font-mono">{ecosystem.college.code}</strong></span>
          <button
            onClick={() => setShowDemoModal(true)}
            className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Need Support / Demo IDs?
          </button>
        </div>
      </div>
    );
  }

  // Screen 2: Credentials
  if (studentScreen === 'credentials') {
    return (
      <div className="max-w-md mx-auto my-8 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={() => setStudentScreen('welcome')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Welcome
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400">Step 1 of 2</span>
            <h2 className="text-xl font-bold text-white">Student Credentials</h2>
            <p className="text-xs text-slate-400">{ecosystem.college.name}</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            validateStudentCredentials();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              1. CampusKart Student ID
            </label>
            <input
              type="text"
              value={credIdInput}
              onChange={(e) => setCredIdInput(e.target.value)}
              placeholder="e.g. CK-2026-101"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              2. Assigned Access Password
            </label>
            <input
              type="password"
              value={credPassInput}
              onChange={(e) => setCredPassInput(e.target.value)}
              placeholder="Enter access credential"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/90 border border-white/15 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {credError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{credError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Validate Credentials</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Account Selector */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[11px] text-slate-400 mb-2 font-medium">Evaluator Quick-Fill Demo Accounts:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setCredIdInput('CK-2026-101');
                setCredPassInput('PASS101');
                setCredError('');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[11px]"
            >
              <p className="font-bold text-white">Aarav (Active)</p>
              <p className="text-indigo-300 font-mono">CK-2026-101</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setCredIdInput('CK-2026-102');
                setCredPassInput('PASS102');
                setCredError('');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[11px]"
            >
              <p className="font-bold text-white">Diya (Active)</p>
              <p className="text-emerald-300 font-mono">CK-2026-102</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setCredIdInput('CK-2026-103');
                setCredPassInput('PASS103');
                setCredError('');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left text-[11px]"
            >
              <p className="font-bold text-rose-300">Rohan (Inactive)</p>
              <p className="text-slate-400 font-mono">CK-2026-103</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen 3: PIN
  const stu = pendingStudent || ecosystem.students[0];

  return (
    <div className="max-w-md mx-auto my-8 bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
      <button
        onClick={() => setStudentScreen('credentials')}
        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Change Student ID
      </button>

      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
          {stu.firstName[0]}
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Identity Confirmed
          </span>
          <h3 className="text-base font-bold text-white">{stu.name}</h3>
          <p className="text-xs text-slate-300">{stu.id} · {stu.academicYear}</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-1">Enter CampusKart Session PIN</h2>
      <p className="text-xs text-slate-400 mb-4">
        This 4-digit PIN authenticates your kiosk/web session. It is not a bank or UPI credential.
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-300 font-medium">4-Digit Numeric PIN</span>
          <button
            type="button"
            onClick={() => setPinMasked(!pinMasked)}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            {pinMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{pinMasked ? 'Show Digits' : 'Mask Digits'}</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const char = pinInput[idx] || '';
            return (
              <div
                key={idx}
                className={`h-14 rounded-2xl border flex items-center justify-center text-xl font-mono font-bold ${
                  char
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-white/15 text-slate-600'
                }`}
              >
                {char ? (pinMasked ? '●' : char) : '–'}
              </div>
            );
          })}
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => {
              if (pinInput.length < 4) {
                setPinInput(pinInput + digit);
                setPinError('');
              }
            }}
            className="py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-base transition-all active:scale-95"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setPinInput('');
            setPinError('');
          }}
          className="py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => {
            if (pinInput.length < 4) {
              setPinInput(pinInput + '0');
              setPinError('');
            }
          }}
          className="py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold text-base"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => setPinInput(stu.pin)}
          className="py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-semibold text-xs"
        >
          Auto-Fill ({stu.pin})
        </button>
      </div>

      {pinError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs mb-4 flex items-center justify-between">
          <span>{pinError}</span>
        </div>
      )}

      <button
        type="button"
        disabled={pinInput.length !== 4}
        onClick={() => verifyStudentPin()}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
      >
        <span>Open Student Terminal</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
