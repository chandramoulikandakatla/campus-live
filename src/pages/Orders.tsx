import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle2, Truck, UserCheck, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Order, useStore } from '@/lib/store';

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [
      { product: { id: 'f1', name: 'Fresh Bananas', price: 40, image: '/placeholder.svg', category: 'Fruits & Fresh', availability: 'in-stock', tags: ['healthy'], unit: '6 pcs' }, quantity: 2 },
      { product: { id: 'b1', name: 'Mineral Water', price: 20, image: '/placeholder.svg', category: 'Beverages', availability: 'in-stock', tags: [], unit: '1L' }, quantity: 3 },
    ],
    total: 140,
    status: 'on-the-way',
    createdAt: new Date(),
    estimatedDelivery: 'Same-day slot: 12:00 - 12:30 PM',
  },
  {
    id: 'ORD-002',
    items: [
      { product: { id: 's1', name: 'Protein Bar', price: 45, image: '/placeholder.svg', category: 'Snacks', availability: 'in-stock', tags: ['healthy'], unit: '1 pc' }, quantity: 4 },
    ],
    total: 180,
    status: 'collected',
    createdAt: new Date(Date.now() - 86400000),
    estimatedDelivery: 'Delivered',
  },
  {
    id: 'ORD-003',
    items: [
      { product: { id: 'h1', name: 'Hand Sanitizer', price: 50, image: '/placeholder.svg', category: 'Hygiene', availability: 'in-stock', tags: [], unit: '100ml' }, quantity: 1 },
      { product: { id: 'c1', name: 'Fresh Coconut Water', price: 45, image: '/placeholder.svg', category: 'Coconut Water', availability: 'in-stock', tags: ['healthy'], unit: '300ml' }, quantity: 2 },
    ],
    total: 140,
    status: 'packed',
    createdAt: new Date(Date.now() - 3600000),
    estimatedDelivery: 'Same-day slot: 03:00 - 03:30 PM',
  },
];

const statusConfig = {
  placed: { icon: Package, label: 'Order Placed', color: 'text-muted-foreground' },
  packed: { icon: Package, label: 'Packed', color: 'text-warning' },
  'on-the-way': { icon: Truck, label: 'On the Way', color: 'text-info' },
  collected: { icon: CheckCircle2, label: 'Collected', color: 'text-primary' },
};

const statusSteps = ['placed', 'packed', 'on-the-way', 'collected'] as const;

export default function Orders() {
  const storedOrders = useStore((state) => state.orders);
  const allOrders = [...storedOrders, ...mockOrders];
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = allOrders.find((order) => order.id === selectedOrderId) ?? allOrders[0] ?? null;

  const getStepIndex = (status: Order['status']) => statusSteps.indexOf(status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Your Orders
            </h1>
            <p className="text-muted-foreground mt-1">Explore sample order tracking in this interactive prototype</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order List */}
            <div className="space-y-4">
              {allOrders.map((order, index) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant="interactive"
                      className={`p-4 ${selectedOrder?.id === order.id ? 'border-primary/30 bg-primary/5' : ''}`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            order.status === 'collected' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig[order.status].color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-semibold text-foreground">
                                {order.id}
                              </span>
                              <Badge
                                variant={order.status === 'collected' ? 'in-stock' : 'limited'}
                                className="text-[10px]"
                              >
                                {statusConfig[order.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ₹{order.total}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <motion.div
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6 sticky top-24">
                  {/* Status Timeline */}
                  <div className="mb-8">
                    <h3 className="font-display font-semibold text-lg mb-6">Order Status</h3>
                    <div className="relative">
                      {statusSteps.map((step, index) => {
                        const isCompleted = getStepIndex(selectedOrder.status) >= index;
                        const isCurrent = getStepIndex(selectedOrder.status) === index;
                        const StepIcon = statusConfig[step].icon;

                        return (
                          <div key={step} className="flex items-start gap-4 relative">
                            {/* Connector Line */}
                            {index < statusSteps.length - 1 && (
                              <div
                                className={`absolute left-5 top-10 w-0.5 h-12 ${
                                  getStepIndex(selectedOrder.status) > index
                                    ? 'bg-primary'
                                    : 'bg-border'
                                }`}
                              />
                            )}

                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                isCompleted
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="pb-8">
                              <p
                                className={`font-medium ${
                                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {statusConfig[step].label}
                              </p>
                              {isCurrent && selectedOrder.status !== 'collected' && (
                                <Badge variant="time" className="mt-2">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {selectedOrder.estimatedDelivery}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-display font-semibold mb-4">Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              x{item.quantity} • ₹{item.product.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <span className="font-display font-semibold">Total</span>
                    <span className="font-display text-xl font-bold text-foreground">
                      ₹{selectedOrder.total}
                    </span>
                  </div>

                  {/* Face Verification Note */}
                  {selectedOrder.status === 'on-the-way' && (
                    <div className="mt-6 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                      <div className="flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-secondary mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            Face verification required
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Show your face at the pickup point for secure collection
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
