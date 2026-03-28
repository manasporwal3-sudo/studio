'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORES } from "@/lib/mock-data";
import { Zap, Activity, AlertTriangle, TrendingUp, Cpu, Server } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  // Initialize with fixed values for hydration stability
  const [healthData, setHealthData] = useState(STORES.map(s => ({ ...s, health: 90 })));
  const [actions, setActions] = useState<{ id: number, msg: string, time: number, type: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    // Randomize health data after mount
    setHealthData(STORES.map(s => ({ ...s, health: 85 + Math.random() * 10 })));

    const interval = setInterval(() => {
      setHealthData(prev => prev.map(s => ({
        ...s,
        health: Math.max(20, Math.min(100, s.health + (Math.random() - 0.5) * 5))
      })));
    }, 3000);

    const actionInterval = setInterval(() => {
      const newAction = {
        id: Date.now(),
        msg: `SOVEREIGN AUTO-HEAL: Threshold met for Node ${STORES[Math.floor(Math.random() * STORES.length)].id}. Restoring stock parity.`,
        time: 7,
        type: Math.random() > 0.5 ? 'CRITICAL' : 'OPTIMIZATION'
      };
      setActions(prev => [newAction, ...prev].slice(0, 4));
    }, 7000);

    return () => {
      clearInterval(interval);
      clearInterval(actionInterval);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 md:space-y-12">
        {/* Hub Health Matrix */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em]">Hub Health Matrix</h3>
            </div>
            <div className="px-3 py-1 border border-primary/20 bg-primary/5 font-mono text-[9px] md:text-[10px] text-primary w-fit">
              PROTOCOL: SOVEREIGN APEX v9.0
            </div>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
            {healthData.map((store) => (
              <HealthArc key={store.id} value={Math.round(store.health)} label={store.name} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Action Stream */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Cpu className="w-5 h-5 text-secondary" />
                <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em]">Action Stream</h3>
              </div>
              <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground animate-pulse">7.0S CYCLE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {actions.map((action) => (
                <div key={action.id} className="tactical-panel p-4 md:p-6 group hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "font-mono text-[8px] md:text-[9px] px-2 py-0.5 border font-bold tracking-widest",
                      action.type === 'CRITICAL' ? "border-destructive text-destructive bg-destructive/10" : "border-primary text-primary bg-primary/10"
                    )}>{action.type}</span>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-mono text-xs md:text-sm mb-4 leading-relaxed">{action.msg}</p>
                  <div className="flex items-center justify-between mt-4 md:mt-6">
                    <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-3 md:w-4 h-1 bg-primary/20" />)}
                    </div>
                    <span className="font-mono text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest">Conf: 99.1%</span>
                  </div>
                </div>
              ))}
              {actions.length === 0 && (
                <div className="col-span-1 sm:col-span-2 py-16 md:py-20 border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
                  <Activity className="w-6 h-6 md:w-8 h-8 text-white/10 animate-pulse" />
                  <p className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">Initializing Stream...</p>
                </div>
              )}
            </div>
          </div>

          {/* Self-Healing Panel */}
          <Card className="tactical-panel border-none bg-black/40 h-fit">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-xs md:text-sm font-headline font-bold flex items-center gap-3">
                <Zap className="w-4 h-4 text-secondary animate-pulse" />
                SELF-HEALING LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
              {healthData.filter(s => s.health < 90).map(store => (
                <div key={store.id} className="p-3 md:p-4 bg-white/5 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1">
                    <AlertTriangle className="w-3 h-3 text-accent animate-bounce" />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-[10px] md:text-xs font-bold text-primary">{store.id}</span>
                    <span className="font-mono text-[8px] md:text-[10px] text-accent">HEALTH: {Math.round(store.health)}%</span>
                  </div>
                  <div className="text-[9px] md:text-[10px] font-mono text-muted-foreground mb-3 uppercase">Restock Triggered...</div>
                  <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-secondary animate-[loading_2s_infinite]" style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
              {healthData.every(s => s.health >= 90) && (
                <div className="text-center py-8 md:py-10">
                  <div className="text-secondary font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">Neural Parity Achieved</div>
                  <div className="text-[8px] md:text-[9px] text-muted-foreground font-mono uppercase">System Optimal</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}