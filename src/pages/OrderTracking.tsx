import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore, inr } from '@/lib/store';
import { ZomatoStyleTrackingModal } from '@/components/logistics/ZomatoStyleTrackingModal';
import { ArrowLeft, Navigation, Truck, Phone, MessageSquare, KeyRound, ShieldCheck } from 'lucide-react';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId?: string }>();
  const orders = useStore((s) => s.orders);

  // Find target order or default to the most active/relevant order
  const order =
    orders.find((o) => o.id === orderId) ||
    orders.find((o) => o.status === 'on-the-way') ||
    orders.find((o) => o.status === 'packed') ||
    orders[0];

  const [modalOpen, setModalOpen] = useState(true);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto max-w-4xl px-4 py-12 text-center">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="font-display text-2xl font-bold">No Active Order to Track</h2>
          <p className="mt-2 text-sm text-muted-foreground">Place an order or view your existing orders to track delivery in real time.</p>
          <Link to="/orders" className="mt-4 inline-block">
            <Button>View Orders</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs font-semibold">
            <Navigation className="w-3.5 h-3.5 mr-1" /> Re-open Live Tracking Overlay
          </Button>
        </div>

        <ZomatoStyleTrackingModal
          order={order}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />

        {/* Fallback Inline View when modal is minimized */}
        {!modalOpen && (
          <Card className="p-6 border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                  Order ID: {order.id}
                </Badge>
                <h2 className="font-display text-xl font-bold mt-1">Live Campus Delivery Tracker</h2>
              </div>
              <Button onClick={() => setModalOpen(true)}>Open Tracking View</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ramesh Kumar is delivering your order to {order.hostel || 'Hostel Block B'}. Share OTP <strong className="text-foreground">{order.pickupCode}</strong> on arrival.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
