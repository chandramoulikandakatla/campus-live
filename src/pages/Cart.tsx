import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Clock, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useStore } from '@/lib/store';

const deliverySlots = [
  { id: '1', time: '10:00 - 10:30 AM', available: true },
  { id: '2', time: '12:00 - 12:30 PM', available: true },
  { id: '3', time: '03:00 - 03:30 PM', available: true },
  { id: '4', time: '06:00 - 06:30 PM', available: false },
];

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, parentLimits, addOrder } = useStore();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: string; slot: string; total: number } | null>(null);
  const total = getCartTotal();

  const handlePlaceOrder = () => {
    if (!selectedSlot) {
      toast.error('Please select a delivery slot to continue.');
      return;
    }
    if (isOverLimit) {
      toast.error('This order exceeds the daily spending limit.');
      return;
    }
    const slot = deliverySlots.find((item) => item.id === selectedSlot);
    if (!slot || !slot.available) {
      toast.error('That delivery slot is no longer available. Please choose another.');
      return;
    }

    const orderId = `CK-${Date.now().toString().slice(-8)}`;
    const orderItems = [...cart];
    addOrder({
      id: orderId,
      items: orderItems,
      total,
      status: 'placed',
      createdAt: new Date(),
      estimatedDelivery: slot.time,
      deliverySlot: slot.time,
    });
    setConfirmedOrder({ id: orderId, slot: slot.time, total });
    clearCart();
    toast.success('Your order has been placed.');
  };
  const isOverLimit = total > parentLimits.daily;

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Order confirmed</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Thank you!</h1>
            <p className="mt-2 text-muted-foreground">Your CampusKart order has been recorded in this prototype.</p>
            <div className="mt-6 rounded-xl bg-muted/60 p-4 text-left">
              <div className="flex justify-between gap-4 py-2 text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-semibold">{confirmedOrder.id}</span>
              </div>
              <div className="flex justify-between gap-4 py-2 text-sm">
                <span className="text-muted-foreground">Delivery slot</span>
                <span className="font-semibold">{confirmedOrder.slot}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3 mt-2">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold">₹{confirmedOrder.total}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/orders" className="flex-1">
                <Button variant="hero" className="w-full">View orders</Button>
              </Link>
              <Link to="/products" className="flex-1">
                <Button variant="outline" className="w-full">Continue shopping</Button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Demo confirmation only · No real payment was processed.</p>
          </Card>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center"
            >
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </motion.div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Add some essentials to get started
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Your Cart
              </h1>
              <p className="text-muted-foreground">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-semibold text-foreground line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{item.product.unit}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="font-display font-bold text-lg text-foreground">
                            ₹{item.product.price * item.quantity}
                          </div>
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="h-7 w-7"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-display font-semibold text-sm min-w-[24px] text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-7 w-7"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              {/* Parent Limit Warning */}
              {isOverLimit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 border-destructive/30 bg-destructive/5">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Over daily limit</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your order exceeds the daily limit of ₹{parentLimits.daily}. Remove some items to proceed.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Delivery Slot */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold">Delivery Slot</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {deliverySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      aria-pressed={selectedSlot === slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`min-h-14 px-3 py-2 rounded-xl text-sm font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        !slot.available
                          ? 'bg-muted/50 text-muted-foreground/60 border-transparent cursor-not-allowed'
                          : selectedSlot === slot.id
                            ? 'bg-primary/10 text-foreground border-primary ring-2 ring-primary/15'
                            : 'bg-muted text-foreground border-transparent hover:bg-primary/5 hover:border-primary/40 cursor-pointer'
                      }`}
                    >
                      <span className="block">{slot.time}</span>
                      {selectedSlot === slot.id && (
                        <span className="mt-1 block text-[11px] font-semibold text-primary">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Summary Card */}
              <Card className="p-4">
                <h3 className="font-display font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-primary">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Daily limit</span>
                    <span>₹{parentLimits.daily}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span className="font-display font-semibold">Total</span>
                      <span className="font-display text-xl font-bold text-foreground">₹{total}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isOverLimit || !selectedSlot}
                  onClick={handlePlaceOrder}
                >
                  Place Order
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {!selectedSlot && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Select a delivery slot to enable checkout.
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Parent-approved spending</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
