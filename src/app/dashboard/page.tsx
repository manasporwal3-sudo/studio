
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { useUser } from "@/firebase";
import { Zap, Activity, AlertTriangle, TrendingUp, Cpu, Server, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const HealthArc = ({ value, label }: { value: number, label: string }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value > 80 ? 'stroke-secondary' : value > 50 ? 'stroke-accent' : 'stroke-destructive';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        <svg className="w-full h-full rotate-[-90deg]">
          <circle 
            cx="50%" cy="50%" r={radius} 
            className="fill-none stroke-white/5" strokeWidth="6" 
          />
          <circle 
            cx="50%" cy="50%" r={radius} 
            className={cn("fill-none transition-all duration-1000 ease-out", color)}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="square"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-mono text-sm md:text-lg font-bold glow-text-primary">{value}%</span>
        </div>
      </div>
      <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-center text-muted-foreground line-clamp-1">{label}</span>
    </div>
  );
};

export default function CommandCenter() {
  const { user } = useUser();
  const { inventory, isLoading } = useDarkStoreOS(user?.uid || '');
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState(100);

  const criticalItems = inventory.filter(item => item.status === 'critical');
  const lowItems = inventory.filter(item => item.status === 'low');

  useEffect(() => {
    setMounted(true);
    if (inventory.length > 0) {
      const healthyRatio = (inventory.length - criticalItems.length) / inventory.length;
      setHealth(Math.round(healthyRatio * 100));
    }
  }, [inventory, criticalItems.length]);

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12">
        {criticalItems.length > 0 && (
          <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-sm relative overflow-hidden animate-pulse">
            <div className="flex items-center gap-6">
              <ShieldAlert className="w-10 h-10 text-destructive shrink-0" />
              <div>
                <h2 className="font-headline text-lg font-black text-destructive uppercase tracking-widest">Critical Stock Alert</h2>
                <p className="font-mono text-xs text-muted-foreground uppercase">{criticalItems.length} SKUs are currently depleted. Operational disruption imminent.</p>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
          </div>
        )}

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em]">Hub Health Matrix</h3>
            </div>
            <div className="px-3 py-1 border border-primary/20 bg-primary/5 font-mono text-[9px] md:text-[10px] text-primary w-fit">
              PROTOCOL: SOVEREIGN APEX v10.1
            </div>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            <HealthArc value={health} label="Overall Hub" />
            <HealthArc value={100 - Math.round((lowItems.length / (inventory.length || 1)) * 100)} label="Runway Buffer" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Cpu className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em]">Neural Event Log</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {criticalItems.map((item) => (
                <div key={item.id} className="tactical-panel p-4 md:p-6 group hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[8px] md:text-[9px] px-2 py-0.5 border border-destructive text-destructive bg-destructive/10 font-bold tracking-widest uppercase">Stockout</span>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-mono text-xs md:text-sm mb-4 leading-relaxed">URGENT: SKU {item.name} has hit 0 units. Reorder logic triggered.</p>
                  <div className="flex items-center justify-between mt-4 md:mt-6">
                    <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-3 md:w-4 h-1 bg-destructive/20" />)}
                    </div>
                    <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">Conf: 99.9%</span>
                  </div>
                </div>
              ))}
              {criticalItems.length === 0 && (
                <div className="col-span-1 sm:col-span-2 py-16 md:py-20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
                  <ShieldAlert className="w-6 h-6 md:w-8 h-8 text-secondary opacity-20" />
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">System Optimal. No Active Alerts.</p>
                </div>
              )}
            </div>
          </div>

          <Card className="tactical-panel border-none bg-black/40 h-fit">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xs md:text-sm font-headline font-bold flex items-center gap-3">
                <Zap className="w-4 h-4 text-secondary animate-pulse" />
                NODE METRICS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px] uppercase">
                  <span className="text-muted-foreground">Inventory SKUs</span>
                  <span className="text-white">{inventory.length}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] uppercase">
                  <span className="text-muted-foreground">Total Stock Units</span>
                  <span className="text-primary">{inventory.reduce((acc, i) => acc + i.currentStock, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
