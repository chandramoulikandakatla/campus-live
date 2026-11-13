import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Clock, Shield, AlertCircle, Wallet, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { getSpentThisMonth, getSpentToday, useStore } from '@/lib/store';

const deliverySlots = [
  { id: 'morning', time: '10:00 – 11:00 AM', available: true },
  { id: 'midday', time: '12:00 – 1:00 PM', available: true },
  { id: 'afternoon', time: '3:00 – 4:00 PM', available: true },
  { id: 'evening', time: '6:00 – 7:00 PM', available: true },
];
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, parentLimits, addOrder, student, selectedCampus, selectedInstitution, selectedHostel, walletBalance, orders } = useStore();
  const [selectedSlot, setSelectedSlot] = useState<string>('midday');
  const [note, setNote] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; slot: string; total: number; approval: boolean } | null>(null);
  const total = getCartTotal();
  const spentToday = getSpentToday(orders);
  const spentThisMonth = getSpentThisMonth(orders);
  const categoriesBlocked = [...new Set(cart.filter((item) => !parentLimits.categories.includes(item.product.category)).map((item) => item.product.category))];
  const exceedsDaily = spentToday + total > parentLimits.daily;
  const exceedsMonthly = spentThisMonth + total > parentLimits.monthly;
  const insufficientWallet = total > walletBalance;
  const now = new Date();
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const parseTime = (value: string, fallback: string) => {
    const [hours, minutes] = (value || fallback).split(':').map(Number);
    return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : Number(fallback.slice(0, 2)) * 60 + Number(fallback.slice(3, 5));
  };
  const fromMinute = parseTime(parentLimits.allowedFrom, '06:00');
  const untilMinute = parseTime(parentLimits.allowedUntil, '23:00');
  const withinAllowedHours = fromMinute <= untilMinute ? currentMinute >= fromMinute && currentMinute <= untilMinute : currentMinute >= fromMinute || currentMinute <= untilMinute;
  const outsideAllowedHours = parentLimits.timeRestrictionEnabled && !withinAllowedHours;
  const requiresApproval = exceedsDaily || exceedsMonthly || total > parentLimits.approvalAbove || outsideAllowedHours;
  const slot = deliverySlots.find((item) => item.id === selectedSlot);

  const handlePlaceOrder = () => {
    if (!slot?.available) return toast.error('Choose an available same-day delivery window.');
    if (categoriesBlocked.length) return toast.error(`Parent has restricted: ${categoriesBlocked.join(', ')}.`);
    if (insufficientWallet) return toast.error('Insufficient demo wallet balance. Ask the parent to add funds.');
    const orderId = `CK-${Date.now().toString().slice(-8)}`;
    const pickupCode = String(Math.floor(100000 + Math.random() * 900000));
    const orderItems = [...cart];
    addOrder({
      id: orderId,
      items: orderItems,
      total,
      status: requiresApproval ? 'pending-approval' : 'placed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: slot.time,
      deliverySlot: slot.time,
      studentName: student.fullName,
      studentId: student.studentId,
      city: selectedCampus,
      institution: selectedInstitution,
      hostel: selectedHostel,
      paymentMethod: 'wallet',
      paymentStatus: requiresApproval ? 'pending' : 'paid',
      pickupCode,
      note: note.trim(),
    });
    setConfirmedOrder({ id: orderId, slot: slot.time, total, approval: requiresApproval });
    clearCart();
    toast.success(requiresApproval ? 'Approval request sent to the parent demo portal.' : 'Order placed successfully.');
  };

  if (confirmedOrder) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-16"><Card className="mx-auto max-w-xl p-8 text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Shield className="h-8 w-8 text-primary" /></div><Badge variant={confirmedOrder.approval ? 'secondary' : 'verified'}>{confirmedOrder.approval ? 'Parent approval requested' : 'Order confirmed'}</Badge><h1 className="mt-3 font-display text-3xl font-bold">{confirmedOrder.approval ? 'A quick parent check' : 'Your order is in!'}</h1><p className="mt-2 text-muted-foreground">{confirmedOrder.approval ? 'The parent portal can approve or decline this order. Wallet funds are not deducted until approval.' : 'Your order has been recorded in the CampusKart demo and is ready for fulfilment processing.'}</p><div className="mt-6 rounded-xl bg-muted/60 p-4 text-left"><div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Order ID</span><strong>{confirmedOrder.id}</strong></div><div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Delivery window</span><strong>{confirmedOrder.slot}</strong></div><div className="mt-2 flex justify-between border-t border-border pt-3"><strong>Total</strong><strong className="font-display text-xl">{money(confirmedOrder.total)}</strong></div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link to="/orders" className="flex-1"><Button className="w-full">Track order</Button></Link><Link to="/demo" className="flex-1"><Button variant="outline" className="w-full">Explore other portals</Button></Link></div><p className="mt-5 text-xs text-muted-foreground">Interactive demo only · No real payment, order dispatch or identity check.</p></Card></div></div>;

  if (cart.length === 0) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-16"><div className="mx-auto max-w-md text-center"><div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted"><ShoppingCart className="h-12 w-12 text-muted-foreground" /></div><h1 className="mb-3 font-display text-2xl font-bold">Your cart is empty</h1><p className="mb-8 text-muted-foreground">Add some campus essentials to get started.</p><Link to="/products"><Button variant="hero" size="lg">Browse products</Button></Link></div></div></div>;

  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto max-w-6xl px-4 py-8"><div className="mb-8 flex items-center justify-between"><div><h1 className="font-display text-3xl font-bold">Your cart</h1><p className="text-muted-foreground">{cart.reduce((sum, item) => sum + item.quantity, 0)} units · Review before checkout</p></div><Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart}><Trash2 className="mr-2 h-4 w-4" /> Clear cart</Button></div>
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]"><div className="space-y-3">{cart.map((item, index) => <motion.div key={item.product.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}><Card className="p-4"><div className="flex gap-4"><img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-xl bg-muted object-contain p-2" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{item.product.name}</h3><p className="text-sm text-muted-foreground">{item.product.unit} · {item.product.category}</p></div><Button variant="ghost" size="icon-sm" onClick={() => removeFromCart(item.product.id)} aria-label={`Remove ${item.product.name}`}><Trash2 className="h-4 w-4" /></Button></div><div className="mt-3 flex items-center justify-between"><strong className="font-display text-lg">{money(item.product.price * item.quantity)}</strong><div className="flex items-center gap-2 rounded-lg bg-muted p-1"><Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button><span className="min-w-5 text-center text-sm font-semibold">{item.quantity}</span><Button variant="ghost" size="icon-sm" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button></div></div></div></div></Card></motion.div>)}
      <Card className="p-5"><div className="mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><h3 className="font-semibold">Campus delivery location</h3></div><p className="font-medium">{selectedInstitution}</p><p className="text-sm text-muted-foreground">{selectedHostel}, {selectedCampus}</p><p className="mt-2 text-xs text-muted-foreground">Change your demo campus profile from the Demo Center.</p><Link to="/demo" className="mt-2 inline-block text-sm font-medium text-primary">Edit campus details →</Link></Card>
    </div>
    <aside className="space-y-4"><Card className="p-5"><div className="mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold">Same-day delivery window</h3></div><div className="grid grid-cols-2 gap-2">{deliverySlots.map((item) => <button key={item.id} type="button" aria-pressed={selectedSlot === item.id} onClick={() => setSelectedSlot(item.id)} className={`rounded-xl border px-3 py-3 text-left text-sm transition ${selectedSlot === item.id ? 'border-primary bg-primary/10 ring-2 ring-primary/10' : 'border-border bg-muted/50 hover:border-primary/40'}`}><span className="block font-medium">{item.time}</span>{selectedSlot === item.id && <span className="mt-1 block text-xs font-semibold text-primary">Selected</span>}</button>)}</div></Card>
      <Card className="p-5"><h3 className="mb-3 font-display font-semibold">Parent spending check</h3><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Wallet available</span><strong>{money(walletBalance)}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Today after order</span><strong>{money(spentToday + total)} / {money(parentLimits.daily)}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Month after order</span><strong>{money(spentThisMonth + total)} / {money(parentLimits.monthly)}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Allowed purchase hours</span><strong>{parentLimits.timeRestrictionEnabled ? `${parentLimits.allowedFrom}–${parentLimits.allowedUntil}` : 'Any time'}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Approval threshold</span><strong>{money(parentLimits.approvalAbove)}</strong></div></div>
        {categoriesBlocked.length > 0 && <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3"><p className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertCircle className="h-4 w-4" /> Restricted categories</p><p className="mt-1 text-xs text-muted-foreground">{categoriesBlocked.join(', ')}. Remove these items or ask the parent to enable the category.</p></div>}
        {insufficientWallet && <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:bg-amber-950/20"><p className="font-semibold">Insufficient wallet balance</p><p className="mt-1 text-xs text-muted-foreground">The parent can add demo funds from the Parent Portal.</p><Link to="/parent" className="mt-2 inline-block text-sm font-semibold text-primary">Open Parent Portal →</Link></div>}
        {requiresApproval && !categoriesBlocked.length && !insufficientWallet && <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:bg-amber-950/20"><p className="flex items-center gap-2 font-semibold"><AlertCircle className="h-4 w-4 text-amber-600" /> Parent approval required</p><p className="mt-1 text-xs text-muted-foreground">{outsideAllowedHours ? 'This order is outside the parent-approved purchase hours.' : 'This order exceeds a configured spending limit or approval threshold.'} The wallet will only be debited after parent approval.</p></div>}
      </Card>
      <Card className="p-5"><h3 className="mb-4 font-display font-semibold">Order summary</h3><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(total)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Campus delivery</span><span className="font-medium text-primary">Included</span></div><div className="flex justify-between border-t border-border pt-3 text-base"><strong>Total</strong><strong className="font-display text-xl">{money(total)}</strong></div></div><label className="mt-4 block text-sm font-medium">Delivery note (optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={140} placeholder="Landmark, instructions for campus pickup..." className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" /></label><div className="mt-4 rounded-xl bg-muted/60 p-3"><div className="flex items-center gap-2 text-sm font-medium"><Wallet className="h-4 w-4 text-primary" /> CampusKart wallet</div><p className="mt-1 text-xs text-muted-foreground">Demo wallet balance: {money(walletBalance)} · No real payment is processed.</p></div><Button variant="hero" size="lg" className="mt-5 w-full" disabled={categoriesBlocked.length > 0 || insufficientWallet || !selectedSlot} onClick={handlePlaceOrder}>{requiresApproval ? 'Request parent approval' : 'Place demo order'} <ArrowRight className="h-4 w-4" /></Button><p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0" />Same-day slot is a prototype selection. Fulfilment is simulated by the Operations Console.</p></Card>
    </aside></div></main></div>;
}
