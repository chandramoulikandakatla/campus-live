import React from 'react';
import { Download } from 'lucide-react';
import { useStore } from '../../lib/store';

export function CollegeReports() {
  const { ecosystem, showToast } = useStore();

  const reports = [
    {
      id: 'INV-SCNA-2026-11',
      title: 'November 2026 Consolidated Pilot Statement',
      orders: ecosystem.orders.length,
      volume: ecosystem.orders.reduce((a, b) => a + b.totalAmount, 0),
      status: 'Live Reconciled'
    },
    {
      id: 'RPT-USAGE-2026-11',
      title: 'Aggregated Category & Kiosk Utilization Report',
      orders: ecosystem.orders.length,
      volume: ecosystem.transactions
        .filter((t) => t.type === 'Wallet Funding')
        .reduce((a, b) => a + b.amount, 0),
      status: 'Verified'
    },
    {
      id: 'RPT-SLA-2026-11',
      title: 'Operational SLA & Break-Window Performance Audit',
      orders: ecosystem.products.length,
      volume: ecosystem.products.reduce((a, b) => a + b.stock, 0),
      status: '99.1% SLA Met'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            Consolidated Institutional Reports & Invoices
          </h2>
          <p className="text-xs text-slate-400">
            Aggregated monthly summaries reconciled directly with the shared transaction ledger
          </p>
        </div>
        <button
          onClick={() =>
            showToast(
              'Consolidated Report Exported',
              'Downloaded SCNA_Consolidated_Pilot_Report_Nov2026.pdf',
              'success'
            )
          }
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" /> Export Consolidated Monthly Invoice
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        {reports.map((rep) => (
          <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2">
            <span className="font-mono text-violet-400 font-bold">{rep.id}</span>
            <h3 className="text-sm font-bold text-white">{rep.title}</h3>
            <p className="text-slate-400">
              Reconciled Records: {rep.orders} · Metric Total: ₹{rep.volume}
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {rep.status}
              </span>
              <button
                onClick={() => showToast('Report Downloaded', `${rep.id}.pdf saved.`, 'success')}
                className="text-violet-300 hover:underline font-semibold"
              >
                Download PDF →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
