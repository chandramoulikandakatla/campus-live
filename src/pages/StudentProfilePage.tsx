import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useStore, inr } from '@/lib/store';
import { useProfile } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, Shield, ArrowLeft } from 'lucide-react';
import logoIcon from '@/assets/campuskart-icon.jpg';

export default function StudentProfilePage() {
  const student = useStore((s) => s.student);
  const walletBalance = useStore((s) => s.walletBalance);
  const parentLimits = useStore((s) => s.parentLimits);
  const { data: profile } = useProfile();

  const fullName = profile?.full_name || student.fullName || 'Aarav Mehta';
  const studentId = profile?.student_id || student.studentId || 'CK2026001';
  const campus = profile?.campus || student.city || 'Hyderabad';
  const institution = student.institution || 'Sri Chaitanya & Narayana Junior Academy';
  const hostel = student.hostel || 'B-Block Hostel, Room 204';
  const parentContact = student.parentContact || '+91 98480 22334';
  const parentName = student.parentName || 'Rajesh Mehta';

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8 pb-24 space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Storefront
        </Link>

        {/* Header Profile Identity */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-display font-bold text-xl flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-foreground">{fullName}</h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/20">
                  Enrolled
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Student ID: {studentId}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{institution}</p>
            </div>
          </div>

          {/* Digital Pass Details */}
          <div className="p-5 rounded-xl border border-border bg-muted/30 space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <img src={logoIcon} alt="CampusKart Logo" className="h-5 w-5 rounded-md object-cover" />
                <span className="font-display font-bold text-foreground uppercase tracking-wider text-[11px]">
                  University Smart Pass
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">VALID: 2026–2027</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Hostel Block</span>
                <p className="font-medium text-foreground mt-0.5">{hostel}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Campus</span>
                <p className="font-medium text-foreground mt-0.5">{campus} Pilot Hub</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Guardian</span>
                <p className="font-medium text-foreground mt-0.5">{parentName}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Emergency Contact</span>
                <p className="font-medium text-foreground mt-0.5">{parentContact}</p>
              </div>
            </div>

            {/* Barcode */}
            <div className="pt-2 border-t border-border flex flex-col items-center justify-center">
              <div className="h-10 w-full flex items-center justify-center gap-1 bg-white p-2 rounded-lg border border-zinc-200">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
                  <div
                    key={i}
                    className="h-full bg-zinc-900"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono tracking-widest text-muted-foreground mt-1">
                *{studentId}*
              </span>
            </div>
          </div>

          {/* Linked Wallet Balance */}
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Available Wallet Balance</p>
                <p className="text-xs text-muted-foreground font-mono">{inr(walletBalance)}</p>
              </div>
            </div>

            <Link to="/wallet">
              <Button size="sm" variant="outline" className="text-xs font-semibold">
                Manage Wallet →
              </Button>
            </Link>
          </div>

          {/* Active Spending Policies */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-foreground">Active Parental Spending Rules</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Daily Allowance</span>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">{inr(parentLimits.daily)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Monthly Cap</span>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">{inr(parentLimits.monthly)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Approval Threshold</span>
                <p className="font-mono text-sm font-bold text-foreground mt-0.5">Above {inr(parentLimits.approvalAbove)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/60">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Allowed Ordering Hours</span>
                <p className="font-mono text-xs font-bold text-foreground mt-0.5">
                  {parentLimits.allowedFrom} – {parentLimits.allowedUntil}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
