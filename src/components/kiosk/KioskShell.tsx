import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Receipt, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { inr } from '@/lib/catalog';

const NAV = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/orders', label: 'Orders', icon: Receipt },
  { to: '/cart', label: 'Cart', icon: ShoppingBag },
];

export function KioskShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const count = useCart((s) => s.count());

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="mx-auto w-full max-w-[1600px] px-6 flex items-center gap-6 h-20">
          <Link to="/home" className="flex items-center gap-3 touch-target">
            <span className="w-11 h-11 rounded-2xl gradient-hero flex items-center justify-center">
              <span className="font-display font-semibold text-lg text-primary-foreground">C</span>
            </span>
            <span className="font-display text-xl font-medium tracking-tight hidden sm:block">
              Campus<span className="text-muted-foreground">Kart</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2 ml-auto">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative flex items-center gap-2 px-5 rounded-2xl text-sm font-medium transition-colors touch-target-md ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground border border-border active:bg-muted'
                  }`}
                  style={{ minHeight: 'var(--touch-md)' }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{label}</span>
                  {to === '/cart' && count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-6 h-6 px-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex flex-col items-end leading-tight pl-4 border-l border-border">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Wallet</span>
            <span className="font-display text-lg font-semibold">
              {profile ? inr(profile.wallet_balance) : '—'}
            </span>
          </div>

          <button
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            aria-label="End session"
            className="flex items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground active:bg-muted touch-target-md"
            style={{ minWidth: 'var(--touch-md)', minHeight: 'var(--touch-md)' }}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
