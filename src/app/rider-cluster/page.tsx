'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Map, Navigation, Activity, Terminal, ShieldCheck, ShieldAlert } from "lucide-react";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { cn } from "@/lib/utils";

export default function RiderClusterPage() {
  const { profit, deliveries, efficiency, isIncentiveUnlocked, isLoading } = useDashboardMetrics();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Terminal className="w-6 h-6 text-primary" />
              <h1 className="font-headline text-3xl font-black uppercase tracking-tighter italic text-white">Field Agent OS</h1>
            </div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Mission-Critical Rider Interface // Node Telemetry v10.5</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-2 border flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest",
              isIncentiveUnlocked ? "bg-secondary/10 border-secondary text-secondary" : "bg-white/5 border-white/10 text-muted-foreground"
            )}>
              {isIncentiveUnlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {isIncentiveUnlocked ? "INCENTIVE PROTOCOL: ACTIVE" : "INCENTIVE PROTOCOL: LOCKED"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Dynamic Route Pilot */}
          <div className="tactical-panel bg-black/40 before:hidden p-8 border border-white/5 flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-secondary" />
                <div className="flex flex-col">
                  <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Route Pilot v4</h3>
                  <span className="font-mono text-[8px] text-muted-foreground uppercase">AI Navigation Guidance</span>
                </div>
              </div>
              <Activity className="w-4 h-4 text-secondary animate-pulse" />
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 border-l-2 border-secondary">
                <span className="font-mono text-[9px] text-muted-foreground uppercase block mb-1">Current Waypoint</span>
                <div className="font-mono text-sm font-bold">128 Koramangala 4th Block, BLR</div>
              </div>
              <div className="flex items-center gap-4 px-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  <div className="w-px h-8 bg-white/10" />
                  <div className="w-2 h-2 border border-white/40 rounded-full" />
                </div>
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                      <span>NEXT DROP</span>
                      <span>1.4 KM</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                      <span>TRAFFIC OVERRIDE</span>
                      <span className="text-secondary">AI ENABLED</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-8">
              <UplinkButton label="OK" color="text-secondary" />
              <UplinkButton label="DMGD" color="text-destructive" />
              <UplinkButton label="RET" color="text-accent" />
            </div>
          </div>
        </div>

        {/* Earnings Suite - Real-time Data Mapping */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatProgress 
            label="Realized Profit" 
            value={profit} 
            max={5000} 
            prefix="₹" 
            isLoading={isLoading} 
          />
          <StatProgress 
            label="Node Deliveries" 
            value={deliveries} 
            max={100} 
            isLoading={isLoading} 
          />
          <StatProgress 
            label="Mesh Efficiency" 
            value={efficiency} 
            max={100} 
            suffix="%" 
            isLoading={isLoading} 
          />
          <StatProgress 
            label="Incentive Lock" 
            value={isIncentiveUnlocked ? 100 : Math.min(deliveries * 2, 99)} 
            max={100} 
            suffix="%" 
            color={isIncentiveUnlocked ? "bg-secondary" : "bg-accent"} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatProgress({ label, value, max, prefix = '', suffix = '', color = 'bg-primary', isLoading }: any) {
  return (
    <div className="tactical-panel p-6 before:hidden border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className={cn("font-mono text-lg font-bold", isLoading && "animate-pulse")}>
          {isLoading ? "---" : `${prefix}${value}${suffix}`}
        </div>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", color)} 
          style={{ width: `${Math.min((value/max)*100, 100)}%` }} 
        />
      </div>
    </div>
  );
}

function UplinkButton({ label, color }: { label: string, color: string }) {
  return (
    <button className={cn(
      "p-3 bg-white/5 border border-white/5 font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors",
      color
    )}>
      {label}
    </button>
  );
}
