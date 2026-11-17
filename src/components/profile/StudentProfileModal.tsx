import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Wallet,
  MapPin,
  Building2,
  Phone,
  LogOut,
  CheckCircle2,
  QrCode,
  CreditCard,
  ChevronRight,
  Sparkles,
  GraduationCap,
  PackageCheck,
  Truck,
  ExternalLink,
  LogIn
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore, inr } from '@/lib/store';
import { useAuth, useProfile } from '@/lib/auth';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileModal({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { session, signOut, signIn } = useAuth();
  const { data: profile } = useProfile();
  const student = useStore((s) => s.student);
  const walletBalance = useStore((s) => s.walletBalance);
  const parentLimits = useStore((s) => s.parentLimits);
  const orders = useStore((s) => s.orders);

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

  const handleQuickDemoLogin = async () => {
    try {
      await signIn('CK2026001', '123456');
      toast.success('Signed in as Aarav Mehta (CK2026001)');
      onClose();
      navigate('/home');
    } catch {
      toast.error('Could not complete demo sign in');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-border bg-background">
        {/* Header Profile Banner */}
        <div className="relative p-6 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground font-display font-extrabold text-xl flex items-center justify-center shadow-md">
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] ring-2 ring-background">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold">{fullName}</h3>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                    Active Student
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {studentId}</p>
                <p className="text-xs text-muted-foreground">{institution}</p>
              </div>
            </div>
          </div>

          {/* Quick tab switcher */}
          <div className="mt-5 flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/40 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'card' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'
              }`}
            >
              Student ID Card
            </button>
            <button
              onClick={() => setActiveTab('limits')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'limits' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'
              }`}
            >
              Wallet & Policies
            </button>
            <button
              onClick={() => setActiveTab('portals')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === 'portals' ? 'bg-card text-foreground shadow-sm font-bold' : 'text-muted-foreground'
              }`}
            >
              Switch Portal
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: DIGITAL STUDENT ID CARD */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Virtual Identity Card Container */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-border pb-2.5">
                  <span className="font-display font-bold text-primary tracking-wider uppercase text-[10px]">
                    Sri Chaitanya Campus Digital Pass
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">VALID: 2026–2027</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Hostel Block</span>
                    <p className="font-semibold">{hostel}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Campus Location</span>
                    <p className="font-semibold">{campus} Pilot Hub</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Guardian</span>
                    <p className="font-semibold">{parentName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Emergency Phone</span>
                    <p className="font-semibold">{parentContact}</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-2 border-t border-border/80 flex flex-col items-center justify-center">
                  <div className="h-10 w-full flex items-center justify-center gap-1 bg-white p-2 rounded-lg">
                    {/* Barcode bars */}
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
                      <div
                        key={i}
                        className="h-full bg-slate-900"
                        style={{ width: `${w * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-muted-foreground mt-1">
                    *{studentId}*
                  </span>
                </div>
              </div>

              {/* Wallet Summary */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Student Wallet Balance</p>
                    <p className="text-[11px] text-muted-foreground">{inr(walletBalance)} Available</p>
                  </div>
                </div>

                <Link to="/wallet" onClick={onClose}>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    Open Wallet →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: LIMITS & PARENT POLICIES */}
          {activeTab === 'limits' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-border bg-card space-y-2.5">
                <h4 className="font-bold flex items-center gap-1.5 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" /> Parent Spending Controls
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground">Daily Allowance Limit</span>
                    <p className="font-display text-sm font-bold mt-0.5">{inr(parentLimits.daily)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground">Monthly Cap</span>
                    <p className="font-display text-sm font-bold mt-0.5">{inr(parentLimits.monthly)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground">Approval Threshold</span>
                    <p className="font-display text-sm font-bold mt-0.5">Above {inr(parentLimits.approvalAbove)}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-[10px] text-muted-foreground">Allowed Hours</span>
                    <p className="font-display text-xs font-bold mt-0.5">{parentLimits.allowedFrom} – {parentLimits.allowedUntil}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="font-semibold">Review or Modify Rules</p>
                  <p className="text-[11px] text-muted-foreground">Parents can adjust allowances in Parent Portal.</p>
                </div>
                <Link to="/parent" onClick={onClose}>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                    Parent Portal →
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: SHIFT TO OTHER PORTALS */}
          {activeTab === 'portals' && (
            <div className="space-y-2 text-xs">
              <p className="text-muted-foreground text-[11px] font-semibold mb-1">
                Directly shift between the 5 operational portals:
              </p>

              <Link
                to="/home"
                onClick={onClose}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Student Storefront</p>
                    <p className="text-[11px] text-muted-foreground">Kiosk catalog, cart, and wallet</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/parent"
                onClick={onClose}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Parent Guardian Portal</p>
                    <p className="text-[11px] text-muted-foreground">Allowances, approval queue, and analytics</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/operations"
                onClick={onClose}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <PackageCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Operations Hub</p>
                    <p className="text-[11px] text-muted-foreground">Order packing, inventory edits & adjustments</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/rider"
                onClick={onClose}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">Logistics & Transportation</p>
                    <p className="text-[11px] text-muted-foreground">Live EV Shuttle telemetry and route simulation</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link
                to="/college"
                onClick={onClose}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold">College Admin Dashboard</p>
                    <p className="text-[11px] text-muted-foreground">Anonymized campus efficiency metrics</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          {session ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
              className="text-xs font-semibold"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> End Student Session
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickDemoLogin}
              className="text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" /> Quick Demo Sign-In
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentProfileModal;
