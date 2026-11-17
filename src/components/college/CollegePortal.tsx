import React from 'react';
import { Building2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CollegeOverview } from './CollegeOverview';
import { CollegeReports } from './CollegeReports';

export function CollegePortal() {
  const { ecosystem, collegeScreen, setCollegeScreen } = useStore();

  return (
    <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      <div className="bg-slate-900/85 border border-violet-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-violet-400" />
          <div>
            <h2 className="text-base font-bold text-white">
              {ecosystem.college.name} — Institutional Reporting Portal
            </h2>
            <p className="text-xs text-slate-400">
              Privacy-Preserving View: Displays aggregated campus metrics only. Zero administrative
              burden on college staff.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCollegeScreen('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              collegeScreen === 'overview'
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            1. Aggregated Overview
          </button>
          <button
            onClick={() => setCollegeScreen('reports')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              collegeScreen === 'reports'
                ? 'bg-violet-600 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            2. Consolidated Invoices & Reports
          </button>
        </div>
      </div>

      {collegeScreen === 'overview' && <CollegeOverview />}
      {collegeScreen === 'reports' && <CollegeReports />}
    </main>
  );
}
