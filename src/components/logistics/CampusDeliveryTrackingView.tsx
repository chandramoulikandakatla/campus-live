import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  KeyRound,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Copy,
  Check,
  ShieldCheck,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore, inr, type Order, type OrderStatus } from '@/lib/store';
import { CampusDeliveryMap } from './CampusDeliveryMap';

interface Props {
  order: Order;
  isModal?: boolean;
}

export function CampusDeliveryTrackingView({ order, isModal = false }: Props) {
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyOtp = () => {
    if (!order.pickupCode) return;
    navigator.clipboard.writeText(order.pickupCode);
    setCopiedOtp(true);
    toast.success('Pickup OTP copied to clipboard');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleCallCourier = () => {
    toast.info('Calling Campus Courier...', {
      description: 'Dialing Ramesh Kumar (+91 98480 22334) via campus masked exchange.'
    });
  };

  const isDelivered = order.status === 'collected';
  const isEnRoute = order.status === 'on-the-way';
  const isPacked = order.status === 'packed';
  const isPending = order.status === 'placed' || order.status === 'pending-approval';

  const milestones: Array<{ key: OrderStatus; title: string; subtitle: string; time: string }> = [
    {
      key: 'placed',
      title: 'Order Confirmed',
      subtitle: `Paid via Student Wallet (${inr(order.total)})`,
      time: '12:35 PM'
    },
    {
      key: 'packed',
      title: 'Packed at Central Depot',
      subtitle: 'Sealed in insulated climate compartment',
      time: '12:40 PM'
    },
    {
      key: 'on-the-way',
      title: 'In Transit on Boulevard',
      subtitle: 'EV Shuttle #04 en route to Hostel Block B',
      time: '12:43 PM'
    },
    {
      key: 'collected',
      title: 'Delivered to Hostel Locker',
      subtitle: 'Smart Locker Station #04 Compartment C-04',
      time: 'Est. 12:48 PM'
    }
  ];

  const currentStepIndex =
    order.status === 'collected'
      ? 3
      : order.status === 'on-the-way'
      ? 2
      : order.status === 'packed'
      ? 1
      : 0;

  return (
    <div className="space-y-6">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border">
              {order.id}
            </span>
            <span className="text-xs text-muted-foreground">· {order.hostel || 'Hostel Block B'}</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {isDelivered
              ? 'Delivered to Locker Station'
              : isEnRoute
              ? 'Out for Campus Delivery'
              : isPacked
              ? 'Order Packed & Ready'
              : 'Preparing at Depot'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isDelivered
              ? 'Order verified and securely deposited into smart locker compartment.'
              : `Estimated arrival in ${etaMinutes} minutes · North Campus Boulevard`}
          </p>
        </div>

        <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 border-t sm:border-t-0 border-border pt-3 sm:pt-0">
          <div className="flex items-center gap-2">
            {!isDelivered && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
            <span className="font-mono text-xs font-bold text-foreground">
              {isDelivered ? 'COMPLETED' : `ETA: ~${etaMinutes} MINS`}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            EV Shuttle #04
          </span>
        </div>
      </div>

      {/* Campus Vector Map Visual */}
      <CampusDeliveryMap
        status={order.status}
        hostel={order.hostel}
        etaMinutes={etaMinutes}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Courier Details & OTP Handshake Pass */}
        <div className="space-y-5">
          {/* Prominent Handshake OTP Card */}
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-primary" /> Delivery Verification PIN
              </span>
              <button
                onClick={handleCopyOtp}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                title="Copy PIN"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-center p-3 rounded-xl bg-background border border-border">
              <span className="font-mono text-3xl font-extrabold tracking-[0.3em] text-foreground">
                {order.pickupCode || '334190'}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Share this 6-digit PIN with the campus courier upon arrival, or enter it at the <strong>Hostel Block B Smart Locker</strong> terminal to release the door solenoid.
            </p>
          </div>

          {/* Courier Card */}
          <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-sm text-foreground">
                RK
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-sm text-foreground">Ramesh Kumar</h4>
                  <span className="text-[11px] text-muted-foreground">· 4.9 ★</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Campus Logistics Associate #CL-04
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  EV Shuttle #04 · 1,240+ deliveries
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCallCourier}
              className="h-9 px-3 text-xs font-semibold rounded-xl"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Call
            </Button>
          </div>

          {/* Order Summary Dropdown/Card */}
          <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold border-b border-border pb-2">
              <span>Order Items ({order.items.length})</span>
              <span className="font-mono">{inr(order.total)}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-muted-foreground">
                  <span className="truncate pr-2">
                    {item.product.name} × <strong className="text-foreground">{item.quantity}</strong>
                  </span>
                  <span className="font-mono shrink-0">{inr(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clean Milestone Stepper Timeline */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">
              Fulfilment Milestones
            </h4>

            <div className="space-y-5 text-xs">
              {milestones.map((m, index) => {
                const isPassed = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;

                return (
                  <div key={m.key} className="flex items-start gap-3 relative">
                    {/* Vertical connecting line */}
                    {index < milestones.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-5 w-0.5 h-8 -ml-px ${
                          currentStepIndex > index ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border z-10 transition-colors ${
                        isCurrent
                          ? 'border-primary bg-primary text-primary-foreground font-bold shadow-sm'
                          : isPassed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border bg-muted text-muted-foreground'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-[11px]">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-semibold ${
                            isCurrent
                              ? 'text-primary'
                              : isPassed
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {m.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {m.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {m.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Presentation Demo Switcher */}
          <div className="pt-4 border-t border-border mt-4">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
              <span className="font-medium">Presentation Demo Controls</span>
              <span>Active: {order.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'placed');
                  toast.info('Simulated state: Order Placed');
                }}
                className={`py-1.5 px-1 rounded-lg border font-medium transition-colors ${
                  order.status === 'placed'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                Placed
              </button>
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'packed');
                  toast.info('Simulated state: Order Packed at Depot');
                }}
                className={`py-1.5 px-1 rounded-lg border font-medium transition-colors ${
                  order.status === 'packed'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                Packed
              </button>
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'on-the-way');
                  toast.info('Simulated state: EV Shuttle in Transit');
                }}
                className={`py-1.5 px-1 rounded-lg border font-medium transition-colors ${
                  order.status === 'on-the-way'
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                Transit
              </button>
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(order.id, 'collected');
                  toast.success('Simulated state: Delivered & Collected');
                }}
                className={`py-1.5 px-1 rounded-lg border font-medium transition-colors ${
                  order.status === 'collected'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                Delivered
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampusDeliveryTrackingView;
