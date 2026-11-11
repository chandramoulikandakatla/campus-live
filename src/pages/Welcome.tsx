import { ArrowRight, ShieldCheck, TimerReset } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import freshImage from '@/assets/cat-fresh.jpg';
import snacksImage from '@/assets/cat-snacks.jpg';

export default function Welcome() {
  return (
    <main className="min-h-screen bg-background px-6 py-8 sm:px-10 lg:px-16">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <Link to="/" className="flex min-h-12 items-center gap-3" aria-label="CampusKart home">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-xl font-semibold text-primary-foreground">C</span>
          <span className="font-display text-xl font-semibold">CampusKart</span>
        </Link>
        <Link to="/login"><Button variant="outline" size="lg">Student sign in</Button></Link>
      </header>
      <section className="mx-auto grid min-h-[76vh] w-full max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <p className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground"><span className="h-2 w-2 rounded-full bg-[hsl(var(--in-stock))]" /> CAMPUS PICKUP · STUDENT ACCESS</p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">Essentials,<br />right when<br />you need them.</h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">A dependable campus shop for everyday essentials, with your spending and balance always in view.</p>
          <div className="mt-9 flex flex-wrap gap-4"><Link to="/login"><Button size="xl">Start shopping <ArrowRight /></Button></Link><div className="flex items-center gap-2 px-3 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5" /> Student-only access</div></div>
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-6 text-sm text-muted-foreground"><span className="flex items-center gap-2"><TimerReset className="h-4 w-4" /> Campus-ready essentials</span><span>Wallet checkout</span><span>Live stock</span></div>
        </div>
        <div className="grid grid-cols-[1.1fr_0.9fr] items-center gap-4 sm:gap-6"><img src={freshImage} alt="Fresh produce available at CampusKart" className="aspect-[4/5] w-full rounded-sm object-cover" /><div className="space-y-4 sm:space-y-6"><img src={snacksImage} alt="Campus snacks available at CampusKart" className="aspect-square w-full rounded-sm object-cover" /><p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Thoughtfully stocked for the little things that make campus life easier.</p></div></div>
      </section>
      <p className="mx-auto max-w-7xl border-t border-border pt-5 text-xs text-muted-foreground">CampusKart · Your campus essentials, in one place.</p>
    </main>
  );
}