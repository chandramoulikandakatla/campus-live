import React from 'react';
import { ArrowRight, Shield, GraduationCap, PackageCheck, Building2, Truck, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AppNavbar } from '@/components/navigation/AppNavbar';
import freshImage from '@/assets/cat-fresh.jpg';
import snacksImage from '@/assets/cat-snacks.jpg';
import logoIcon from '@/assets/campuskart-icon.jpg';
import brandLogo from '@/assets/campuskart-logo.jpg';

export default function Welcome() {
  const portals = [
    {
      title: 'Student Kiosk',
      desc: 'Touch-optimized storefront, instant digital wallet checkout & contactless pickup.',
      to: '/home',
      icon: GraduationCap,
      badge: 'Storefront',
      accent: 'text-primary'
    },
    {
      title: 'Parent Oversight',
      desc: 'Set daily allowances, review category whitelists, and approve large orders.',
      to: '/parent',
      icon: Shield,
      badge: 'Guardian',
      accent: 'text-emerald-500'
    },
    {
      title: 'Operations Hub',
      desc: 'Live stock management, batch dispatch, and depot replenishment automation.',
      to: '/operations',
      icon: PackageCheck,
      badge: 'Fulfillment',
      accent: 'text-amber-500'
    },
    {
      title: 'Campus Logistics',
      desc: 'EV shuttle routing, telematics tracking, and smart locker verification.',
      to: '/rider',
      icon: Truck,
      badge: 'Fleet',
      accent: 'text-blue-500'
    },
    {
      title: 'College Admin',
      desc: 'FERPA-compliant anonymized campus sales, category demand, and GMV analytics.',
      to: '/college',
      icon: Building2,
      badge: 'Analytics',
      accent: 'text-indigo-400'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <AppNavbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12 space-y-16">
        {/* Hero Section */}
        <section className="grid min-h-[64vh] w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 overflow-hidden rounded-xl border border-border shadow-xs bg-zinc-950 shrink-0">
                <img src={logoIcon} alt="CampusKart Icon" className="h-full w-full object-cover" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-muted/40 text-xs font-semibold text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Pilot Live: Sri Chaitanya & Narayana Junior Academy
              </div>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Campus essentials,<br />
              <span className="text-primary">delivered in minutes.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl">
              A dependable, touch-first campus micro-retail network. Complete with student wallet spending limits, live EV delivery telematics, and touchless OTP hostel locker pickup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/home">
                <Button size="lg" className="rounded-xl px-6 h-12 text-sm font-semibold">
                  Start Student Shopping <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/parent">
                <Button variant="outline" size="lg" className="rounded-xl px-6 h-12 text-sm font-semibold">
                  Parent Oversight <Shield className="ml-2 h-4 w-4 text-emerald-500" />
                </Button>
              </Link>
              <Link to="/track">
                <Button variant="ghost" size="lg" className="rounded-xl px-5 h-12 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Live Tracking Console →
                </Button>
              </Link>
            </div>

            {/* Live Campus Performance Bar */}
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 max-w-lg">
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-foreground">12 mins</p>
                <p className="text-xs text-muted-foreground mt-0.5">Avg. delivery time</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-foreground">0 g CO₂</p>
                <p className="text-xs text-muted-foreground mt-0.5">Electric campus fleet</p>
              </div>
              <div>
                <p className="font-mono text-xl sm:text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">OTP verified pickup</p>
              </div>
            </div>
          </div>

          {/* Visual Showcase: Dual Photography Layout */}
          <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-4 sm:gap-6">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <img
                src={freshImage}
                alt="Fresh campus produce"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                <img
                  src={snacksImage}
                  alt="Packaged study snacks"
                  className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Scheduled Dispersal Windows
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Fulfilled directly during lunch (12:30 PM) and evening dispersal (4:15 PM) to prevent classroom disruption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Portal Ecosystem Cards Section */}
        <section className="space-y-6 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Unified Architecture
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                Five Specialized Campus Portals
              </h2>
            </div>
            <Link to="/ecosystem" className="text-xs font-semibold text-primary hover:underline">
              Launch Multi-Portal Simulator →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {portals.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                        <Icon className={`w-5 h-5 ${p.accent}`} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                        {p.badge}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Open Portal</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border pt-8 pb-12 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CampusKart · Clean Campus Micro-Logistics & Student Commerce</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/parent" className="hover:text-foreground">Parent Portal</Link>
            <Link to="/operations" className="hover:text-foreground">Operations Hub</Link>
            <Link to="/rider" className="hover:text-foreground">Logistics Fleet</Link>
            <Link to="/college" className="hover:text-foreground">Institutional Admin</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
