import { useState } from 'react';
import { ArrowRight, Camera, CheckCircle2, CircleAlert, KeyRound, LockKeyhole, MonitorSmartphone, ShieldCheck, ShoppingBasket, UserRound, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';

type KioskStage = 'identify' | 'account-found' | 'verified' | 'locked';
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function KioskDemo() {
  const { student, walletBalance } = useStore();
  const [enteredId, setEnteredId] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [stage, setStage] = useState<KioskStage>('identify');
  const [error, setError] = useState('');

  const lookup = () => {
    if (stage === 'locked') return;
    const clean = enteredId.trim().toUpperCase();
    if (!clean) { setError('Enter a CampusKart Student ID.'); return; }
    if (clean !== student.studentId.trim().toUpperCase()) {
      const next = attempts + 1;
      setAttempts(next);
      setError(next >= 3 ? 'Three demo attempts used. Reset the kiosk session to try again.' : `Student ID not found. ${3 - next} attempt(s) remaining.`);
      if (next >= 3) setStage('locked');
      return;
    }
    setError('');
    setStage('account-found');
  };

  const reset = () => { setEnteredId(''); setAttempts(0); setError(''); setStage('identify'); };

  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-5xl px-4 py-8">
    <div className="mb-8"><Badge variant="secondary">Self-service kiosk simulation</Badge><h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">CampusKart kiosk</h1><p className="mt-2 max-w-2xl text-muted-foreground">A presentation walkthrough of CampusKart ID lookup, a simulated identity-check step, wallet visibility and kiosk shopping.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden"><div className="bg-slate-950 p-5 text-white"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5"/><span className="font-semibold tracking-wide">CAMPUSKART KIOSK</span></div><Badge className="border-white/20 bg-white/10 text-white">DEMO DEVICE 01</Badge></div><p className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-slate-400">Student access terminal</p><h2 className="mt-2 text-center font-display text-2xl font-bold">{stage === 'verified' ? `Welcome, ${student.fullName.split(' ')[0]}` : stage === 'account-found' ? 'Account located' : stage === 'locked' ? 'Session locked' : 'Start your session'}</h2><p className="mt-2 text-center text-sm text-slate-400">{stage === 'verified' ? 'Your demo kiosk session is active.' : stage === 'account-found' ? 'Confirm the simulated identity step to continue.' : stage === 'locked' ? 'The attempt limit has been reached.' : 'Enter your CampusKart ID to look up your account.'}</p></div>
        <div className="p-6 sm:p-8">
          {stage === 'identify' && <div className="mx-auto max-w-sm"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><KeyRound className="h-8 w-8"/></div><label className="text-sm font-semibold" htmlFor="kiosk-student-id">CampusKart Student ID</label><Input id="kiosk-student-id" value={enteredId} onChange={(event) => setEnteredId(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') lookup(); }} placeholder="e.g. CK2026001" className="mt-2 h-12 uppercase"/><p className="mt-2 text-xs text-muted-foreground">Demo student ID: {student.studentId}</p>{error && <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-destructive"><CircleAlert className="h-4 w-4 shrink-0"/>{error}</p>}<Button className="mt-5 w-full" onClick={lookup}>Find student account <ArrowRight className="ml-2 h-4 w-4"/></Button><p className="mt-4 text-center text-xs text-muted-foreground">Attempt {attempts + 1} of 3 · ID lookup only</p></div>}
          {stage === 'account-found' && <div className="mx-auto max-w-sm text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="h-8 w-8"/></div><Badge variant="verified">Account found</Badge><h3 className="mt-3 font-display text-xl font-bold">{student.fullName}</h3><p className="mt-1 text-sm text-muted-foreground">{student.studentId} · {student.institution}</p><div className="mt-6 rounded-xl border border-dashed p-5"><Camera className="mx-auto h-8 w-8 text-primary"/><p className="mt-3 font-semibold">Identity verification step</p><p className="mt-1 text-sm text-muted-foreground">In a deployed kiosk, this step would use an approved identity-verification service with liveness and matching controls.</p><Button className="mt-4 w-full" onClick={() => setStage('verified')}>Simulate verification passed</Button></div><p className="mt-3 text-xs text-muted-foreground">This button simulates a successful check. No camera is activated and no biometric data is collected.</p></div>}
          {stage === 'verified' && <div className="mx-auto max-w-sm text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-9 w-9"/></div><Badge variant="verified">Demo access granted</Badge><h3 className="mt-3 font-display text-2xl font-bold">{student.fullName}</h3><p className="mt-1 text-sm text-muted-foreground">{student.studentId} · {student.hostel}</p><div className="mt-6 rounded-xl bg-muted/60 p-5"><p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Wallet className="h-4 w-4"/> Available wallet balance</p><p className="mt-2 font-display text-3xl font-bold">{money(walletBalance)}</p></div><Link to="/products"><Button className="mt-5 w-full">Start kiosk shopping <ShoppingBasket className="ml-2 h-4 w-4"/></Button></Link><Button variant="outline" className="mt-2 w-full" onClick={reset}>End demo session</Button></div>}
          {stage === 'locked' && <div className="mx-auto max-w-sm text-center"><LockKeyhole className="mx-auto h-12 w-12 text-destructive"/><h3 className="mt-3 font-display text-xl font-bold">Attempt limit reached</h3><p className="mt-2 text-sm text-muted-foreground">The demo kiosk blocks access after three incorrect Student ID attempts.</p><Button className="mt-5 w-full" onClick={reset}>Reset kiosk session</Button></div>}
        </div>
      </Card>
      <div className="space-y-4"><Card className="p-5"><h3 className="font-display text-lg font-semibold">Kiosk access principles</h3><div className="mt-4 space-y-4">{[{ title: 'CampusKart ID', detail: 'Identifies the student account.', icon: KeyRound }, { title: 'Identity check', detail: 'A real kiosk must verify identity through an approved authentication service.', icon: ShieldCheck }, { title: 'Wallet authorization', detail: 'The wallet and parent spending rules determine whether checkout can proceed.', icon: Wallet }, { title: 'Temporary session', detail: 'A production kiosk should end the session after use or inactivity.', icon: LockKeyhole }].map((item) => <div key={item.title} className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="h-5 w-5"/></span><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p></div></div>)}</div></Card><Card className="border-amber-300 bg-amber-50/60 p-5 dark:bg-amber-950/20"><p className="font-semibold">Prototype disclosure</p><p className="mt-1 text-sm text-muted-foreground">The ID lookup and successful verification are local simulations. This demo does not perform face recognition, liveness detection, secure kiosk binding or real authentication.</p></Card></div>
    </div>
  </main></div>;
}
