import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  Bell,
  Check,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Minus,
  Plus,
  Shield,
  TrendingUp,
  Wallet,
  X,
  PieChart as PieChartIcon,
  BarChart3,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { categories, getSpentThisMonth, getSpentToday, useStore } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

export default function ParentDashboard() {
  const {
    student,
    walletBalance,
    walletTransactions,
    addFunds,
    parentLimits,
    updateParentLimits,
    orders,
    approveOrder,
    rejectOrder
  } = useStore();

  const [dailyLimit, setDailyLimit] = useState(parentLimits.daily);
  const [monthlyLimit, setMonthlyLimit] = useState(parentLimits.monthly);
  const [approvalAbove, setApprovalAbove] = useState(parentLimits.approvalAbove);
  const [timeRestrictionEnabled, setTimeRestrictionEnabled] = useState(parentLimits.timeRestrictionEnabled);
  const [allowedFrom, setAllowedFrom] = useState(parentLimits.allowedFrom);
  const [allowedUntil, setAllowedUntil] = useState(parentLimits.allowedUntil);
  const [allowedCategories, setAllowedCategories] = useState(parentLimits.categories);
  const [topUpAmount, setTopUpAmount] = useState('1000');
  const [fundingMethod, setFundingMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'approvals' | 'statements'>('overview');

  const spentToday = getSpentToday(orders);
  const spentThisMonth = getSpentThisMonth(orders);
  const pendingOrders = orders.filter((order) => order.status === 'pending-approval');

  // Category spending aggregation for Recharts PieChart
  const categoryChartData = useMemo(() => {
    const map = new Map<string, number>();
    orders
      .filter((o) => o.status !== 'cancelled' && o.status !== 'pending-approval')
      .forEach((order) => {
        order.items.forEach((it) => {
          map.set(it.product.category, (map.get(it.product.category) ?? 0) + it.product.price * it.quantity);
        });
      });

    if (map.size === 0) {
      return [
        { name: 'Food and Snacks', value: 450 },
        { name: 'Beverages', value: 220 },
        { name: 'Stationery', value: 180 },
        { name: 'Hygiene & Personal Care', value: 150 }
      ];
    }

    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Daily budget comparison bar data
  const budgetBarData = useMemo(() => [
    { name: 'Spent Today', amount: spentToday, cap: dailyLimit },
    { name: 'Daily Cap', amount: dailyLimit, cap: dailyLimit },
  ], [spentToday, dailyLimit]);

  const recentActivity = useMemo(
    () =>
      [...walletTransactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [walletTransactions]
  );

  const handleSavePolicy = () => {
    updateParentLimits({
      daily: dailyLimit,
      monthly: monthlyLimit,
      approvalAbove,
      categories: allowedCategories,
      timeRestrictionEnabled,
      allowedFrom,
      allowedUntil
    });
    toast.success('Spending policies and parent limits saved successfully!');
  };

  const handleTopUp = () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount < 100 || amount > 10000) {
      toast.error('Choose a top-up between ₹100 and ₹10,000.');
      return;
    }
    addFunds(amount);
    toast.success(`${money(amount)} added to ${student.fullName}'s wallet via ${fundingMethod}!`);
  };

  const toggleCategory = (catName: string) => {
    setAllowedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const downloadStatement = () => {
    const rows = [
      ['CampusKart Parent Statement', student.fullName, student.studentId],
      ['Statement Date', new Date().toLocaleString('en-IN')],
      ['Current Wallet Balance', String(walletBalance)],
      [],
      ['Date', 'Description', 'Type', 'Amount (INR)'],
      ...walletTransactions.map((tx) => [
        new Date(tx.createdAt).toLocaleString('en-IN'),
        tx.description,
        tx.type,
        String(tx.amount)
      ])
    ];
    const csv = rows.map((r) => r.map((c) => `"${(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuskart-statement-${student.studentId}.csv`;
    a.click();
    toast.success('Official parent wallet statement downloaded.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
        {/* Header Banner */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="verified">Parent Oversight & Guardian Portal</Badge>
              <Badge variant="secondary">{student.institution}</Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold">
              Parent Dashboard · {student.fullName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Student ID: {student.studentId} · Linked Wallet: {money(walletBalance)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              Overview & Analytics
            </Button>
            <Button
              variant={activeTab === 'controls' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('controls')}
            >
              Spending Rules
            </Button>
            <Button
              variant={activeTab === 'approvals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('approvals')}
              className="relative"
            >
              Approvals
              {pendingOrders.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground text-[10px]">
                  {pendingOrders.length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'statements' ? 'outline' : 'outline'}
              size="sm"
              onClick={downloadStatement}
            >
              <ArrowDownToLine className="w-4 h-4 mr-1" /> Export Statement
            </Button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-5">
                <p className="text-xs uppercase text-muted-foreground font-medium">Available Balance</p>
                <p className="mt-2 font-display text-3xl font-bold text-primary">{money(walletBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">Ready for kiosk checkouts</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs uppercase text-muted-foreground font-medium">Spent Today</p>
                <p className="mt-2 font-display text-3xl font-bold">{money(spentToday)}</p>
                <p className="text-xs text-muted-foreground mt-1">Cap: {money(parentLimits.daily)} / day</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs uppercase text-muted-foreground font-medium">Spent This Month</p>
                <p className="mt-2 font-display text-3xl font-bold">{money(spentThisMonth)}</p>
                <p className="text-xs text-muted-foreground mt-1">Cap: {money(parentLimits.monthly)} / mo</p>
              </Card>

              <Card className="p-5">
                <p className="text-xs uppercase text-muted-foreground font-medium">Pending Approvals</p>
                <p className="mt-2 font-display text-3xl font-bold text-amber-500">{pendingOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Orders requiring consent</p>
              </Card>
            </div>

            {/* Quick Top-up & Spending Charts */}
            <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
              {/* Quick Top-Up Card */}
              <Card className="p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold">Fast Wallet Top-Up</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Instant credit directly to {student.fullName.split(' ')[0]}'s touchless card.
                  </p>

                  <div className="mt-4 flex gap-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        size="sm"
                        variant={Number(topUpAmount) === amt ? 'default' : 'outline'}
                        onClick={() => setTopUpAmount(String(amt))}
                        className="flex-1 text-xs"
                      >
                        ₹{amt}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground">Custom Amount (INR)</label>
                    <Input
                      type="number"
                      min="100"
                      max="10000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {(['UPI', 'Card', 'NetBanking'] as const).map((m) => (
                        <Button
                          key={m}
                          type="button"
                          size="sm"
                          variant={fundingMethod === m ? 'secondary' : 'outline'}
                          onClick={() => setFundingMethod(m)}
                          className="text-xs"
                        >
                          {m}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleTopUp} className="mt-6 w-full" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" /> Add {money(Number(topUpAmount) || 0)} Now
                </Button>
              </Card>

              {/* Recharts Category Pie Breakdown */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold">Spending by Category</h3>
                    <p className="text-xs text-muted-foreground">Aggregated across all verified student orders</p>
                  </div>
                  <PieChartIcon className="w-5 h-5 text-muted-foreground" />
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => money(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  {categoryChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="truncate text-muted-foreground">{entry.name}:</span>
                      <strong className="text-foreground">{money(entry.value)}</strong>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Recent Audit Ledger */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Recent Wallet Ledger Activity</h3>
                  <p className="text-xs text-muted-foreground">Direct feed from the atomic campus ledger</p>
                </div>
                <Badge variant="outline">Live Synchronized</Badge>
              </div>

              <div className="space-y-3">
                {recentActivity.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground text-sm">{tx.description}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('en-IN')} · Ref: {tx.id}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-foreground'
                      }`}
                    >
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: SPENDING CONTROLS & RULES */}
        {activeTab === 'controls' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold">Limits & Thresholds</h3>
                <p className="text-xs text-muted-foreground">Adjust maximum spending allowances for the student.</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">Daily Limit</span>
                  <strong className="font-mono">{money(dailyLimit)}</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">Monthly Limit</span>
                  <strong className="font-mono">{money(monthlyLimit)}</strong>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">Single-Order Approval Threshold</span>
                  <strong className="font-mono">{money(approvalAbove)}</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={approvalAbove}
                  onChange={(e) => setApprovalAbove(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Orders exceeding this amount are placed on hold until parent approval.
                </p>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Curfew & Time-of-Day Gating</span>
                  <input
                    type="checkbox"
                    checked={timeRestrictionEnabled}
                    onChange={(e) => setTimeRestrictionEnabled(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                </div>

                {timeRestrictionEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Allowed From</label>
                      <Input
                        type="time"
                        value={allowedFrom}
                        onChange={(e) => setAllowedFrom(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Allowed Until</label>
                      <Input
                        type="time"
                        value={allowedUntil}
                        onChange={(e) => setAllowedUntil(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSavePolicy} className="w-full">
                Save Spending Policies
              </Button>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-display text-lg font-bold">Category Allowances & Restrictions</h3>
                <p className="text-xs text-muted-foreground">
                  Uncheck prohibited categories. Blocked items cannot be checked out at the kiosk.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((c) => {
                  const allowed = allowedCategories.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.name)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                        allowed
                          ? 'border-primary/30 bg-primary/5 text-foreground'
                          : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.icon}</span>
                        <span className="font-semibold">{c.name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          allowed ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {allowed ? 'Allowed' : 'Blocked'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Button onClick={handleSavePolicy} className="w-full mt-5" variant="outline">
                Update Allowed Categories
              </Button>
            </Card>
          </div>
        )}

        {/* TAB 3: APPROVAL QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold">Pending Student Approvals</h2>
                <p className="text-xs text-muted-foreground">
                  Orders flagged for exceeding daily limits or your single-order threshold.
                </p>
              </div>
              <Badge variant="outline">{pendingOrders.length} Pending</Badge>
            </div>

            {pendingOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-display text-lg font-bold">All caught up!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No orders currently require parental consent.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="p-5 border-amber-500/30">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg">{order.id}</h3>
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600">
                            Approval Required
                          </Badge>
                          <span className="font-bold text-base">{money(order.total)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Placed by {order.studentName} on {new Date(order.createdAt).toLocaleString('en-IN')}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.items.map((it) => (
                            <span key={it.product.id} className="px-2.5 py-1 rounded bg-muted text-xs">
                              {it.product.name} × {it.quantity} ({money(it.product.price * it.quantity)})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            rejectOrder(order.id);
                            toast.info(`Order ${order.id} declined.`);
                          }}
                        >
                          Decline Order
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const ok = approveOrder(order.id);
                            if (ok) toast.success(`Order ${order.id} approved! ${money(order.total)} debited.`);
                            else toast.error('Insufficient wallet balance to approve order.');
                          }}
                        >
                          Approve & Debit ({money(order.total)})
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
