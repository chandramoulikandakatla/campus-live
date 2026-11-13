import { useMemo, useState } from 'react';
import { ArrowDownToLine, Bell, Check, CircleDollarSign, Clock3, CreditCard, Minus, Plus, Shield, TrendingUp, Wallet, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { categories, getSpentThisMonth, getSpentToday, useStore } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function ParentDashboard() {
  const { student, walletBalance, walletTransactions, addFunds, parentLimits, updateParentLimits, orders, approveOrder, rejectOrder } = useStore();
  const [dailyLimit, setDailyLimit] = useState(parentLimits.daily);
  const [monthlyLimit, setMonthlyLimit] = useState(parentLimits.monthly);
  const [approvalAbove, setApprovalAbove] = useState(parentLimits.approvalAbove);
  const [timeRestrictionEnabled, setTimeRestrictionEnabled] = useState(parentLimits.timeRestrictionEnabled);
  const [allowedFrom, setAllowedFrom] = useState(parentLimits.allowedFrom);
  const [allowedUntil, setAllowedUntil] = useState(parentLimits.allowedUntil);
  const [allowedCategories, setAllowedCategories] = useState(parentLimits.categories);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [settingsSaved, setSettingsSaved] = useState(true);

  const spentToday = getSpentToday(orders);
  const spentThisMonth = getSpentThisMonth(orders);
  const currentMonth = new Date();
  const monthOrders = orders.filter((order) => order.status !== 'pending-approval' && order.status !== 'cancelled' && new Date(order.createdAt).getFullYear() === currentMonth.getFullYear() && new Date(order.createdAt).getMonth() === currentMonth.getMonth());
  const pendingOrders = orders.filter((order) => order.status === 'pending-approval');
  const recentActivity = useMemo(() => walletTransactions
    .map((tx) => ({ id: tx.id, label: tx.description, amount: tx.amount, date: tx.createdAt, type: tx.type }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8), [walletTransactions]);

  const handleSave = () => {
    updateParentLimits({ daily: dailyLimit, monthly: monthlyLimit, approvalAbove, categories: allowedCategories, timeRestrictionEnabled, allowedFrom, allowedUntil });
    setSettingsSaved(true);
    toast.success('Spending policy saved for the demo student.');
  };

  const handleTopUp = () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount < 100 || amount > 10000) {
      toast.error('Choose a top-up between ₹100 and ₹10,000.');
      return;
    }
    addFunds(amount);
    toast.success(`${money(amount)} added to the demo wallet.`);
  };

  const downloadStatement = () => {
    const rows = [
      ['Date', 'Description', 'Type', 'Amount (INR)'],
      ...[...walletTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((entry) => [new Date(entry.createdAt).toLocaleString('en-IN'), entry.description, entry.type, String(entry.amount)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'campuskart-parent-statement-demo.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Demo statement downloaded.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="verified">Parent Portal</Badge><Badge variant="secondary">Shared-device demo</Badge></div>
            <h1 className="font-display text-3xl font-bold">Spending Control Center</h1>
            <p className="mt-1 text-muted-foreground">Manage {student.fullName.split(' ')[0]}'s campus wallet, spending policy and orders.</p>
            <p className="mt-1 text-sm text-muted-foreground">{student.fullName} · {student.studentId} · {student.institution}, {student.city} · Parent: {student.parentName}</p>
          </div>
          <Button variant="outline" onClick={downloadStatement}><ArrowDownToLine className="mr-2 h-4 w-4" /> Download statement</Button>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Available wallet</span><Wallet className="h-4 w-4 text-primary" /></div><p className="mt-2 font-display text-3xl font-bold">{money(walletBalance)}</p><p className="mt-1 text-xs text-muted-foreground">Demo balance · no real payment</p></Card>
          <Card className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Spent today</span><CircleDollarSign className="h-4 w-4 text-primary" /></div><p className="mt-2 font-display text-3xl font-bold">{money(spentToday)}</p><p className="mt-1 text-xs text-muted-foreground">of {money(dailyLimit)} daily limit</p><div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, dailyLimit ? spentToday / dailyLimit * 100 : 0)}%` }} /></div></Card>
          <Card className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Spent this month</span><TrendingUp className="h-4 w-4 text-secondary" /></div><p className="mt-2 font-display text-3xl font-bold">{money(spentThisMonth)}</p><p className="mt-1 text-xs text-muted-foreground">of {money(monthlyLimit)} monthly limit</p><div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-secondary" style={{ width: `${Math.min(100, monthlyLimit ? spentThisMonth / monthlyLimit * 100 : 0)}%` }} /></div></Card>
          <Card className="p-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Orders this month</span><CreditCard className="h-4 w-4 text-accent" /></div><p className="mt-2 font-display text-3xl font-bold">{monthOrders.length}</p><p className="mt-1 text-xs text-muted-foreground">Visible from the student demo flow</p></Card>
        </section>

        {pendingOrders.length > 0 && <Card className="mb-6 border-amber-300 bg-amber-50/60 p-5 dark:bg-amber-950/20"><div className="mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-amber-600" /><h2 className="font-display text-lg font-semibold">Orders awaiting your approval</h2><Badge variant="secondary">{pendingOrders.length} pending</Badge></div><div className="space-y-3">{pendingOrders.map((order) => <div key={order.id} className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-background p-4 sm:flex-row sm:items-center"><div><p className="font-semibold">{order.id} · {money(order.total)}</p><p className="text-sm text-muted-foreground">{order.items.map((item) => `${item.product.name} × ${item.quantity}`).join(', ')}</p><p className="mt-1 text-xs text-muted-foreground">{order.deliverySlot} · {order.hostel}</p></div><div className="flex gap-2"><Button size="sm" onClick={() => { const ok = approveOrder(order.id); ok ? toast.success('Order approved and wallet debited.') : toast.error('Insufficient wallet balance. Add funds first.'); }}><Check className="mr-1 h-4 w-4" /> Approve</Button><Button size="sm" variant="outline" onClick={() => { rejectOrder(order.id); toast.success('Order request declined.'); }}><X className="mr-1 h-4 w-4" /> Decline</Button></div></div>)}</div></Card>}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between"><div><CardTitle>Fund student wallet</CardTitle><p className="mt-1 text-sm text-muted-foreground">Simulate a parent top-up for this presentation.</p></div><Wallet className="h-5 w-5 text-primary" /></div>
              <div className="flex flex-wrap gap-2">{[250, 500, 1000].map((amount) => <Button key={amount} variant={topUpAmount === String(amount) ? 'default' : 'outline'} onClick={() => setTopUpAmount(String(amount))}>₹{amount}</Button>)}</div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm" inputMode="numeric" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value.replace(/\D/g, ''))} aria-label="Top-up amount" /><Button onClick={handleTopUp}>Add demo funds</Button></div>
              <p className="mt-3 text-xs text-muted-foreground">This only changes the browser's demo wallet. It does not initiate a payment.</p>
            </Card>

            <Card className="p-6">
              <div className="mb-5 flex items-center justify-between"><div><CardTitle>Spending controls</CardTitle><p className="mt-1 text-sm text-muted-foreground">Set the boundaries for student purchases.</p></div><Shield className="h-5 w-5 text-primary" /></div>
              <div className="space-y-5">
                {[{ label: 'Daily spending limit', value: dailyLimit, set: setDailyLimit, step: 50, min: 100, max: 2000 }, { label: 'Monthly spending limit', value: monthlyLimit, set: setMonthlyLimit, step: 500, min: 1000, max: 20000 }, { label: 'Parent approval above', value: approvalAbove, set: setApprovalAbove, step: 50, min: 100, max: 5000 }].map((limit) => <div key={limit.label}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-medium">{limit.label}</span><strong>{money(limit.value)}</strong></div><div className="flex items-center gap-3"><Button variant="outline" size="icon-sm" onClick={() => { limit.set(Math.max(limit.min, limit.value - limit.step)); setSettingsSaved(false); }}><Minus className="h-4 w-4" /></Button><div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, limit.value / limit.max * 100)}%` }} /></div><Button variant="outline" size="icon-sm" onClick={() => { limit.set(Math.min(limit.max, limit.value + limit.step)); setSettingsSaved(false); }}><Plus className="h-4 w-4" /></Button></div></div>)}
              </div>
              <div className="mt-6 border-t border-border pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Allowed purchase hours</h3><p className="mt-1 text-xs text-muted-foreground">Orders outside this window are sent for parent approval.</p></div><button type="button" role="switch" aria-checked={timeRestrictionEnabled} onClick={() => { setTimeRestrictionEnabled((value) => !value); setSettingsSaved(false); }} className={`relative h-7 w-12 rounded-full transition ${timeRestrictionEnabled ? 'bg-primary' : 'bg-muted'}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${timeRestrictionEnabled ? 'left-6' : 'left-1'}`} /></button></div>{timeRestrictionEnabled && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Allowed from<input type="time" value={allowedFrom} onChange={(event) => { setAllowedFrom(event.target.value); setSettingsSaved(false); }} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3" /></label><label className="text-sm font-medium">Allowed until<input type="time" value={allowedUntil} onChange={(event) => { setAllowedUntil(event.target.value); setSettingsSaved(false); }} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3" /></label></div>}</div><div className="mt-6 border-t border-border pt-5"><h3 className="mb-1 font-semibold">Allowed product categories</h3><p className="mb-3 text-xs text-muted-foreground">Disabled categories are blocked at student checkout.</p><div className="grid gap-2 sm:grid-cols-2">{categories.map((category) => { const active = allowedCategories.includes(category.name); return <button key={category.id} type="button" onClick={() => { setAllowedCategories((previous) => active ? previous.filter((name) => name !== category.name) : [...previous, category.name]); setSettingsSaved(false); }} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${active ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/40 text-muted-foreground'}`}><span>{category.icon} {category.name}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{active && <Check className="h-3 w-3" />}</span></button>; })}</div></div>
              <Button className="mt-5 w-full" onClick={handleSave}>{settingsSaved ? 'Save spending policy' : 'Save changes'}</Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6"><CardTitle className="mb-4">Recent activity</CardTitle>{recentActivity.length === 0 ? <div className="rounded-xl bg-muted/50 p-6 text-center"><Clock3 className="mx-auto mb-2 h-7 w-7 text-muted-foreground" /><p className="font-medium">No activity yet</p><p className="mt-1 text-sm text-muted-foreground">Place an order in the student storefront to see it appear here.</p></div> : <div className="space-y-3">{recentActivity.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-medium">{entry.label}</p><p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString('en-IN')}</p></div><span className={`shrink-0 text-sm font-semibold ${entry.amount > 0 ? 'text-primary' : 'text-foreground'}`}>{entry.amount > 0 ? '+' : ''}{money(entry.amount)}</span></div>)}</div>}</Card>
            <Card className="p-6"><CardTitle className="mb-4">Student & campus</CardTitle><div className="space-y-3 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">Student</span><strong>{student.fullName}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Student ID</span><strong>{student.studentId}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">College / campus</span><strong className="text-right">{student.institution}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Hostel / pickup</span><strong>{student.hostel}</strong></div><div className="flex justify-between gap-3"><span className="text-muted-foreground">Campus city</span><strong>{student.city}</strong></div></div></Card>
            <Card className="p-6"><CardTitle className="mb-3">Planned funding architecture</CardTitle><p className="mb-4 text-sm text-muted-foreground">The production payment rail is designed around a regulated payment partner and a ledger-backed student wallet. The steps below are explanatory only; this prototype does not process money.</p><div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4"><div className="rounded-xl bg-muted p-3"><strong className="block">Parent</strong><span className="text-muted-foreground">Initiates funding</span></div><div className="rounded-xl bg-muted p-3"><strong className="block">Payment partner</strong><span className="text-muted-foreground">Verifies payment</span></div><div className="rounded-xl bg-muted p-3"><strong className="block">Settlement</strong><span className="text-muted-foreground">Regulated rail</span></div><div className="rounded-xl bg-primary/10 p-3"><strong className="block">CampusKart ledger</strong><span className="text-muted-foreground">Credits wallet</span></div></div><p className="mt-3 text-xs text-muted-foreground">CampusKart's production ledger should be double-entry and server-authoritative; the browser demo balance is illustrative.</p></Card><Card className="p-6"><CardTitle className="mb-3">Parent assurance</CardTitle><div className="space-y-2 text-sm text-muted-foreground"><p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Spending rules are visible before checkout.</p><p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Orders above your approval threshold wait for review.</p><p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Every demo top-up and purchase appears in activity.</p><p className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" /> Purchase-hour rules can route out-of-window orders for approval.</p></div><p className="mt-3 text-xs text-muted-foreground">Interactive prototype · shared browser state only.</p></Card>
          </div>
        </div>
      </main>
    </div>
  );
}
