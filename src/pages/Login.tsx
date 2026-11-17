import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';

export default function Login() {
  const { signIn, signUp, session } = useAuth();
  const updateStudent = useStore((state) => state.updateStudent);
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

  const handleQuickDemoSignIn = async () => {
    setBusy(true);
    try {
      await signIn('CK2026001', '123456');
      updateStudent({ studentId: 'CK2026001', fullName: 'Aarav Mehta' });
      toast.success('Signed in as Aarav Mehta (CK2026001 · Demo Student)');
      navigate(destination, { replace: true });
    } catch {
      toast.error('Failed to log in as demo student.');
    } finally {
      setBusy(false);
    }
  };

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
      updateStudent({ studentId: cleanId.toUpperCase(), ...(mode === 'sign-up' ? { fullName: fullName.trim() } : {}) });
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
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <AppNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Welcome Screen
          </Link>

          {/* Quick Demo Evaluation Profile Banner */}
          <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                Demo Presentation Mode
              </span>
              <p className="text-xs text-muted-foreground font-mono">
                Aarav Mehta · ₹2,500 Demo Wallet
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleQuickDemoSignIn}
              disabled={busy}
              className="text-xs font-semibold rounded-xl h-9"
            >
              Sign In Demo
            </Button>
          </div>

          {/* Sign In / Sign Up Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm space-y-6">
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Student Kiosk Sign In
              </h1>
              <p className="text-xs text-muted-foreground">
                Enter your 6-digit campus PIN or student credentials.
              </p>
            </div>

            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => { setMode('sign-in'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-colors ${
                  mode === 'sign-in' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('sign-up'); setError(''); }}
                className={`flex-1 pb-3 text-xs font-semibold border-b-2 transition-colors ${
                  mode === 'sign-up' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Register Pass
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'sign-up' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Student Name</label>
                  <Input
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="h-10 text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Student ID</label>
                <Input
                  autoComplete="username"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CK2026001"
                  className="h-10 text-sm font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-foreground">6-Digit Security PIN</label>
                  <span className="text-[10px] text-muted-foreground font-mono">Demo: 123456</span>
                </div>
                <Input
                  inputMode="numeric"
                  autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                  type="password"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  className="h-10 text-sm font-mono tracking-widest text-center"
                  required
                />
              </div>

              {error && <p role="alert" className="text-xs text-destructive font-medium">{error}</p>}

              <Button className="w-full h-11 text-sm font-semibold rounded-xl" size="lg" type="submit" disabled={busy}>
                {busy ? 'Authenticating…' : mode === 'sign-up' ? 'Create Account' : 'Sign In to CampusKart'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="pt-2 border-t border-border/60 text-center">
              <p className="text-[11px] text-muted-foreground">
                Demo presentation mode. For testing without an enrolled student card.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
