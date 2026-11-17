import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Wallet,
  Phone,
  LogOut,
  CheckCircle2,
  GraduationCap,
  PackageCheck,
  Truck,
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore, inr } from '@/lib/store';
import { useAuth, useProfile } from '@/lib/auth';
import { toast } from 'sonner';
import logoIcon from '@/assets/campuskart-icon.jpg';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const student = useStore((s) => s.student);
  const walletBalance = useStore((s) => s.walletBalance);
  const parentLimits = useStore((s) => s.parentLimits);

  const [activeTab, setActiveTab] = useState<'card' | 'limits' | 'portals'>('card');

  // Resolved student info
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

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out of demo session');
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-background shadow-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>Student Identity Pass & Wallet</DialogTitle>
        </DialogHeader>

        {/* Clean Header Profile Strip */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/60 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-xl bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-display font-bold text-lg flex items-center justify-center shadow-xs">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">{fullName}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/20">
                    Enrolled
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {studentId}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[260px]">{institution}</p>
              </div>
            </div>
          </div>

          {/* Segmented Tab Controls */}
          <div className="mt-5 flex items-center gap-1 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'card'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Digital Pass
            </button>
            <button
              onClick={() => setActiveTab('limits')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'limits'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Wallet & Policies
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'portals'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Portals
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: DIGITAL PASS */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                <div className="flex justify-between items-center text-xs border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <img src={logoIcon} alt="CampusKart Logo" className="h-5 w-5 rounded-md object-cover" />
                    <span className="font-display font-bold text-foreground uppercase tracking-wider text-[11px]">
                      University Campus Pass
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

                {/* Clean Barcode Component */}
                <div className="pt-3 border-t border-border flex flex-col items-center justify-center">
                  <div className="h-10 w-full flex items-center justify-center gap-1 bg-white p-2 rounded-lg border border-zinc-200">
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
                      <div
                        key={i}
                        className="h-full bg-zinc-900"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-muted-foreground mt-1.5">
                    *{studentId}*
                  </span>
                </div>
              </div>

              {/* Wallet Summary */}
              <div className="p-4 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Available Balance</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{inr(walletBalance)}</p>
                  </div>
                </div>

                <Link to="/wallet" onClick={onClose}>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    View Ledger →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: LIMITS & POLICIES */}
          {activeTab === 'limits' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-sm text-foreground">Parent Spending Safeguards</h4>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Allowed Hours</span>
                    <p className="font-mono text-xs font-bold text-foreground mt-0.5">
                      {parentLimits.allowedFrom} – {parentLimits.allowedUntil}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Parent Oversight Portal</p>
                  <p className="text-[11px] text-muted-foreground">Adjust policies or add funds to this student wallet.</p>
                </div>
                <Link to="/parent" onClick={onClose}>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    Open Parent →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: PORTAL SWITCHER */}
          {activeTab === 'portals' && (
            <div className="space-y-2 text-xs">
              <Link
                to="/home"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Student Storefront</p>
                    <p className="text-[11px] text-muted-foreground">Catalog, cart, and self-checkout</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/parent"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-foreground">Parent Portal</p>
                    <p className="text-[11px] text-muted-foreground">Allowance controls & order approvals</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/operations"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <PackageCheck className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="font-semibold text-foreground">Operations Hub</p>
                    <p className="text-[11px] text-muted-foreground">Kiosk fulfillment & inventory control</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/rider"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-semibold text-foreground">Logistics Fleet</p>
                    <p className="text-[11px] text-muted-foreground">Campus delivery and EV dispatch</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/college"
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <div>
                    <p className="font-semibold text-foreground">College Administration</p>
                    <p className="text-[11px] text-muted-foreground">Anonymized campus analytics & GMV</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign Out
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentProfileModal;
