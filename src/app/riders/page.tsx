'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Network, MapPin, Navigation, Bike, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  { id: 'BLR', name: 'Bangalore', x: 280, y: 380 },
  { id: 'MUM', name: 'Mumbai', x: 120, y: 280 },
  { id: 'DEL', name: 'Delhi', x: 180, y: 120 },
  { id: 'MAA', name: 'Chennai', x: 300, y: 400 },
  { id: 'HYD', name: 'Hyderabad', x: 220, y: 320 },
  { id: 'PUN', name: 'Pune', x: 140, y: 300 },
  { id: 'KOL', name: 'Kolkata', x: 420, y: 240 },
  { id: 'AHM', name: 'Ahmedabad', x: 100, y: 240 }
];

export default function RiderMeshPage() {
  const [riders, setRiders] = useState(Array.from({ length: 8 }).map((_, i) => ({
    id: `RIDER-${100 + i}`,
    status: i % 3 === 0 ? 'ON_DELIVERY' : i % 2 === 0 ? 'IDLE' : 'PICKING',
    x: CITIES[i].x,
    y: CITIES[i].y,
    efficiency: 85 + Math.random() * 10
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setRiders(prev => prev.map(r => ({
        ...r,
        x: r.x + (Math.random() - 0.5) * 10,
        y: r.y + (Math.random() - 0.5) * 10,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-extrabold uppercase tracking-[0.3em]">Rider Mesh Network</h1>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Active Fleet: 08 Nodes // Status: 100% Stream</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Total Deliveries</span>
              <div className="font-mono text-xl font-bold glow-text-primary">1,284</div>
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Avg Efficiency</span>
              <div className="font-mono text-xl font-bold text-secondary glow-text-secondary">94.2%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SVG Map Container */}
          <div className="lg:col-span-3 tactical-panel bg-black/40 h-[600px] before:hidden border border-white/5 relative overflow-hidden">
             {/* Map Grid Overlay */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
             
             <svg className="w-full h-full p-12">
               {/* City Nodes */}
               {CITIES.map(city => (
                 <g key={city.id}>
                   <circle cx={city.x} cy={city.y} r="3" className="fill-primary animate-pulse" />
                   <text x={city.x + 10} y={city.y + 5} className="fill-white/40 font-mono text-[8px] uppercase tracking-widest">
                     {city.name}
                   </text>
                 </g>
               ))}

               {/* Connections */}
               <path 
                 d="M 180 120 L 120 280 L 140 300 L 220 320 L 280 380 L 300 400" 
                 className="stroke-primary/10 fill-none" 
                 strokeWidth="1" 
                 strokeDasharray="4 4" 
               />

               {/* Riders */}
               {riders.map((rider, i) => (
                 <g key={rider.id} style={{ transition: 'all 2s linear' }}>
                   <circle 
                     cx={rider.x} 
                     cy={rider.y} 
                     r="12" 
                     className={cn(
                       "fill-none stroke-2",
                       rider.status === 'ON_DELIVERY' ? 'stroke-secondary' : rider.status === 'IDLE' ? 'stroke-accent' : 'stroke-primary'
                     )} 
                   />
                   <circle 
                     cx={rider.x} 
                     cy={rider.y} 
                     r="4" 
                     className={cn(
                       rider.status === 'ON_DELIVERY' ? 'fill-secondary' : rider.status === 'IDLE' ? 'fill-accent' : 'fill-primary'
                     )} 
                   />
                 </g>
               ))}
             </svg>

             {/* Legend */}
             <div className="absolute bottom-8 left-8 flex gap-6 bg-black/60 p-4 border border-white/5 backdrop-blur-md">
                <LegendItem color="bg-secondary" label="ON_DELIVERY" />
                <LegendItem color="bg-accent" label="IDLE" />
                <LegendItem color="bg-primary" label="PICKING" />
             </div>
          </div>

          {/* Rider List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            <h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-white/5 pb-2">Active Node Efficiency</h3>
            {riders.map((rider) => (
              <div key={rider.id} className="tactical-panel p-4 before:hidden border border-white/5 group hover:border-primary/40 transition-all cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Bike className="w-3 h-3 text-primary" />
                    <span className="font-mono text-xs font-bold">{rider.id}</span>
                  </div>
                  <span className={cn(
                    "font-mono text-[8px] px-1.5 py-0.5 rounded-sm font-bold",
                    rider.status === 'ON_DELIVERY' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                  )}>{rider.status}</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                     <span className="font-mono text-[9px] text-muted-foreground uppercase">Efficiency Score</span>
                     <div className="font-mono text-lg font-bold glow-text-secondary">{rider.efficiency.toFixed(1)}%</div>
                   </div>
                   <div className="w-16 h-8 bg-white/5 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-secondary/40" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full animate-pulse", color)} />
      <span className="font-mono text-[9px] text-white/60 tracking-widest">{label}</span>
    </div>
  );
}
