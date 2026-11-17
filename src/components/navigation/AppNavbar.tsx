import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  PackageCheck,
  Building2,
  ShoppingCart,
  Wallet as WalletIcon,
  Sun,
  Moon,
  Menu,
  X,
  Truck,
  ChevronDown,
  Navigation
} from 'lucide-react';
import { CampusSelector } from '@/components/CampusSelector';
import { useStore, inr } from '@/lib/store';
import { useProfile } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { StudentProfileModal } from '@/components/profile/StudentProfileModal';

export function AppNavbar() {
  const location = useLocation();
  const { data: profile } = useProfile();
  const { toggleTheme, isDark } = useTheme();
  const cartCount = useStore((s) => s.getCartCount());
  const walletBalance = useStore((s) => s.walletBalance);
  const orders = useStore((s) => s.orders);
  const student = useStore((s) => s.student);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const fullName = profile?.full_name || student.fullName || 'Aarav Mehta';
  const studentFirstName = fullName.split(' ')[0] || 'Aarav';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const pendingApprovalsCount = orders.filter((o) => o.status === 'pending-approval').length;
  const activeOpsCount = orders.filter((o) => o.status !== 'collected' && o.status !== 'cancelled').length;
  const activeDeliveriesCount = orders.filter((o) => o.status === 'packed' || o.status === 'on-the-way').length;

  // Determine current portal
  const path = location.pathname;
  const isParent = path.startsWith('/parent');
  const isOps = path.startsWith('/operations');
  const isDelivery = path.startsWith('/rider') || path.startsWith('/delivery') || path.startsWith('/logistics');
  const isCollege = path.startsWith('/college');
  const isStudent = !isParent && !isOps && !isCollege && !isDelivery && path !== '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors duration-200">
      {/* Primary Top Bar (Fixed 64px, perfectly stable across all 5 portals) */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-display text-sm font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105">
              CK
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base font-bold tracking-tight leading-tight text-foreground">
                Campus<span className="text-primary">Kart</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono leading-none">
                SCNA · Hyderabad
              </span>
            </div>
          </Link>

          {/* Compact Active Portal Button for Mobile (< md) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-semibold"
              title="Switch campus portal"
            >
              {isParent ? (
                <><Shield className="w-3.5 h-3.5 text-emerald-500" /><span>Parent</span></>
              ) : isOps ? (
                <><PackageCheck className="w-3.5 h-3.5 text-amber-500" /><span>Ops</span></>
              ) : isDelivery ? (
                <><Truck className="w-3.5 h-3.5 text-blue-500" /><span>Logistics</span></>
              ) : isCollege ? (
                <><Building2 className="w-3.5 h-3.5 text-indigo-400" /><span>College</span></>
              ) : (
                <><GraduationCap className="w-3.5 h-3.5 text-primary" /><span>Student</span></>
              )}
              <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
            </button>
          </div>
        </div>

        {/* Center: Global 5-Portal Segmented Switcher (Visible md+, permanent position) */}
        <nav
          aria-label="Campus Portals"
          className="hidden md:flex items-center gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 p-1 border border-zinc-200 dark:border-zinc-800 text-xs select-none"
        >
          <Link
            to="/home"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isStudent
                ? 'bg-white dark:bg-zinc-800 text-foreground font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </Link>

          <Link
            to="/parent"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isParent
                ? 'bg-white dark:bg-zinc-800 text-foreground font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Parent</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>

          <Link
            to="/operations"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isOps
                ? 'bg-white dark:bg-zinc-800 text-foreground font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Operations</span>
            {activeOpsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                {activeOpsCount}
              </span>
            )}
          </Link>

          <Link
            to="/rider"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isDelivery
                ? 'bg-white dark:bg-zinc-800 text-foreground font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Logistics</span>
            {activeDeliveriesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                {activeDeliveriesCount}
              </span>
            )}
          </Link>

          <Link
            to="/college"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              isCollege
                ? 'bg-white dark:bg-zinc-800 text-foreground font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>College</span>
          </Link>
        </nav>

        {/* Right: Global Actions & User Controls */}
        <div className="flex items-center gap-2">
          {/* Campus Selector */}
          <div className="hidden lg:block">
            <CampusSelector />
          </div>

          {/* Student Wallet Pill */}
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-semibold text-foreground shadow-xs"
            title="Student Wallet Balance"
          >
            <WalletIcon className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono">{inr(walletBalance)}</span>
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Student Profile & Digital Pass Button */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            aria-label="Student profile and digital ID pass"
            className="flex h-9 items-center gap-2 px-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors text-xs font-semibold shadow-xs"
            title="Student Profile & ID Pass"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-bold text-[10px]">
              {initials}
            </div>
            <span className="hidden sm:inline font-medium text-xs">{studentFirstName}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Secondary Sub-Navigation for Student Portal (Only shown on student storefront routes) */}
      {isStudent && (
        <div className="border-t border-border/60 bg-muted/20">
          <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 text-xs">
            <nav aria-label="Student Views" className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-1">
              <Link
                to="/home"
                className={`py-1.5 transition-colors whitespace-nowrap ${
                  path === '/home'
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`py-1.5 transition-colors whitespace-nowrap ${
                  path.startsWith('/shop')
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Shop</span>
              </Link>
              <Link
                to="/cart"
                className={`py-1.5 transition-colors whitespace-nowrap flex items-center gap-1 ${
                  path === '/cart'
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Cart</span>
                {cartCount > 0 && <span className="text-[10px] opacity-75">({cartCount})</span>}
              </Link>
              <Link
                to="/orders"
                className={`py-1.5 transition-colors whitespace-nowrap ${
                  path === '/orders'
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Orders
              </Link>
              <Link
                to="/track"
                className={`flex items-center gap-1 py-1.5 transition-colors whitespace-nowrap ${
                  path.startsWith('/track')
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Navigation className="w-3 h-3 text-primary" />
                Live Tracking
              </Link>
              <Link
                to="/wallet"
                className={`py-1.5 transition-colors whitespace-nowrap ${
                  path === '/wallet'
                    ? 'font-bold text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>Wallet</span>
              </Link>
            </nav>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground font-medium shrink-0">
              <span>Next Window: <strong className="text-foreground">12:30 – 1:45 PM</strong> (Lunch Break)</span>
              <span>·</span>
              <span>Hostel Block B Lockers</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu (< md) */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Select Campus Portal
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/home"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isStudent ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Kiosk
              </Link>
              <Link
                to="/parent"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isParent ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Shield className="w-4 h-4" /> Parent Portal
              </Link>
              <Link
                to="/operations"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isOps ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <PackageCheck className="w-4 h-4" /> Operations
              </Link>
              <Link
                to="/rider"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isDelivery ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Truck className="w-4 h-4" /> Logistics Hub
              </Link>
              <Link
                to="/college"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 col-span-2 ${
                  isCollege ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Building2 className="w-4 h-4" /> College Admin
              </Link>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">
              Student Navigation
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/home" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60">
                Home
              </Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60">
                Shop
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60 flex items-center justify-between">
                <span>Cart</span>
                {cartCount > 0 && <span className="text-[10px] opacity-75 font-bold">({cartCount})</span>}
              </Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60">
                Orders
              </Link>
              <Link to="/track" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60">
                Live Tracking
              </Link>
              <Link to="/wallet" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/60 flex items-center justify-between">
                <span>Wallet</span>
                <span className="text-[10px] font-mono text-muted-foreground">{inr(walletBalance)}</span>
              </Link>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <div className="sm:hidden">
              <CampusSelector />
            </div>
            <Link
              to="/ecosystem"
              onClick={() => setMobileOpen(false)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Multi-Portal Simulator →
            </Link>
          </div>
        </div>
      )}

      {/* Student Profile & Digital Pass Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
}

export default AppNavbar;
