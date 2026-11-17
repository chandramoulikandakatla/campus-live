import React from 'react';
import { Utensils, Coffee, Droplets, Box, BookOpen, Sparkles, LucideIcon } from 'lucide-react';

interface ProductArtworkProps {
  category: string;
  id: string;
  className?: string;
}

interface CategoryConfig {
  grad: string;
  border: string;
  accent: string;
  icon: LucideIcon;
}

export function ProductArtwork({ category, id, className = 'w-full h-36' }: ProductArtworkProps) {
  const configs: Record<string, CategoryConfig> = {
    'Food and Snacks': {
      grad: 'from-orange-500/30 via-amber-500/20 to-rose-500/30',
      border: 'border-orange-500/30',
      accent: '#f97316',
      icon: Utensils
    },
    'Beverages': {
      grad: 'from-cyan-500/30 via-sky-500/20 to-blue-600/30',
      border: 'border-cyan-500/30',
      accent: '#06b6d4',
      icon: Coffee
    },
    'Personal Care': {
      grad: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/30',
      border: 'border-emerald-500/30',
      accent: '#10b981',
      icon: Droplets
    },
    'Daily Essentials': {
      grad: 'from-indigo-500/30 via-purple-500/20 to-pink-500/30',
      border: 'border-indigo-500/30',
      accent: '#6366f1',
      icon: Box
    },
    'Academic Supplies': {
      grad: 'from-violet-500/30 via-fuchsia-500/20 to-indigo-500/30',
      border: 'border-violet-500/30',
      accent: '#8b5cf6',
      icon: BookOpen
    },
    'Other Services': {
      grad: 'from-amber-500/30 via-yellow-500/20 to-orange-500/30',
      border: 'border-amber-500/30',
      accent: '#eab308',
      icon: Sparkles
    }
  };

  const cfg = configs[category] || configs['Daily Essentials'];
  const IconComp = cfg.icon;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${cfg.grad} border ${cfg.border} flex items-center justify-center ${className}`}>
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl opacity-40" style={{ background: cfg.accent }} />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full blur-xl opacity-30" style={{ background: cfg.accent }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-xl">
          <IconComp className="w-8 h-8 text-white" style={{ color: cfg.accent }} />
        </div>
        <span className="mt-2 text-[10px] font-mono uppercase tracking-widest text-white/60 bg-black/30 px-2 py-0.5 rounded-full">
          {id}
        </span>
      </div>
    </div>
  );
}
