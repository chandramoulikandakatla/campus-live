import { useState } from 'react';
import { Bike, CheckCircle2, MapPin, Package, Route, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
export default function RiderDashboard() {
  const { orders, updateOrderStatus } = useStore();
  const [showCompleted, setShowCompleted] = useState(false);
  const assigned = orders.filter((order) => order.status === 'packed' || (showCompleted && ['on-the-way', 'collected'].includes(order.status)));
  const dispatch = (orderId: string) => { updateOrderStatus(orderId, 'on-the-way'); toast.success(`${orderId} accepted and dispatched on the demo route.`); };
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-6xl px-4 py-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Badge variant="secondary">Rider experience</Badge><h1 className="mt-3 font-display text-3xl font-bold">Delivery route</h1><p className="mt-1 text-muted-foreground">Accept packed campus orders and move them to the student collection point.</p></div><Button variant="outline" onClick={() => setShowCompleted((value) => !value)}>{showCompleted ? 'Hide route history' : 'Show route history'}</Button></div>
    <div className="mb-6 grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-sm text-muted-foreground">Ready for rider</p><p className="mt-1 font-display text-2xl font-bold">{orders.filter((order) => order.status === 'packed').length}</p></Card><Card className="p-4"><p className="text-sm text-muted-foreground">On the way</p><p className="mt-1 font-display text-2xl font-bold">{orders.filter((order) => order.status === 'on-the-way').length}</p></Card><Card className="p-4"><p className="text-sm text-muted-foreground">Collected</p><p className="mt-1 font-display text-2xl font-bold">{orders.filter((order) => order.status === 'collected').length}</p></Card></div>
    {assigned.length === 0 ? <Card className="p-12 text-center"><Bike className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><h2 className="font-display text-xl font-semibold">No orders assigned</h2><p className="mt-2 text-sm text-muted-foreground">When Operations marks an order as packed, it will appear here for rider dispatch.</p></Card> : <div className="space-y-4">{assigned.map((order) => <Card key={order.id} className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-semibold">{order.id}</h2><Badge variant="outline">{order.status === 'packed' ? 'Ready for dispatch' : order.status === 'on-the-way' ? 'On the way' : 'Collected'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{order.hostel} · {order.institution}, {order.city}</p><p className="mt-2 text-sm">{order.items.map((item) => `${item.product.name} × ${item.quantity}`).join(', ')}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4"/>{order.deliverySlot} · {money(order.total)}</p></div><div className="flex flex-col gap-2 sm:min-w-52">{order.status === 'packed' && <Button onClick={() => dispatch(order.id)}><Truck className="mr-2 h-4 w-4"/>Accept & start delivery</Button>}{order.status === 'on-the-way' && <p className="rounded-xl bg-primary/5 p-3 text-sm"><Route className="mr-2 inline h-4 w-4 text-primary"/>Proceed to the campus pickup point. Operations confirms collection using the student's one-time code.</p>}{order.status === 'collected' && <p className="text-sm font-medium text-primary"><CheckCircle2 className="mr-2 inline h-4 w-4"/>Collection confirmed</p>}</div></div></Card>)}</div>}
    <p className="mt-6 text-xs text-muted-foreground">Rider route is a local prototype simulation. It does not assign a real rider, access GPS or send dispatch notifications.</p>
  </main></div>;
}
