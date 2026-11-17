import React from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Zap, Thermometer, ShieldCheck } from 'lucide-react';
import type { OrderStatus } from '@/lib/store';

interface CampusDeliveryMapProps {
  status: OrderStatus | string;
  hostel?: string;
  etaMinutes?: number;
  courierName?: string;
  shuttleId?: string;
  className?: string;
}

export function CampusDeliveryMap({
  status,
  hostel = 'Hostel Block B',
  etaMinutes = 4,
  courierName = 'Ramesh Kumar',
  shuttleId = 'EV-04',
  className = ''
}: CampusDeliveryMapProps) {
  const isCollected = status === 'collected';
  const isEnRoute = status === 'on-the-way';
  const isPacked = status === 'packed';

  // Rider position based on order progress:
  // Packed: (90, 75) at Depot
  // On the way: (320, 160) along North Boulevard
  // Collected: (510, 250) at Hostel Lockers
  const riderPos = isCollected
    ? { x: 510, y: 250 }
    : isEnRoute
    ? { x: 320, y: 160 }
    : { x: 90, y: 75 };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 select-none shadow-sm ${className}`}
      style={{ aspectRatio: '16 / 9', minHeight: '260px' }}
    >
      <svg
        viewBox="0 0 600 340"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="campusGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#27272a" strokeWidth="0.5" strokeOpacity="0.6" />
          </pattern>

          {/* Route Gradient */}
          <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
          </linearGradient>

          {/* Radial radar ring */}
          <radialGradient id="radarPing" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Blueprint background grid */}
        <rect width="600" height="340" fill="#09090b" />
        <rect width="600" height="340" fill="url(#campusGrid)" />

        {/* Campus Quadrangle Lawn (Soft architectural ground) */}
        <polygon
          points="200,90 410,70 450,210 240,230"
          fill="#064e3b"
          fillOpacity="0.12"
          stroke="#059669"
          strokeWidth="0.75"
          strokeOpacity="0.25"
        />
        <text x="320" y="145" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="600" fillOpacity="0.4" letterSpacing="2">
          CENTRAL CAMPUS QUAD
        </text>

        {/* Campus Building Footprints */}
        {/* Central Depot */}
        <rect x="40" y="40" width="100" height="65" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
        <text x="90" y="68" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Central Depot</text>
        <text x="90" y="82" textAnchor="middle" fill="#71717a" fontSize="7.5" letterSpacing="0.5">COLD CHAIN & KIOSK HUB</text>

        {/* Academic Block A & B */}
        <rect x="50" y="160" width="110" height="75" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="105" y="195" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontWeight="600">Academic Wing</text>
        <text x="105" y="208" textAnchor="middle" fill="#52525b" fontSize="7.5">BLOCKS A & B</text>

        {/* Central Library & Knowledge Park */}
        <rect x="440" y="45" width="120" height="60" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="500" y="73" textAnchor="middle" fill="#a1a1aa" fontSize="9.5" fontWeight="600">University Library</text>
        <text x="500" y="86" textAnchor="middle" fill="#52525b" fontSize="7.5">INNOVATION COMMONS</text>

        {/* Student Dining Pavilion */}
        <rect x="250" y="260" width="110" height="50" rx="6" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="305" y="288" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="600">Dining Pavilion</text>

        {/* Destination: Hostel Block B Smart Locker Hub */}
        <rect x="450" y="210" width="120" height="75" rx="6" fill="#18181b" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.7" />
        <text x="510" y="238" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">{hostel}</text>
        <text x="510" y="252" textAnchor="middle" fill="#a1a1aa" fontSize="8" letterSpacing="0.5">SMART LOCKER STATION #04</text>
        <text x="510" y="267" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="600">6-DIGIT OTP SOLENOID</text>

        {/* Campus Roadway - North Campus Boulevard */}
        {/* Road Background Base */}
        <path
          d="M 90,75 L 180,75 C 240,75 260,110 280,140 L 340,180 C 380,210 420,250 510,250"
          fill="none"
          stroke="#27272a"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Road Inner Asphalt */}
        <path
          d="M 90,75 L 180,75 C 240,75 260,110 280,140 L 340,180 C 380,210 420,250 510,250"
          fill="none"
          stroke="#141416"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Road Center Dash */}
        <path
          d="M 90,75 L 180,75 C 240,75 260,110 280,140 L 340,180 C 380,210 420,250 510,250"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeLinecap="round"
        />

        {/* Active Route Transit Line */}
        <path
          d="M 90,75 L 180,75 C 240,75 260,110 280,140 L 340,180 C 380,210 420,250 510,250"
          fill="none"
          stroke="url(#routeGlow)"
          strokeWidth="3.5"
          strokeDasharray={isEnRoute ? "8 6" : "none"}
          strokeLinecap="round"
          className={isEnRoute ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
        />

        {/* Origin Pin (Depot) */}
        <circle cx="90" cy="75" r="5" fill="#3b82f6" stroke="#09090b" strokeWidth="2" />

        {/* Destination Pin (Hostel) */}
        <circle cx="510" cy="250" r="6" fill="#10b981" stroke="#09090b" strokeWidth="2" />
        <circle cx="510" cy="250" r="14" fill="none" stroke="#10b981" strokeWidth="1" strokeOpacity="0.4" />

        {/* Animated Rider Cart Node */}
        <g transform={`translate(${riderPos.x}, ${riderPos.y})`}>
          {isEnRoute && (
            <>
              {/* Outer Radar Ping */}
              <circle r="22" fill="url(#radarPing)" className="animate-ping" opacity="0.4" />
              <circle r="15" fill="none" stroke="#6366f1" strokeWidth="1.2" opacity="0.8" />
            </>
          )}

          {/* Core Vehicle Disc */}
          <circle r="12" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.8" />
          <foreignObject x="-6" y="-6" width="12" height="12">
            <Truck className="w-3 h-3 text-white" />
          </foreignObject>

          {/* Vehicle Floating Tag */}
          <g transform="translate(0, -22)">
            <rect
              x="-48"
              y="-10"
              width="96"
              height="16"
              rx="4"
              fill="#18181b"
              stroke="#4f46e5"
              strokeWidth="1"
            />
            <text x="0" y="1" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="700">
              {isCollected ? 'Delivered' : isEnRoute ? `${shuttleId} · ~${etaMinutes}m` : 'At Depot'}
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Modern Telematics Glass HUD */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-[11px] text-zinc-300 font-mono shadow-md">
        <span className="flex items-center gap-1 font-semibold text-emerald-400">
          <Zap className="w-3 h-3" /> Zero-Emission EV
        </span>
        <span className="text-zinc-600">|</span>
        <span>18 km/h</span>
        <span className="text-zinc-600">|</span>
        <span className="flex items-center gap-1">
          <Thermometer className="w-3 h-3 text-sky-400" /> 4.2°C Cargo
        </span>
      </div>

      {/* Campus GPS Coordinates Watermark */}
      <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-zinc-500 tracking-wider">
        GPS: 17°23'44"N 78°28'12"E · PILOT TRANSIT
      </div>
    </div>
  );
}

export default CampusDeliveryMap;
