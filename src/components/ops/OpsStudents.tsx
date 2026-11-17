import React, { useState } from 'react';
import { useStore } from '../../lib/store';

export function OpsStudents() {
  const { ecosystem, enrollStudent, toggleStudentStatus } = useStore();

  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    academicYear: 'Intermediate First Year (MPC)',
    parentName: '',
    initialWallet: 500
  });

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim()) return;

    enrollStudent({
      name: newStudentForm.name,
      academicYear: newStudentForm.academicYear,
      parentName: newStudentForm.parentName || 'Parent / Guardian',
      initialWallet: Number(newStudentForm.initialWallet) || 0
    });

    setNewStudentForm({
      name: '',
      academicYear: 'Intermediate First Year (MPC)',
      parentName: '',
      initialWallet: 500
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Enroll Form */}
      <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-5 h-fit space-y-4">
        <h3 className="text-base font-bold text-white">Enroll New Pilot Student</h3>
        <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Student Full Name</label>
            <input
              type="text"
              value={newStudentForm.name}
              onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
              placeholder="e.g. Ananya Rao"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Academic Year</label>
            <select
              value={newStudentForm.academicYear}
              onChange={(e) =>
                setNewStudentForm({ ...newStudentForm, academicYear: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Intermediate First Year (MPC)">Intermediate First Year (MPC)</option>
              <option value="Intermediate First Year (BiPC)">Intermediate First Year (BiPC)</option>
              <option value="Intermediate Second Year (MPC)">Intermediate Second Year (MPC)</option>
              <option value="Intermediate Second Year (BiPC)">Intermediate Second Year (BiPC)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Linked Parent / Guardian Name</label>
            <input
              type="text"
              value={newStudentForm.parentName}
              onChange={(e) => setNewStudentForm({ ...newStudentForm, parentName: e.target.value })}
              placeholder="e.g. Suresh Rao"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Initial Onboarding Wallet Credit (₹)</label>
            <input
              type="number"
              value={newStudentForm.initialWallet}
              onChange={(e) =>
                setNewStudentForm({
                  ...newStudentForm,
                  initialWallet: Math.max(0, Number(e.target.value) || 0)
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            + Register Student Account
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="lg:col-span-2 bg-slate-900/90 border border-white/15 rounded-3xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white">
          Registered Student Directory (Access-Controlled)
        </h3>
        <div className="space-y-3">
          {ecosystem.students.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">{s.id}</span>
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">
                  {s.institution} · {s.academicYear}
                </p>
                <p className="text-slate-400">
                  Linked Parent:{' '}
                  <strong className="text-slate-200">
                    {s.parentName} ({s.parentId})
                  </strong>{' '}
                  · PIN: Masked (****)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-slate-400 block">Wallet Balance</span>
                  <span className="text-base font-extrabold text-white">₹{s.walletBalance}</span>
                </div>
                <button
                  onClick={() => toggleStudentStatus(s.id)}
                  className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                    s.status === 'Active'
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
