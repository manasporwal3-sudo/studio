'use client';

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Crosshair, Map, Navigation, ShoppingBag, DollarSign, Activity, Package, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function RiderClusterPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<null | {id: string, name: string}>(null);

  const handleScan = () => {
    setIsScanning(true);
    setScannedItem(null);
    setTimeout(() => {
      setIsScanning(false);
      setScannedItem({ id: 'SKU-001', name: 'Organic Milk (1L)' });
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="border-b border-white/5 pb-8">
          <div className="flex items-center gap-4 mb-2">
            <Terminal className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-3xl font-black uppercase tracking-tighter italic text-white">Field Agent OS</h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Mission-Critical Rider Interface // Node Telemetry v10.4</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SKU Scanner Module */}
          <div className="tactical-panel bg-black/40 before:hidden p-8 border border-white/5 h-[400px] flex flex-col justify-between group">
             <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Crosshair className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Optical SKU Scanner</h3>
                    <span className="font-mono text-[8px] text-muted-foreground uppercase">Inventory Verification Engine</span>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-primary/60">V_CORE ACTIVE</div>
             </div>

             <div className="flex-1 relative border border-white/5 bg-black/60 overflow-hidden flex items-center justify-center">
                {isScanning && <div className="scan-line" />}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]" />
                
                {scannedItem ? (
                  <div className="text-center animate-in fade-in zoom-in duration-500">
                    <Package className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <div className="font-mono text-xs text-muted-foreground uppercase mb-1">SKU_IDENTIFIED</div>
                    <div className="font-headline font-extrabold text-xl text-secondary">{scannedItem.name}</div>
                    <div className="font-mono text-xs mt-2 text-primary">{scannedItem.id}</div>
                  </div>
                ) : (
                  <div className="text-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="font-mono text-[10px] uppercase tracking-widest">Awaiting Frame Alignment</p>
                  </div>
                )}
             </div>

             <Button 
               onClick={handleScan}
               disabled={isScanning}
               className="w-full h-12 font-mono text-xs uppercase tracking-[0.2em] mt-6"
             >
               {isScanning ? 'Synchronizing Opticals...' : 'Initiate Scan'}
             </Button>
          </div>

          {/* Dynamic Route Pilot */}
          <div className="tactical-panel bg-black/40 before:hidden p-8 border border-white/5 flex flex-col justify-between">
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

        {/* Earnings Suite */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatProgress label="Today's Earnings" value={840} max={1000} prefix="$" />
          <StatProgress label="Deliveries" value={14} max={20} />
          <StatProgress label="Efficiency" value={98} max={100} suffix="%" />
          <StatProgress label="Incentive Lock" value={65} max={100} suffix="%" color="bg-accent" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatProgress({ label, value, max, prefix = '', suffix = '', color = 'bg-primary' }: any) {
  return (
    <div className="tactical-panel p-6 before:hidden border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
        <div className="font-mono text-lg font-bold">{prefix}{value}{suffix}</div>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${(value/max)*100}%` }} />
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
