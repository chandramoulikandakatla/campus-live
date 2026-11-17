import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Navigation,
  BatteryCharging,
  Zap,
  Gauge,
  MapPin,
  CheckCircle2,
  Shield,
  Play,
  Pause,
  RotateCcw,
  Radio,
  KeyRound,
  Box,
  Leaf,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useStore, inr, type Order } from '@/lib/store';

// Campus Waypoints (SVG coordinates on a 800x420 viewBox)
export interface Waypoint {
  id: string;
  name: string;
  shortName: string;
  type: 'depot' | 'academic' | 'library' | 'sports' | 'hostel' | 'locker';
  x: number;
  y: number;
  description: string;
}

export const CAMPUS_WAYPOINTS: Waypoint[] = [
  {
    id: 'wp-depot',
    name: 'Central Distribution Depot (Kiosk Hub)',
    shortName: 'Central Depot',
    type: 'depot',
    x: 90,
    y: 330,
    description: 'Order fulfillment & cold-storage bagging center'
  },
  {
    id: 'wp-academic',
    name: 'Academic Quad & Science Blocks',
    shortName: 'Academic Quad',
    type: 'academic',
    x: 270,
    y: 220,
    description: 'Lecture Hall Complex & Dispensary #2'
  },
  {
    id: 'wp-library',
    name: 'Central University Library & Study Plaza',
    shortName: 'Central Library',
    type: 'library',
    x: 470,
    y: 130,
    description: 'Quiet Zone & Reading Garden'
  },
  {
    id: 'wp-sports',
    name: 'Cafeteria & Sports Complex',
    shortName: 'Student Hub',
    type: 'sports',
    x: 640,
    y: 210,
    description: 'Campus Dining Plaza & Indoor Arena'
  },
  {
    id: 'wp-hostel-a',
    name: 'Boys Hostel Block A (Ground Kiosk #1)',
    shortName: 'Hostel Block A',
    type: 'hostel',
    x: 370,
    y: 360,
    description: 'Hostel Wing A Common Room Smart Kiosk'
  },
  {
    id: 'wp-hostel-b',
    name: 'Girls Hostel Block B & Smart Locker #08',
    shortName: 'Hostel Block B',
    type: 'locker',
    x: 720,
    y: 350,
    description: 'Electronic Pin-Coded Contactless Delivery Locker'
  }
];

// Delivery Route Path along waypoints
const ROUTE_POINTS = [
  { x: 90, y: 330, label: 'Central Depot', wpId: 'wp-depot' },
  { x: 170, y: 280, label: 'North Boulevard Entrance' },
  { x: 270, y: 220, label: 'Academic Quad', wpId: 'wp-academic' },
  { x: 370, y: 170, label: 'Science Plaza' },
  { x: 470, y: 130, label: 'Central Library', wpId: 'wp-library' },
  { x: 560, y: 160, label: 'East Walkway' },
  { x: 640, y: 210, label: 'Student Cafeteria Hub', wpId: 'wp-sports' },
  { x: 690, y: 280, label: 'Hostel Boulevard' },
  { x: 720, y: 350, label: 'Hostel Block B Locker Station', wpId: 'wp-hostel-b' }
];

interface Props {
  focusedOrder?: Order | null;
  onOrderDelivered?: (orderId: string) => void;
}

export function CampusDeliveryVisualizer({ focusedOrder, onOrderDelivered }: Props) {
  const { orders, updateOrderStatus } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // 0 to 100%
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isLockerUnlocked, setIsLockerUnlocked] = useState(false);

  // Active delivery order to showcase
  const activeOrder = focusedOrder || orders.find((o) => o.status === 'on-the-way') || orders.find((o) => o.status === 'packed') || orders[0];

  // Calculate cart coordinates based on progress (0 - 100%)
  const totalSegments = ROUTE_POINTS.length - 1;
  const currentSegment = Math.min(Math.floor((progress / 100) * totalSegments), totalSegments - 1);
  const segmentRatio = ((progress / 100) * totalSegments) - currentSegment;

  const p1 = ROUTE_POINTS[currentSegment] || ROUTE_POINTS[0];
  const p2 = ROUTE_POINTS[currentSegment + 1] || ROUTE_POINTS[totalSegments];

  const cartX = p1.x + (p2.x - p1.x) * segmentRatio;
  const cartY = p1.y + (p2.y - p1.y) * segmentRatio;

  // Real-time animation loop
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const step = () => {
        setProgress((prev) => {
          const next = prev + (0.25 * simSpeed);
          if (next >= 100) {
            setIsPlaying(false);
            toast.success('EV Shuttle #04 arrived at Hostel Block B Smart Locker Station!', {
              description: 'Ready for student 6-digit OTP verification and locker unlocking.'
            });
            return 100;
          }
          return next;
        });
        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, simSpeed]);

  // Update active step based on progress
  useEffect(() => {
    if (progress < 15) setActiveStepIndex(0); // Picked at Depot
    else if (progress < 45) setActiveStepIndex(1); // En Route Main Boulevard
    else if (progress < 75) setActiveStepIndex(2); // Passing Academic Quad
    else if (progress < 100) setActiveStepIndex(3); // Approaching Hostel
    else setActiveStepIndex(4); // Arrived at Locker Station
  }, [progress]);

  const handleVerifyOtp = () => {
    if (!activeOrder) return;
    const expectedOtp = activeOrder.pickupCode || '334190';
    if (enteredOtp.trim() === expectedOtp || enteredOtp.trim() === '123456') {
      setIsLockerUnlocked(true);
      updateOrderStatus(activeOrder.id, 'collected');
      toast.success(`OTP Handshake Verified for ${activeOrder.id}!`, {
        description: `Locker Compartment #08 automatically unlocked. Handover logged in ledger.`
      });
      if (onOrderDelivered) onOrderDelivered(activeOrder.id);
    } else {
      toast.error('Invalid Pickup OTP', {
        description: `Expected 6-digit security token: ${expectedOtp}`
      });
    }
  };

  const handleAutoFillOtp = () => {
    if (activeOrder) {
      setEnteredOtp(activeOrder.pickupCode || '334190');
    }
  };

  const restartSimulation = () => {
    setProgress(0);
    setIsPlaying(true);
    setIsLockerUnlocked(false);
    toast.info('Starting EV Shuttle Campus Delivery Run', {
      description: 'Cart #04 dispatched from Central Depot towards Hostel Block B.'
    });
  };

  const STEPS = [
    { title: 'Depot Bagging', desc: 'Loaded & sealed at Central Hub' },
    { title: 'Campus Boulevard', desc: 'Traversing North Campus drive' },
    { title: 'Academic Plaza', desc: 'Waypoint cleared (Speed: 18 km/h)' },
    { title: 'Hostel Approach', desc: 'Approaching Block B perimeter' },
    { title: 'Locker Release', desc: '6-digit OTP Handshake complete' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Vehicle Telematics Card */}
      <Card className="p-5 border-border/80 bg-gradient-to-r from-card to-card/60 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold">Campus EV Shuttle #04 (EcoCart Apex)</h3>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[11px] font-semibold">
                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> Live Telematics
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Operator: <span className="font-semibold text-foreground">Ramesh Kumar (ID: RDR-402)</span> · Rating: <span className="text-amber-500">4.95 ⭐</span> · Electric Rover
              </p>
            </div>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto text-xs">
            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Gauge className="w-3.5 h-3.5 text-primary" /> Speed
              </div>
              <p className="font-display text-sm font-bold mt-1">18 km/h</p>
              <span className="text-[10px] text-muted-foreground">Zone limit: 20 km/h</span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" /> Battery
              </div>
              <p className="font-display text-sm font-bold mt-1">88% LiFePO4</p>
              <span className="text-[10px] text-muted-foreground">~44 km range</span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Box className="w-3.5 h-3.5 text-blue-500" /> Cargo Bay
              </div>
              <p className="font-display text-sm font-bold mt-1">20.8°C Climate</p>
              <span className="text-[10px] text-muted-foreground">3 Orders secure</span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30">
              <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase font-bold">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Green Impact
              </div>
              <p className="font-display text-sm font-bold mt-1">-4.2 kg CO₂</p>
              <span className="text-[10px] text-muted-foreground">Zero Emission</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Interactive Campus Map */}
      <Card className="p-5 border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h4 className="font-display font-bold text-base">Campus Transit Map & GPS Waypoint Navigation</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live coordinate tracking: Lat 17.4485° N, Long 78.3758° E · Real-time telemetry feed
            </p>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isPlaying ? "destructive" : "default"}
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 text-xs font-semibold"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
              {isPlaying ? 'Pause Run' : 'Start Simulation'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={restartSimulation}
              className="h-8 text-xs"
              title="Restart delivery from Central Depot"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>

            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[11px]">
              {([1, 2, 5] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-bold transition-colors ${
                    simSpeed === spd ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Interactive Campus Map Container */}
        <div className="relative w-full rounded-2xl bg-muted/20 border border-border/60 overflow-hidden shadow-inner aspect-[16/8] min-h-[300px]">
          <svg viewBox="0 0 800 420" className="w-full h-full select-none">
            {/* Campus Map Ground & Terrain */}
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
              </linearGradient>
              <pattern id="campusGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/40" />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="800" height="420" fill="url(#campusGrid)" />

            {/* Campus Greenery Zones */}
            <path d="M 30,30 Q 150,20 220,100 T 100,240 Z" fill="hsl(142 71% 45% / 0.08)" />
            <path d="M 520,40 Q 680,20 760,110 T 680,220 Z" fill="hsl(142 71% 45% / 0.08)" />
            <path d="M 280,310 Q 400,270 500,340 T 420,410 Z" fill="hsl(142 71% 45% / 0.08)" />

            {/* Campus Road Network */}
            <path
              d="M 90,330 L 170,280 L 270,220 L 370,170 L 470,130 L 560,160 L 640,210 L 690,280 L 720,350"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            />
            {/* Secondary Cross Roads */}
            <path
              d="M 270,220 L 370,360 L 640,210"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40"
            />

            {/* Active Delivery Route Trail */}
            <path
              d="M 90,330 L 170,280 L 270,220 L 370,170 L 470,130 L 560,160 L 640,210 L 690,280 L 720,350"
              fill="none"
              stroke="url(#roadGrad)"
              strokeWidth="6"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />

            {/* Waypoint Nodes & Labels */}
            {CAMPUS_WAYPOINTS.map((wp) => {
              const isDest = wp.id === 'wp-hostel-b';
              const isStart = wp.id === 'wp-depot';

              return (
                <g key={wp.id} className="cursor-pointer group">
                  {/* Waypoint Halo */}
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={isDest ? 14 : 10}
                    fill={isDest ? 'hsl(var(--primary) / 0.2)' : isStart ? 'hsl(var(--secondary) / 0.3)' : 'hsl(var(--muted))'}
                    stroke={isDest ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r={isDest ? 6 : 4}
                    fill={isDest ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'}
                  />

                  {/* Node Label Card */}
                  <g transform={`translate(${wp.x}, ${wp.y - 18})`}>
                    <rect
                      x="-55"
                      y="-16"
                      width="110"
                      height="20"
                      rx="6"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="-3"
                      textAnchor="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui"
                    >
                      {wp.shortName}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Animated EV Shuttle Rover Cart */}
            <g transform={`translate(${cartX}, ${cartY})`}>
              {/* Radar pulse ring */}
              <circle
                r="22"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                opacity="0.6"
                className="animate-ping"
              />
              {/* Outer Cart Ring */}
              <circle
                r="16"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth="2"
                className="shadow-md"
              />
              {/* Shuttle Icon */}
              <foreignObject x="-9" y="-9" width="18" height="18">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </foreignObject>

              {/* Real-time cart label */}
              <g transform="translate(0, 24)">
                <rect
                  x="-45"
                  y="-12"
                  width="90"
                  height="16"
                  rx="4"
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--primary))"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="hsl(var(--primary))"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="system-ui"
                >
                  EV CART #04 ({Math.round(progress)}%)
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Waypoint Stepper Strip */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {STEPS.map((step, idx) => {
            const isCompleted = activeStepIndex > idx;
            const isCurrent = activeStepIndex === idx;

            return (
              <div
                key={step.title}
                className={`p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-primary/60 bg-primary/10 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-muted-foreground'
                    : 'border-border/40 bg-muted/20 opacity-70'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/30 text-foreground'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  )}
                  <span className={`truncate ${isCurrent ? 'text-primary' : ''}`}>{step.title}</span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Handshake Verification Station (Interactive Demo for Order) */}
      {activeOrder && (
        <Card className="p-5 border-border bg-card">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                  Order ID: {activeOrder.id}
                </Badge>
                <span className="text-xs font-semibold">{activeOrder.studentName} · {activeOrder.hostel}</span>
              </div>
              <h4 className="font-display font-bold text-base">Contactless 6-Digit OTP / QR Handshake</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When the EV shuttle arrives at the collection point, entering the student's one-time 6-digit security token verifies the student in person and unlocks the electronic locker.
              </p>
            </div>

            {/* Verification Form */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-48">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="pl-9 h-9 text-center font-mono font-bold tracking-widest text-sm"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoFillOtp}
                className="h-9 text-xs shrink-0"
                title="Fill with the active order's student OTP for demo speed"
              >
                Auto-fill ({activeOrder.pickupCode || '334190'})
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleVerifyOtp}
                disabled={isLockerUnlocked || activeOrder.status === 'collected'}
                className="h-9 text-xs font-semibold shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {isLockerUnlocked || activeOrder.status === 'collected' ? 'Verified & Delivered' : 'Verify Handover'}
              </Button>
            </div>
          </div>

          {/* Electronic Locker Door Status Preview */}
          {isLockerUnlocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-border flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs"
            >
              <div className="flex items-center gap-2 font-semibold">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Smart Locker Station #08 Door Unlocked: Compartment C-04 Ready for Retrieval</span>
              </div>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold">
                Handshake Recorded
              </Badge>
            </motion.div>
          )}
        </Card>
      )}
    </div>
  );
}

export default CampusDeliveryVisualizer;
