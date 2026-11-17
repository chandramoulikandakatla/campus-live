import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { CampusDeliveryTrackingView } from '@/components/logistics/CampusDeliveryTrackingView';
import { ArrowLeft, Truck, Package } from 'lucide-react';

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId?: string }>();
  const orders = useStore((s) => s.orders);

  // Find target order or default to the most active/relevant order
  const order =
    orders.find((o) => o.id === orderId) ||
    orders.find((o) => o.status === 'on-the-way') ||
    orders.find((o) => o.status === 'packed') ||
    orders[0];

  if (!order) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-bold">No Active Order Found</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Place an order from the campus shop or view your previous orders to track real-time fulfillment.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/orders">
              <Button variant="outline">View All Orders</Button>
            </Link>
            <Link to="/shop">
              <Button>Browse Shop</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8 pb-24 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Status: <strong className="text-foreground capitalize">{order.status.replace('-', ' ')}</strong></span>
            <span>·</span>
            <Link to={`/orders`} className="text-primary hover:underline">
              Receipt PDF
            </Link>
          </div>
        </div>

        {/* Embedded Full-Page Live Campus Tracking View */}
        <CampusDeliveryTrackingView order={order} />
      </main>
    </div>
  );
}
