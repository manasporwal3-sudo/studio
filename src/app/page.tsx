import { InventoryTable } from "@/components/dashboard/inventory-table";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { PerformanceCharts } from "@/components/dashboard/performance-charts";
import { ProcurementAssistant } from "@/components/dashboard/procurement-assistant";
import { Brain, Database, Globe, Layers, Activity } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-headline tracking-tighter flex items-center gap-2">
              NEURO-FAST <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono font-normal">v2.0 EDGE</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Zero-Latency Inventory Engine</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase">System Status</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="status-indicator health-green" /> OPERATIONAL
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase">AI Latency</span>
            <span className="text-xs font-mono text-primary">14ms</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase">Network</span>
            <span className="text-xs font-mono text-white">DarkStore-Mesh_Alpha</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Top Row: Quick Metrics */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Inventory Sync" value="100%" icon={<Database className="w-4 h-4" />} trend="+0.4%" />
            <MetricCard title="Demand Accuracy" value="94.2%" icon={<Layers className="w-4 h-4" />} trend="+2.1%" />
            <MetricCard title="Ghost Stock Risk" value="0.02%" icon={<Activity className="w-4 h-4" />} trend="-15%" inverse />
          </div>
          
          <div className="col-span-12 lg:col-span-4 flex items-center justify-end text-xs text-muted-foreground">
             <Globe className="w-3 h-3 mr-2" /> Global Logistics Node: LON-042
          </div>

          {/* Column 1: Core Dashboard (Main Inventory & Charts) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <InventoryTable />
            <PerformanceCharts />
            <ProcurementAssistant />
          </div>

          {/* Column 2: AI Intelligence & Alerts */}
          <div className="col-span-12 lg:col-span-4">
            <AIInsights />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-white/5 text-center text-xs text-muted-foreground">
        <p>&copy; 2024 NEURO-FAST SYSTEMS. AUTONOMOUS BUSINESS ARCHITECTURE.</p>
      </footer>
      <Toaster />
    </div>
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
