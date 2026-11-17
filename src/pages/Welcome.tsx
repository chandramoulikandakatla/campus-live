import { ArrowRight, ShieldCheck, TimerReset, GraduationCap, Shield, PackageCheck, Building2, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import freshImage from '@/assets/cat-fresh.jpg';
import snacksImage from '@/assets/cat-snacks.jpg';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <AppNavbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <section className="grid min-h-[72vh] w-full items-center gap-12 py-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge variant="verified">Smart Campus Commerce</Badge>
              <Badge variant="secondary">FERPA & Guardian Aligned</Badge>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl tracking-tight">
              Campus essentials,<br />
              <span className="text-primary">right when you need them.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              A dependable, touch-optimized campus retail ecosystem with parent spending safeguards, real-time kiosk inventory, and touchless OTP pickup.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/home">
                <Button size="lg" className="rounded-xl px-6">
                  Start Student Shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/parent">
                <Button variant="outline" size="lg" className="rounded-xl px-6">
                  Parent Oversight <Shield className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-2.5 border-t border-border pt-6 text-xs text-muted-foreground">
              <Link to="/home" className="p-3 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 transition">
                <GraduationCap className="w-4 h-4 text-primary mb-1" />
                <p className="font-semibold text-foreground">Student</p>
                <p className="text-[10px] text-muted-foreground">Touch-ready shop</p>
              </Link>

              <Link to="/parent" className="p-3 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 transition">
                <Shield className="w-4 h-4 text-emerald-500 mb-1" />
                <p className="font-semibold text-foreground">Parent</p>
                <p className="text-[10px] text-muted-foreground">Allowance</p>
              </Link>

              <Link to="/operations" className="p-3 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 transition">
                <PackageCheck className="w-4 h-4 text-amber-500 mb-1" />
                <p className="font-semibold text-foreground">Operations</p>
                <p className="text-[10px] text-muted-foreground">Fulfillment</p>
              </Link>

              <Link to="/rider" className="p-3 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 transition">
                <Truck className="w-4 h-4 text-blue-500 mb-1" />
                <p className="font-semibold text-foreground">Logistics</p>
                <p className="text-[10px] text-muted-foreground">EV routing</p>
              </Link>

              <Link to="/college" className="p-3 rounded-xl border border-border/60 bg-card/60 hover:border-primary/40 transition">
                <Building2 className="w-4 h-4 text-indigo-400 mb-1" />
                <p className="font-semibold text-foreground">College</p>
                <p className="text-[10px] text-muted-foreground">Analytics</p>
              </Link>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="grid grid-cols-[1.05fr_0.95fr] items-center gap-4 sm:gap-6">
            <div className="overflow-hidden rounded-2xl border border-border shadow-md">
              <img
                src={freshImage}
                alt="Fresh produce available at CampusKart"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border shadow-md">
                <img
                  src={snacksImage}
                  alt="Campus snacks available at CampusKart"
                  className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4 rounded-2xl border border-border/60 bg-muted/40">
                <p className="text-xs font-semibold text-foreground">Campus Pilot Operational</p>
                <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">
                  Fulfilled within lunch and evening dispersal windows with 98.4% efficiency.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <p>CampusKart · Production-Grade Campus Commerce Ecosystem</p>
          <div className="flex gap-4">
            <Link to="/parent" className="hover:text-foreground">Parent Access</Link>
            <Link to="/operations" className="hover:text-foreground">Kiosk Operator</Link>
            <Link to="/college" className="hover:text-foreground">Institutional</Link>
            <Link to="/ecosystem" className="text-primary font-medium hover:underline">Simulator</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
