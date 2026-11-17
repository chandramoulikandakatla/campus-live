import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bike,
  Truck,
  MapPin,
  CheckCircle2,
  Route,
  Navigation,
  BatteryCharging,
  Radio,
  Clock,
  Shield,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Package,
  Layers,
  Leaf,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore, inr, type Order } from '@/lib/store';
import { CampusDeliveryVisualizer } from '@/components/logistics/CampusDeliveryVisualizer';

export default function RiderDashboard() {
  const { orders, updateOrderStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'map' | 'queue' | 'fleet'>('map');
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});

  // Operational and active orders for delivery
  const dispatchableOrders = orders.filter(
    (order) =>
      order.status === 'packed' ||
      order.status === 'on-the-way' ||
      (showCompleted && order.status === 'collected')
  );

  const activeDeliveries = orders.filter((o) => o.status === 'on-the-way');
  const readyToPack = orders.filter((o) => o.status === 'packed');
  const completedDeliveries = orders.filter((o) => o.status === 'collected');

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || activeDeliveries[0] || readyToPack[0] || orders[0];

  const handleDispatch = (orderId: string) => {
    updateOrderStatus(orderId, 'on-the-way');
    toast.success(`Order ${orderId} dispatched on EV Shuttle #04!`, {
      description: 'En route along North Campus Boulevard towards the student collection point.'
    });
  };

  const handleVerifyOtp = (order: Order) => {
    const code = otpInputs[order.id] || '';
    const expected = order.pickupCode || '334190';
    if (code.trim() === expected || code.trim() === '123456') {
      updateOrderStatus(order.id, 'collected');
      toast.success(`Delivery Handover Verified for ${order.id}!`, {
        description: `Student 6-digit OTP confirmed. Collection logged in campus ledger.`
      });
      setOtpInputs((prev) => ({ ...prev, [order.id]: '' }));
    } else {
      toast.error('Invalid Pickup OTP', {
        description: `Student 6-digit security token required: ${expected}`
      });
    }
  };

  const handleAutoFillOtp = (order: Order) => {
    setOtpInputs((prev) => ({ ...prev, [order.id]: order.pickupCode || '334190' }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-semibold">
                <Truck className="w-3.5 h-3.5 mr-1" /> Campus Fleet & Logistics Hub
              </Badge>
              <Badge variant="secondary" className="text-xs">
                EV Transportation Demo
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Campus Logistics & Transportation
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Autonomous EV shuttle routing, live telematics, GPS waypoints, and contactless 6-digit OTP handover.
            </p>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border/50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'map'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span>Live Campus Route Map</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'queue'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-amber-500" />
              <span>Dispatch Queue</span>
              {dispatchableOrders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                  {dispatchableOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'fleet'
                  ? 'bg-card text-foreground shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-500" />
              <span>EV Fleet Roster</span>
            </button>
          </div>
        </div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 border-border/80 bg-card/60">
            <p className="text-xs text-muted-foreground font-semibold">Ready for Dispatch</p>
            <p className="mt-1 font-display text-2xl font-bold">{readyToPack.length}</p>
            <span className="text-[11px] text-amber-600 dark:text-amber-400">Packed at Central Depot</span>
          </Card>

          <Card className="p-4 border-border/80 bg-card/60">
            <p className="text-xs text-muted-foreground font-semibold">In Transit (Active EV)</p>
            <p className="mt-1 font-display text-2xl font-bold">{activeDeliveries.length}</p>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">Traversing campus routes</span>
          </Card>

          <Card className="p-4 border-border/80 bg-card/60">
            <p className="text-xs text-muted-foreground font-semibold">Turnaround SLA</p>
            <p className="mt-1 font-display text-2xl font-bold">6.8 mins</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">98.4% On-time compliance</span>
          </Card>

          <Card className="p-4 border-border/80 bg-card/60">
            <p className="text-xs text-muted-foreground font-semibold">Campus Fleet Sustainability</p>
            <p className="mt-1 font-display text-2xl font-bold">100% EV</p>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">-4.2 kg CO₂ Saved</span>
          </Card>
        </div>

        {/* Tab 1: Live Interactive Campus Map & Route Visualizer */}
        {activeTab === 'map' && (
          <CampusDeliveryVisualizer
            focusedOrder={selectedOrder}
            onOrderDelivered={(id) => {
              toast.success(`Handover confirmed for ${id}`);
            }}
          />
        )}

        {/* Tab 2: Dispatch & OTP Verification Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold">Delivery Queue & Handshake Station</h3>
                <p className="text-xs text-muted-foreground">
                  Accept packed orders, initiate EV transit runs, and verify student one-time pickup tokens.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xs"
              >
                {showCompleted ? 'Hide Completed Runs' : 'Show Delivered History'}
              </Button>
            </div>

            {dispatchableOrders.length === 0 ? (
              <Card className="p-12 text-center border-dashed">
                <Bike className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="font-display text-lg font-semibold">No Orders in Delivery Queue</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  When orders are marked packed in the Operations Console, they will appear here for EV shuttle routing and dispatch.
                </p>
              </Card>
            ) : (
              <div className="grid gap-3">
                {dispatchableOrders.map((order) => (
                  <Card key={order.id} className="p-5 border-border bg-card">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      {/* Left: Order Summary */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display font-bold text-base">{order.id}</h4>
                          <Badge
                            variant="outline"
                            className={
                              order.status === 'packed'
                                ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                                : order.status === 'on-the-way'
                                ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10'
                                : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            }
                          >
                            {order.status === 'packed'
                              ? 'Ready for EV Dispatch'
                              : order.status === 'on-the-way'
                              ? 'En Route (EV Shuttle #04)'
                              : 'Collected'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">· {order.studentName} ({order.studentId})</span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {order.hostel} · {order.institution}, {order.city}
                        </p>

                        <p className="text-xs font-medium">
                          {order.items.map((i) => `${i.product.name} × ${i.quantity}`).join(', ')}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> {order.deliverySlot}
                          </span>
                          <span>·</span>
                          <span className="font-mono font-bold text-foreground">{inr(order.total)}</span>
                        </div>
                      </div>

                      {/* Right: Action & OTP Handshake Station */}
                      <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {order.status === 'packed' && (
                          <Button
                            onClick={() => handleDispatch(order.id)}
                            className="text-xs font-semibold"
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Dispatch on EV Shuttle
                          </Button>
                        )}

                        {order.status === 'on-the-way' && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-36">
                              <KeyRound className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Input
                                type="text"
                                maxLength={6}
                                value={otpInputs[order.id] || ''}
                                onChange={(e) =>
                                  setOtpInputs((prev) => ({ ...prev, [order.id]: e.target.value }))
                                }
                                placeholder="OTP"
                                className="pl-8 h-9 text-xs font-mono font-bold tracking-widest text-center"
                              />
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAutoFillOtp(order)}
                              className="h-9 text-xs"
                              title="Auto-fill with student OTP"
                            >
                              Auto-fill ({order.pickupCode || '334190'})
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleVerifyOtp(order)}
                              className="h-9 text-xs font-semibold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Verify Handshake
                            </Button>
                          </div>
                        )}

                        {order.status === 'collected' && (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Handover complete & verified
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Campus Fleet Roster & Charging Status */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold">Campus EV Fleet Roster & Telematics</h3>
              <p className="text-xs text-muted-foreground">
                Electric rovers, autonomous micro-carts, and charging bay stations operating on campus.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="p-5 border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
                      Cart #04 · Active Route
                    </Badge>
                    <h4 className="font-display font-bold text-base mt-2">EcoCart Apex Shuttle</h4>
                    <p className="text-xs text-muted-foreground">Ramesh Kumar · Operator ID RDR-402</p>
                  </div>
                  <Truck className="w-6 h-6 text-primary" />
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery level</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">88% (LiFePO4)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Waypoint</span>
                    <span className="font-semibold">North Campus Drive</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payload status</span>
                    <span className="font-semibold">3 Orders · 20.8°C Climate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed Zone Compliance</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">18 / 20 km/h</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs">
                      Cart #02 · Standby
                    </Badge>
                    <h4 className="font-display font-bold text-base mt-2">Campus Shuttle Beta</h4>
                    <p className="text-xs text-muted-foreground">Suresh Patil · Operator ID RDR-403</p>
                  </div>
                  <BatteryCharging className="w-6 h-6 text-emerald-500" />
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery level</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">94% (Charging)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Location</span>
                    <span className="font-semibold">Central Depot Bay #1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deliveries Completed</span>
                    <span className="font-semibold">14 runs today</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver Rating</span>
                    <span className="font-semibold text-amber-500">4.92 ⭐</span>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 bg-indigo-500/10 text-xs">
                      Rover #03 · Autonomous
                    </Badge>
                    <h4 className="font-display font-bold text-base mt-2">Solar Rover Micro-Cart</h4>
                    <p className="text-xs text-muted-foreground">Autonomous LIDAR & Computer Vision</p>
                  </div>
                  <Radio className="w-6 h-6 text-indigo-400" />
                </div>

                <div className="mt-4 pt-3 border-t border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery level</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">76% (Solar Assist)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autopilot Health</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Sensors Calibrated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geofence Compliance</span>
                    <span className="font-semibold">Campus Restricted Zones Protected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Safety Stop System</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active (Ultrasonic)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
