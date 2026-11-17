import React from 'react';
import { LogOut } from 'lucide-react';
import { useStore } from '../../lib/store';

export function StudentProfile() {
  const {
    ecosystem,
    loggedStudentId,
    setLoggedStudentId,
    setStudentAuthed,
    setStudentScreen,
    showToast
  } = useStore();

  const currentStudent =
    ecosystem.students.find((s) => s.id === loggedStudentId) || ecosystem.students[0];
  const studentControls =
    ecosystem.spendingControls[currentStudent.id] ||
    ecosystem.spendingControls['CK-2026-101'] || {
      dailyLimitEnabled: false,
      dailyLimit: 0
    };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center font-black text-xl text-white">
            {currentStudent.firstName[0]}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{currentStudent.name}</h2>
            <p className="text-xs text-slate-400 font-mono">
              {currentStudent.id} · {currentStudent.status}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setStudentAuthed(false);
            setStudentScreen('welcome');
            showToast('Logged Out', 'Student session closed safely.', 'info');
          }}
          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10">
          <span className="text-slate-400 block">Participating Institution</span>
          <span className="font-bold text-white mt-0.5 block">{currentStudent.institution}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10">
          <span className="text-slate-400 block">Academic Year & Stream</span>
          <span className="font-bold text-white mt-0.5 block">{currentStudent.academicYear}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10">
          <span className="text-slate-400 block">Linked Parent / Guardian Account</span>
          <span className="font-bold text-emerald-400 mt-0.5 block">
            {currentStudent.parentName} ({currentStudent.parentId}) — Verified
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10">
          <span className="text-slate-400 block">Active Parent Daily Spend Cap</span>
          <span className="font-bold text-white mt-0.5 block">
            {studentControls.dailyLimitEnabled
              ? `₹${studentControls.dailyLimit} / day`
              : 'No Daily Cap'}
          </span>
        </div>
      </div>

      {/* Switch Demo Student Profile Quickly */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
        <p className="text-xs font-bold text-white">Switch Active Student Account:</p>
        <div className="flex flex-wrap gap-2">
          {ecosystem.students.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setLoggedStudentId(s.id);
                showToast('Switched Student', `Now viewing ${s.name} (${s.id})`, 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                s.id === currentStudent.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              {s.name} (₹{s.walletBalance})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
