import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, Truck, UserCheck, ChevronRight, XCircle, Download, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore, type OrderStatus } from '@/lib/store';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const statusConfig: Record<OrderStatus, { icon: typeof Package; label: string; color: string }> = {
  'pending-approval': { icon: Clock, label: 'Awaiting parent approval', color: 'text-amber-600' },
  placed: { icon: Package, label: 'Order placed', color: 'text-muted-foreground' },
  packed: { icon: Package, label: 'Packed', color: 'text-amber-600' },
  'on-the-way': { icon: Truck, label: 'Out for delivery', color: 'text-blue-600' },
  collected: { icon: CheckCircle2, label: 'Collected', color: 'text-primary' },
  cancelled: { icon: XCircle, label: 'Declined / cancelled', color: 'text-destructive' },
};

const steps: OrderStatus[] = ['placed', 'packed', 'on-the-way', 'collected'];

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const student = useStore((state) => state.student);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );
  const selectedOrder = sortedOrders.find((order) => order.id === selectedOrderId) ?? sortedOrders[0] ?? null;

  const downloadReceipt = (order: typeof selectedOrder) => {
    if (!order) return;
    const rows = [
      ['CampusKart demo order receipt'],
      ['Order ID', order.id],
      ['Date', new Date(order.createdAt).toLocaleString('en-IN')],
      ['Student', order.studentName],
      ['Student ID', order.studentId],
      ['Institution', order.institution],
      ['Campus', order.city],
      ['Pickup location', order.hostel],
      ['Delivery window', order.deliverySlot ?? order.estimatedDelivery],
      ['Payment status', order.paymentStatus],
      [],
      ['Product', 'Quantity', 'Unit price (INR)', 'Line total (INR)'],
      ...order.items.map((item) => [
        item.product.name,
        String(item.quantity),
        String(item.product.price),
        String(item.product.price * item.quantity),
      ]),
      [],
      ['Total (INR)', String(order.total)],
      ['Pickup code (demo)', order.pickupCode],
      ['Notice', 'Illustrative demo receipt only. Not a tax invoice or proof of real payment.'],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `campuskart-receipt-${order.id}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Demo order receipt downloaded.');
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
      <div className="mb-8">
        <Badge variant="secondary">
          {student.fullName} · {student.studentId}
        </Badge>
        <h1 className="mt-3 font-display text-3xl font-bold">Your orders</h1>
        <p className="mt-1 text-muted-foreground">
          Follow each order from parent approval through campus collection.
        </p>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="font-display text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your placed orders and their live demo status will appear here.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Browse essentials
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {sortedOrders.map((order, index) => {
              const Icon = statusConfig[order.status].icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card
                    className={`cursor-pointer p-4 transition hover:border-primary/40 ${
                      selectedOrder?.id === order.id ? 'border-primary/40 bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Icon className={`h-5 w-5 ${statusConfig[order.status].color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{order.id}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} units · {money(order.total)}
                          </p>
                          <Badge className="mt-2" variant="outline">
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {selectedOrder && (
            <Card key={selectedOrder.id} className="p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Order details</p>
                  <h2 className="font-display text-xl font-bold">{selectedOrder.id}</h2>
                </div>
                <Badge variant="outline">{statusConfig[selectedOrder.status].label}</Badge>
              </div>

              {selectedOrder.status === 'pending-approval' ? (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <p className="font-semibold">Waiting for parent approval</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The wallet is not charged until the parent approves this request. Open the Parent Portal to review it.
                  </p>
                  <Link to="/parent" className="mt-2 inline-block text-sm font-semibold text-primary">
                    Open Parent Portal →
                  </Link>
                </div>
              ) : selectedOrder.status === 'cancelled' ? (
                <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                  This order request was declined or cancelled.
                </div>
              ) : (
                <div className="mb-7">
                  <h3 className="mb-4 font-semibold">Fulfilment progress</h3>
                  <div className="space-y-3">
                    {steps.map((step, index) => {
                      const currentIndex = steps.indexOf(selectedOrder.status as typeof steps[number]);
                      const complete = currentIndex >= index;
                      const Icon = statusConfig[step].icon;
                      return (
                        <div className="flex items-center gap-3" key={step}>
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full ${
                              complete ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${complete ? '' : 'text-muted-foreground'}`}>
                              {statusConfig[step].label}
                            </p>
                            {step === selectedOrder.status && (
                              <p className="text-xs text-muted-foreground">{selectedOrder.deliverySlot}</p>
                            )}
                          </div>
                          {complete && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-5">
                <h3 className="mb-3 font-semibold">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-11 w-11 rounded-lg bg-muted object-contain p-1"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {money(item.product.price)}
                        </p>
                      </div>
                      <strong className="text-sm">{money(item.product.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery location</span>
                  <strong>{selectedOrder.hostel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campus</span>
                  <strong>
                    {selectedOrder.institution}, {selectedOrder.city}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery window</span>
                  <strong>{selectedOrder.deliverySlot}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <strong>
                    {selectedOrder.paymentStatus === 'paid' ? 'Demo wallet debited' : 'Awaiting approval'}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <strong>Total</strong>
                  <strong className="font-display text-xl">{money(selectedOrder.total)}</strong>
                </div>
                <Button variant="outline" className="mt-4 w-full" onClick={() => downloadReceipt(selectedOrder)}>
                  <Download className="mr-2 h-4 w-4" /> Download demo receipt
                </Button>
              </div>

              {/* Live Transit & EV Shuttle Tracking Banner */}
              {['packed', 'on-the-way'].includes(selectedOrder.status) && (
                <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Campus EV Shuttle #04 in Transit</p>
                        <p className="text-[11px] text-muted-foreground">Driver: Ramesh Kumar · Contact: +91 98480 22334</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px] font-bold animate-pulse">
                      Live Telematics
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Departed Central Depot</span>
                      <span className="font-semibold text-primary">ETA: ~4 mins (Hostel B Lobby)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full w-2/3 animate-pulse" />
                    </div>
                  </div>

                  <Link
                    to="/rider"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Live Campus Route Map & Telematics →
                  </Link>
                </div>
              )}

              {['placed', 'packed', 'on-the-way'].includes(selectedOrder.status) && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
                  <p className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                    <UserCheck className="h-4 w-4" /> Kiosk Pickup Security Token
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Present this 6-digit OTP or scan your token at the campus kiosk:
                  </p>
                  <div className="my-2 font-mono text-3xl font-extrabold tracking-[0.25em] text-foreground">
                    {selectedOrder.pickupCode}
                  </div>
                  <div className="mx-auto my-3 flex h-24 w-24 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="24" height="24" fill="#0f172a" />
                      <rect x="14" y="14" width="16" height="16" fill="white" />
                      <rect x="18" y="18" width="8" height="8" fill="#0f172a" />
                      <rect x="66" y="10" width="24" height="24" fill="#0f172a" />
                      <rect x="70" y="14" width="16" height="16" fill="white" />
                      <rect x="74" y="18" width="8" height="8" fill="#0f172a" />
                      <rect x="10" y="66" width="24" height="24" fill="#0f172a" />
                      <rect x="14" y="70" width="16" height="16" fill="white" />
                      <rect x="18" y="74" width="8" height="8" fill="#0f172a" />
                      <rect x="42" y="14" width="8" height="16" fill="#0f172a" />
                      <rect x="42" y="42" width="16" height="16" fill="#0f172a" />
                      <rect x="66" y="42" width="10" height="8" fill="#0f172a" />
                      <rect x="42" y="70" width="16" height="8" fill="#0f172a" />
                      <rect x="66" y="66" width="24" height="24" fill="#0f172a" />
                      <rect x="72" y="72" width="12" height="12" fill="white" />
                    </svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                    Token: TOKEN-{selectedOrder.id}-{selectedOrder.pickupCode}
                  </span>
                </div>
              )}

              {selectedOrder.note && (
                <p className="mt-4 text-xs text-muted-foreground">Delivery note: {selectedOrder.note}</p>
              )}
              <p className="mt-5 text-xs text-muted-foreground">
                Demo order record · {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
              </p>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
