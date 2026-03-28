
'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { Zap, DollarSign, Package, Users, Activity } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function DashboardContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { inventory, revenue, events, salesTrends } = useDarkStoreOS(storeId);

  const kpis = [
    { title: "Live Revenue", value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <DollarSign className="w-4 h-4" />, color: "text-emerald-400" },
    { title: "Active Orders", value: Math.floor(revenue / 15).toString(), icon: <Zap className="w-4 h-4" />, color: "text-primary" },
    { title: "Low Stock Alert", value: inventory.filter(i => i.status !== 'healthy').length.toString(), icon: <Package className="w-4 h-4" />, color: "text-rose-400" },
    { title: "Node Agents", value: "24", icon: <Users className="w-4 h-4" />, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="glass-panel border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{kpi.title}</span>
                <div className={kpi.color}>{kpi.icon}</div>
              </div>
              <div className="text-3xl font-bold font-mono tracking-tighter">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PerformanceCharts data={salesTrends} />
          <Card className="glass-panel border-none">
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                NEURAL EVENT STREAM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 font-mono text-[11px]">
                {events.map((event) => (
                  <div key={event.id} className="flex gap-4 border-b border-white/5 pb-2 last:border-0">
                    <span className="text-muted-foreground shrink-0">{event.time}</span>
                    <span className={cn(
                      "font-bold uppercase px-1.5 rounded",
                      event.type === 'sale' ? "text-emerald-400 bg-emerald-400/10" :
                      event.type === 'restock' ? "text-blue-400 bg-blue-400/10" :
                      "text-primary bg-primary/10"
                    )}>{event.type}</span>
                    <span className="text-foreground">{event.msg}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="glass-panel border-none h-fit">
          <CardHeader>
            <CardTitle className="text-md uppercase tracking-widest">Urgency Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.filter(i => i.status !== 'healthy').map(item => (
                <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">{item.name}</span>
                    <span className={cn("text-[10px] font-bold px-1.5 rounded", 
                      item.status === 'critical' ? "bg-rose-500/20 text-rose-500" : "bg-amber-500/20 text-amber-500")}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>RUNWAY: {Math.floor(item.currentStock / 2)} MINS</span>
                    <span className="font-mono text-primary">{Math.floor(item.currentStock)} UNIT</span>
                  </div>
                </div>
              ))}
              {inventory.filter(i => i.status !== 'healthy').length === 0 && (
                <div className="text-center py-8 text-emerald-400 text-xs font-bold uppercase italic">
                  All SKUs Stable
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  );
}
