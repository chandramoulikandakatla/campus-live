import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { signIn, signUp, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from || '/home';
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (session) return <Navigate to={destination} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const cleanId = studentId.trim();
    if (!cleanId) return setError('Enter your Student ID.');
    if (!/^\d{6}$/.test(pin)) return setError('Your PIN must be 6 digits.');
    if (mode === 'sign-up' && !fullName.trim()) return setError('Enter your full name.');
    setBusy(true);
    try {
      if (mode === 'sign-up') await signUp(cleanId, pin, fullName);
      else await signIn(cleanId, pin);
      navigate(destination, { replace: true });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'We couldn’t complete sign-in. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link to="/" className="inline-flex min-h-12 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back to CampusKart</Link>
        <div className="mx-auto grid max-w-4xl gap-12 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-24">
          <section className="flex flex-col justify-center"><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><ShieldCheck className="h-6 w-6" /></span><h1 className="font-display text-4xl font-semibold">Your campus,<br />within reach.</h1><p className="mt-4 max-w-sm leading-relaxed text-muted-foreground">Sign in with your Student ID and six-digit PIN to continue to your campus shop.</p></section>
          <section className="border-t border-border pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div className="mb-7 flex border-b border-border"><button type="button" onClick={() => { setMode('sign-in'); setError(''); }} className={`min-h-12 border-b-2 px-4 text-sm font-medium ${mode === 'sign-in' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Sign in</button><button type="button" onClick={() => { setMode('sign-up'); setError(''); }} className={`min-h-12 border-b-2 px-4 text-sm font-medium ${mode === 'sign-up' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Create account</button></div>
            <form onSubmit={submit} className="space-y-5">
              {mode === 'sign-up' && <label className="block space-y-2 text-sm font-medium">Full name<Input autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" required /></label>}
              <label className="block space-y-2 text-sm font-medium">Student ID<Input autoComplete="username" value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="Enter your Student ID" required /></label>
              <label className="block space-y-2 text-sm font-medium">6-digit PIN<Input inputMode="numeric" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} type="password" maxLength={6} pattern="[0-9]{6}" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" required /></label>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" size="lg" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-up' ? 'Create account' : 'Sign in'} <ArrowRight /></Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">Your account is for student access. Sign-up is ready immediately after creation.</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}