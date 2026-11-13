import { useMemo } from 'react';
import { ArrowDownToLine, Building2, ClipboardList, PackageCheck, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
export default function CollegeDashboard() {
  const { student, orders } = useStore();
  const now = new Date();
  const activeOrders = orders.filter((order) => !['cancelled', 'pending-approval'].includes(order.status) && order.institution === student.institution && order.city === student.city && new Date(order.createdAt).getFullYear() === now.getFullYear() && new Date(order.createdAt).getMonth() === now.getMonth());
  const gross = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    activeOrders.forEach((order) => order.items.forEach((item) => totals.set(item.product.category, (totals.get(item.product.category) ?? 0) + item.product.price * item.quantity)));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [activeOrders]);
  const exportReport = () => {
    const period = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const rows = [
      ['CampusKart campus statement (illustrative demo)'],
      ['Institution', student.institution],
      ['City', student.city],
      ['Reporting period', period],
      ['Recorded order value (INR)', String(gross)],
      ['Recorded orders', String(activeOrders.length)],
      ['Collected orders', String(activeOrders.filter((order) => order.status === 'collected').length)],
      [],
      ['Category', 'Order value (INR)'],
      ...categoryBreakdown.map(([name, amount]) => [name, String(amount)]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'campuskart-monthly-campus-statement-demo.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Aggregated campus statement downloaded.');
  };
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-7xl px-4 py-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge variant="secondary">Optional college portal</Badge><h1 className="mt-3 font-display text-3xl font-bold">Campus overview</h1><p className="mt-1 text-muted-foreground">Monthly campus-level commerce summary for {student.institution} · {student.city}. Student names and personal purchase profiles are not displayed.</p></div><Button variant="outline" onClick={exportReport}><ArrowDownToLine className="mr-2 h-4 w-4" /> Export activity report</Button></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card className="p-5"><p className="text-sm text-muted-foreground">Order value</p><p className="mt-2 font-display text-3xl font-bold">{money(gross)}</p><p className="text-xs text-muted-foreground">From recorded demo orders</p></Card><Card className="p-5"><p className="text-sm text-muted-foreground">Orders recorded</p><p className="mt-2 font-display text-3xl font-bold">{activeOrders.length}</p><p className="text-xs text-muted-foreground">Excludes declined / approval-pending</p></Card><Card className="p-5"><p className="text-sm text-muted-foreground">Fulfilled</p><p className="mt-2 font-display text-3xl font-bold">{activeOrders.filter((order) => order.status === 'collected').length}</p><p className="text-xs text-muted-foreground">Student collections confirmed</p></Card><Card className="p-5"><p className="text-sm text-muted-foreground">Fulfilment in progress</p><p className="mt-2 font-display text-3xl font-bold">{activeOrders.filter((order) => ['placed', 'packed', 'on-the-way'].includes(order.status)).length}</p><p className="text-xs text-muted-foreground">Across the demo campus</p></Card></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><Card className="p-6"><div className="mb-4 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /><CardTitle>Campus order register</CardTitle></div>{activeOrders.length === 0 ? <div className="rounded-xl bg-muted/50 p-8 text-center"><Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-medium">No demo orders recorded yet</p><p className="mt-1 text-sm text-muted-foreground">Place an order in the student experience to populate this report.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead className="border-b text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Order</th><th className="pb-3">Campus pickup point</th><th className="pb-3">Date</th><th className="pb-3">Status</th><th className="pb-3 text-right">Value</th></tr></thead><tbody>{activeOrders.map((order) => <tr key={order.id} className="border-b border-border/70"><td className="py-3 font-medium">{order.id}</td><td className="py-3">{order.hostel}<span className="block text-xs text-muted-foreground">{order.city}</span></td><td className="py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td><td className="py-3"><Badge variant="outline">{order.status.replace('-', ' ')}</Badge></td><td className="py-3 text-right font-semibold">{money(order.total)}</td></tr>)}</tbody></table></div>}</Card>
      <div className="space-y-6"><Card className="p-6"><div className="mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><CardTitle>Category mix</CardTitle></div>{categoryBreakdown.length === 0 ? <p className="text-sm text-muted-foreground">Category analytics will appear after the first student order.</p> : <div className="space-y-4">{categoryBreakdown.map(([name, amount]) => <div key={name}><div className="mb-1 flex justify-between gap-3 text-sm"><span>{name}</span><strong>{money(amount)}</strong></div><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${gross ? amount / gross * 100 : 0}%` }} /></div></div>)}</div>}</Card>
        <Card className="p-6"><div className="mb-3 flex items-center gap-2"><PackageCheck className="h-5 w-5 text-primary" /><CardTitle>Monthly statement preview</CardTitle></div><p className="text-sm text-muted-foreground">A consolidated, illustrative statement for campus commerce activity. Individual student purchases should remain private unless explicitly authorized.</p><div className="mt-4 rounded-xl bg-muted/60 p-4"><p className="text-xs uppercase text-muted-foreground">Current demo period</p><p className="mt-1 font-display text-xl font-semibold">{new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p><div className="mt-3 flex justify-between text-sm"><span>Recorded order value</span><strong>{money(gross)}</strong></div><div className="mt-2 flex justify-between text-sm"><span>Orders</span><strong>{activeOrders.length}</strong></div></div><p className="mt-3 text-xs text-muted-foreground">Illustrative report only · not a tax invoice or payable college bill.</p></Card></div></div>
  </main></div>;
}
