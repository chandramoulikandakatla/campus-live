import React from 'react';
import { Download, X } from 'lucide-react';
import { Order } from '../../types/ecosystem';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onDownload: () => void;
}

export function ReceiptModal({ order, onClose, onDownload }: ReceiptModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Official CampusKart Receipt
            </span>
            <h3 className="text-lg font-bold text-white mt-1">{order.id}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close receipt modal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl">
            <div>
              <span className="text-slate-400 block">Student</span>
              <span className="font-semibold text-white">
                {order.studentName} ({order.studentId})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Date & Time</span>
              <span className="font-semibold text-white">{order.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Transaction Ref</span>
              <span className="font-mono text-indigo-300">{order.txnRef}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status</span>
              <span className="font-semibold text-emerald-400">{order.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
              Purchased Items
            </p>
            {order.items.map((it, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1.5 border-b border-white/5"
              >
                <div>
                  <p className="text-white font-medium">{it.name}</p>
                  <p className="text-slate-400 text-[11px]">
                    {it.qty} × ₹{it.price}
                  </p>
                </div>
                <span className="font-semibold text-white">₹{it.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Previous Wallet Balance</span>
              <span>₹{order.previousBalance}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-sm">
              <span>Total Amount Debited</span>
              <span className="text-emerald-400">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Remaining Wallet Balance</span>
              <span>₹{order.remainingBalance}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-xl">
            <p>
              <strong className="text-slate-200">Fulfilment:</strong> {order.fulfilmentMethod}
            </p>
            <p>
              <strong className="text-slate-200">Collection Point:</strong> {order.collectionPoint}
            </p>
            {order.pickupCode && (
              <p className="mt-1 text-indigo-300 font-mono">
                <strong>Pickup Verification OTP:</strong> {order.pickupCode}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onDownload}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" /> Download Receipt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
