'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { TrendingUp, Activity, Layers } from "lucide-react";

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Demand Accuracy" value="94.2%" icon={<Layers className="w-4 h-4" />} trend="+2.1%" />
          <MetricCard title="Ghost Stock Risk" value="0.02%" icon={<Activity className="w-4 h-4" />} trend="-15%" inverse />
          <MetricCard title="Peak Velocity" value="42 r/h" icon={<TrendingUp className="w-4 h-4" />} trend="+5.4%" />
        </div>
        <PerformanceCharts />
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, trend, inverse = false }: { title: string, value: string, icon: React.ReactNode, trend: string, inverse?: boolean }) {
  return (
    <div className="p-4 glass-panel border-none rounded-2xl flex flex-col gap-1 group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{title}</span>
        <div className="text-primary/40 group-hover:text-primary transition-colors">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className={`text-[10px] font-bold ${inverse ? (trend.startsWith('-') ? 'text-emerald-400' : 'text-rose-400') : (trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
