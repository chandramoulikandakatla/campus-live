import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  SlidersHorizontal,
  ClipboardList,
  Store,
  Home,
  Truck,
  ChevronDown,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampusSelector } from '@/components/CampusSelector';
import { useStore, inr } from '@/lib/store';
import { useAuth, useProfile } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { StudentProfileModal } from '@/components/profile/StudentProfileModal';

export function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuth();
  const { data: profile } = useProfile();
  const { theme, toggleTheme, isDark } = useTheme();
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
  const isStudent = !isParent && !isOps && !isCollege && !isDelivery;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand Logo & Portal Switcher */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 font-display text-sm font-bold text-primary-foreground shadow-sm">
              CK
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Campus<span className="text-primary">Kart</span>
            </span>
          </Link>

          {/* Mobile/Compact Portal Selector (visible on < md) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/80 border border-border/60 text-xs font-semibold"
              title="Switch campus portal"
            >
              {isStudent && <><GraduationCap className="w-3.5 h-3.5 text-primary" /><span>Student</span></>}
              {isParent && <><Shield className="w-3.5 h-3.5 text-emerald-500" /><span>Parent</span></>}
              {isOps && <><PackageCheck className="w-3.5 h-3.5 text-amber-500" /><span>Ops</span></>}
              {isDelivery && <><Truck className="w-3.5 h-3.5 text-blue-500" /><span>Logistics</span></>}
              {isCollege && <><Building2 className="w-3.5 h-3.5 text-indigo-400" /><span>College</span></>}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {/* Unified 5-Portal Segmented Bar (visible on md+) */}
          <nav aria-label="Portal Switcher" className="hidden md:flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/40 text-xs">
            <Link
              to="/home"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isStudent
                  ? 'bg-card text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </Link>

            <Link
              to="/parent"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isParent
                  ? 'bg-card text-foreground shadow-sm font-semibold'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isOps
                  ? 'bg-card text-foreground shadow-sm font-semibold'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isDelivery
                  ? 'bg-card text-foreground shadow-sm font-semibold'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isCollege
                  ? 'bg-card text-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>College</span>
            </Link>
          </nav>
        </div>

        {/* Contextual Student Sub-Navigation (desktop student view) */}
        {isStudent && (
          <nav aria-label="Student Navigation" className="hidden xl:flex items-center gap-1 text-xs">
            <Link
              to="/home"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path === '/home' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path.startsWith('/shop') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path === '/cart' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cart
            </Link>
            <Link
              to="/orders"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path === '/orders' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/wallet"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path === '/wallet' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Wallet
            </Link>
          </nav>
        )}

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* Campus Selector */}
          <div className="hidden sm:block">
            <CampusSelector />
          </div>

          {/* Live Wallet Pill */}
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-xs font-semibold text-primary"
            title="View student wallet balance"
          >
            <WalletIcon className="w-3.5 h-3.5" />
            <span className="font-mono">{inr(walletBalance)}</span>
          </Link>

          {/* Cart Button */}
          <Link
            to="/cart"
            aria-label="View shopping bag"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Dark / Light Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Student Profile Button (Always Accessible) */}
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            aria-label="Student profile and digital ID"
            className="flex h-9 items-center gap-1.5 px-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors text-xs font-semibold shadow-sm"
            title="Student Profile & Digital ID"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15 text-primary font-bold text-[10px]">
              {initials}
            </div>
            <span className="hidden sm:inline font-medium text-xs">{studentFirstName}</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-card p-4 lg:hidden animate-in fade-in slide-in-from-top-2">
          <div className="mb-3">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Select Portal</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/home"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isStudent ? 'border-primary/40 bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Kiosk
              </Link>
              <Link
                to="/parent"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isParent ? 'border-primary/40 bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Shield className="w-4 h-4" /> Parent Portal
              </Link>
              <Link
                to="/operations"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isOps ? 'border-primary/40 bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <PackageCheck className="w-4 h-4" /> Operations
              </Link>
              <Link
                to="/rider"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  isDelivery ? 'border-primary/40 bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Truck className="w-4 h-4" /> Logistics Hub
              </Link>
              <Link
                to="/college"
                onClick={() => setMobileOpen(false)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 col-span-2 ${
                  isCollege ? 'border-primary/40 bg-primary/10 font-bold text-primary' : 'border-border'
                }`}
              >
                <Building2 className="w-4 h-4" /> College Admin
              </Link>
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-2">Student Navigation</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/home" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/50 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Home
              </Link>
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/50 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" /> Shop
              </Link>
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/50 flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5" /> Cart
              </Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/50 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Orders
              </Link>
              <Link to="/wallet" onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-muted/50 flex items-center gap-1.5 col-span-2">
                <WalletIcon className="w-3.5 h-3.5" /> Wallet
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

      {/* Student Profile & Digital ID Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
}

export default AppNavbar;
