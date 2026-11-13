import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, Shield, Compass, GraduationCap, ClipboardList, Building2, PackageCheck, Wallet, MonitorSmartphone, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampusSelector } from '@/components/CampusSelector';
import { useStore } from '@/lib/store';

const links = [
  { href: '/', label: 'Student shop', icon: GraduationCap },
  { href: '/products', label: 'Products', icon: Compass },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/parent', label: 'Parent', icon: Shield },
  { href: '/college', label: 'College', icon: Building2 },
  { href: '/operations', label: 'Operations', icon: PackageCheck },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/kiosk', label: 'Kiosk', icon: MonitorSmartphone },
  { href: '/rider', label: 'Rider', icon: Bike },
  { href: '/demo', label: 'Demo center', icon: Compass },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = useStore((state) => state.getCartCount());
  const active = (path: string) => location.pathname === path;
  return <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
    <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
      <Link to="/" className="flex shrink-0 items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">C</span><span className="font-display text-xl font-bold">Campus<span className="text-primary">Kart</span></span></Link>
      <div className="hidden items-center gap-1 xl:flex">{links.map((link) => <Link key={link.href} to={link.href} className={`rounded-lg px-3 py-2 text-xs font-medium transition ${active(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{link.label}</Link>)}</div>
      <div className="flex items-center gap-2"><CampusSelector /><Badge variant="secondary" className="hidden 2xl:inline-flex">Interactive demo</Badge><Link to="/cart" className="relative"><Button variant="ghost" size="icon-sm" aria-label="Open cart"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</motion.span>}</Button></Link><Button variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen((value) => !value)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button></div>
    </div>
    <AnimatePresence>{mobileMenuOpen && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-border bg-card xl:hidden"><div className="container mx-auto grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-3">{links.map((link) => <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium ${active(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}><link.icon className="h-4 w-4" />{link.label}</Link>)}<Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground hover:bg-muted"><ShoppingCart className="h-4 w-4" />Cart ({cartCount})</Link></div></motion.div>}</AnimatePresence>
  </nav>;
}
