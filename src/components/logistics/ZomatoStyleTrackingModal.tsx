import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  Package,
  Truck,
  X,
  Share2,
  Navigation,
  KeyRound,
  ExternalLink,
  Send,
  Sparkles,
  Leaf
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useStore, inr, type Order } from '@/lib/store';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ZomatoStyleTrackingModal({ order, isOpen, onClose }: Props) {
  const { updateOrderStatus } = useStore();
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'rider'; text: string; time: string }>>([
    { sender: 'rider', text: 'Namaste! I have picked up your order from Central Depot. On my way to Hostel Block B.', time: '12:42 PM' }
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!order) return null;

  const handleCallRider = () => {
    toast.info('Connecting to Campus Delivery Partner...', {
      description: 'Dialing Ramesh Kumar (+91 98480 22334) via campus masked line.'
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMsg = {
      sender: 'user' as const,
      text: chatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'rider',
          text: 'Got it! Arriving at Hostel Block B lobby in about 3 minutes. Please keep your OTP ready.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      toast.success('Ramesh replied: "Got it! Arriving shortly."');
    }, 1500);
  };

  const isDelivered = order.status === 'collected';
  const isOutForDelivery = order.status === 'on-the-way';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-background">
        {/* Top Header Card */}
        <div className="relative p-5 pb-4 bg-gradient-to-br from-primary/15 via-primary/5 to-background border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px] font-bold">
                  {order.id}
                </Badge>
                <span className="text-xs text-muted-foreground">· {order.hostel || 'Hostel Block B'}</span>
              </div>
              <h2 className="font-display text-2xl font-extrabold tracking-tight">
                {isDelivered ? 'Order Delivered!' : isOutForDelivery ? 'Out for Delivery 🛵' : 'Preparing Order 🍲'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isDelivered
                  ? 'Delivered safely at Hostel B Smart Locker Station.'
                  : `Estimated delivery in ${etaMinutes} mins · EV Shuttle #04`}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>{isDelivered ? 'COMPLETED' : `${etaMinutes} MINS`}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Live GPS Stream</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Zomato-Style Animated Live Route Map Strip */}
          <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/30 aspect-[16/7] min-h-[180px] shadow-inner">
            <svg viewBox="0 0 600 240" className="w-full h-full select-none">
              <defs>
                <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Map background grid */}
              <rect width="600" height="240" fill="hsl(var(--muted) / 0.2)" />
              <path d="M 0,60 L 600,60 M 0,120 L 600,120 M 0,180 L 600,180" stroke="hsl(var(--border) / 0.5)" strokeWidth="0.5" />
              <path d="M 100,0 L 100,240 M 250,0 L 250,240 M 400,0 L 400,240 M 550,0 L 550,240" stroke="hsl(var(--border) / 0.5)" strokeWidth="0.5" />

              {/* Campus Roads */}
              <path
                d="M 60,180 L 180,140 L 320,150 L 440,90 L 530,120"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 60,180 L 180,140 L 320,150 L 440,90 L 530,120"
                fill="none"
                stroke="url(#trackGrad)"
                strokeWidth="5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="animate-pulse"
              />

              {/* Start Depot Node */}
              <circle cx="60" cy="180" r="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
              <text x="60" y="206" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="9" fontWeight="bold">Central Depot</text>

              {/* Destination Hostel Node */}
              <circle cx="530" cy="120" r="12" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
              <text x="530" y="148" textAnchor="middle" fill="hsl(var(--primary))" fontSize="9" fontWeight="bold">Hostel Block B</text>

              {/* Animated Rider Cart Node */}
              <g transform="translate(370, 125)">
                <circle r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                <circle r="14" fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />
                <foreignObject x="-7" y="-7" width="14" height="14">
                  <Truck className="w-3.5 h-3.5 text-primary-foreground" />
                </foreignObject>
                <g transform="translate(0, -22)">
                  <rect x="-40" y="-10" width="80" height="15" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
                  <text x="0" y="1" textAnchor="middle" fill="hsl(var(--primary))" fontSize="8" fontWeight="bold">
                    Ramesh (0.4 km away)
                  </text>
                </g>
              </g>
            </svg>

            {/* Float badge over map */}
            <div className="absolute bottom-2.5 left-3 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-card/90 backdrop-blur-md border border-border text-[11px] font-semibold shadow-sm">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero-Emission EV Campus Cart · Speed: 18 km/h</span>
            </div>
          </div>

          {/* Delivery Partner Zomato-Style Card */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-primary/20 flex items-center justify-center font-display font-bold text-primary text-base">
                  RK
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm">Ramesh Kumar</h4>
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold py-0">
                    4.95 ⭐ (1,240+ trips)
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Campus EV Shuttle #04 · Masked Campus Line
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Fully Vaccinated
                  </span>
                  <span>·</span>
                  <span>Temp: 36.4°C Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallRider}
                className="flex-1 sm:flex-initial h-9 text-xs font-semibold rounded-xl"
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                Call Partner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChatOpen(!chatOpen)}
                className="flex-1 sm:flex-initial h-9 text-xs font-semibold rounded-xl"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Message {chatMessages.length > 1 && `(${chatMessages.length})`}
              </Button>
            </div>
          </div>

          {/* Interactive Chat Drawer / Popover */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl border border-primary/20 bg-muted/20 space-y-3"
              >
                <div className="flex items-center justify-between text-xs border-b border-border pb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" /> Chat with Ramesh Kumar
                  </span>
                  <span className="text-muted-foreground text-[10px]">Instant Campus Messaging</span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto text-xs pr-1">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-2.5 rounded-xl max-w-[85%] ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-card border border-border text-foreground'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message (e.g., 'Leave at locker')"
                    className="h-8 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-8 text-xs font-semibold">
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prominent 6-Digit OTP Handshake Card (Zomato Style) */}
          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4" /> Share OTP with delivery partner upon arrival
            </p>
            <div className="font-mono text-3xl font-extrabold tracking-[0.25em] text-foreground">
              {order.pickupCode || '334190'}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Required for contactless locker unlock and delivery verification. Do not share until partner is at your block.
            </p>
          </div>

          {/* Zomato-Style Delivery Milestone Timeline */}
          <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
            <h4 className="font-display font-bold text-sm">Delivery Milestones</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Order Confirmed</span>
                    <span className="text-muted-foreground text-[11px]">12:35 PM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Paid via CampusKart Student Wallet ({inr(order.total)})</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Packed at Central Depot</span>
                    <span className="text-muted-foreground text-[11px]">12:40 PM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Sealed in climate-insulated pouch</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-0.5 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-primary">On the way to Hostel Block B</span>
                    <span className="text-primary font-bold text-[11px]">In Transit</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Ramesh Kumar is riding along North Campus Boulevard</p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-bold">Arrive at Hostel B Locker</span>
                    <span className="text-muted-foreground text-[11px]">Est. 12:48 PM</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Compartment C-04 will release automatically upon OTP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Summary */}
          <div className="p-4 rounded-2xl border border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border pb-2">
              <span>Order Items ({order.items.length})</span>
              <span className="font-mono">{inr(order.total)}</span>
            </div>
            <div className="space-y-2 text-xs">
              {order.items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {item.product.name} × <span className="font-semibold text-foreground">{item.quantity}</span>
                  </span>
                  <span className="font-mono font-medium">{inr(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ZomatoStyleTrackingModal;
