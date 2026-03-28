'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Cpu, TrendingUp, ShieldCheck, Activity, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const data = [
  { name: '01', rev: 4000, prof: 2400 },
  { name: '05', rev: 3000, prof: 1398 },
  { name: '10', rev: 2000, prof: 9800 },
  { name: '15', rev: 2780, prof: 3908 },
  { name: '20', rev: 1890, prof: 4800 },
  { name: '25', rev: 2390, prof: 3800 },
  { name: '30', rev: 3490, prof: 4300 },
];

export default function PredictiveBrainPage() {
  return (
    <DashboardLayout>
      <div className="space-y-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-secondary/20 border border-secondary/40 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-extrabold uppercase tracking-[0.3em]">Predictive Neural Brain</h1>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Model: LSTM-4 // Accuracy: 96.8% // Status: Learning</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="p-3 tactical-panel before:bg-secondary flex items-center gap-3">
               <ShieldCheck className="w-4 h-4 text-secondary" />
               <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Guardian Protocol Active</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 tactical-panel p-8 before:hidden border border-white/5 bg-black/40 h-[450px]">
             <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest">30-Day Financial Trajectory</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-mono text-[9px] uppercase text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                    <span className="font-mono text-[9px] uppercase text-muted-foreground">Net Profit</span>
                  </div>
                </div>
             </div>
             
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14ffec" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14ffec" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#84ff00" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#84ff00" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'Share Tech Mono'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontFamily: 'Share Tech Mono'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }} />
                    <Area type="monotone" dataKey="rev" stroke="#14ffec" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="prof" stroke="#84ff00" fillOpacity={1} fill="url(#colorProf)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.3em] text-muted-foreground border-b border-white/5 pb-2">Category Accuracy</h3>
            <AccuracyGauge label="FMCG / SNACKS" value={93.4} />
            <AccuracyGauge label="DAIRY / FRESH" value={91.8} />
            <AccuracyGauge label="BEVERAGES" value={97.2} />
            <AccuracyGauge label="PANTRY" value={88.5} />
          </div>
        </div>

        {/* Self-Healing Stream */}
        <div className="tactical-panel p-8 before:hidden border border-white/5 bg-black/40">
           <div className="flex items-center gap-4 mb-8">
             <Terminal className="w-5 h-5 text-primary" />
             <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Neural Self-Healing Event Log</h3>
           </div>
           <div className="space-y-4 font-mono text-[10px]">
              <EventRow time="12:04:22" event="STOCKOUT_PROB_92%_DETECTED" detail="Node: BLR-01 // SKU: SKU-005" status="FIXED" />
              <EventRow time="12:03:15" event="SUPPLIER_WEBHOOK_INITIATED" detail="Vendor: Sunrise Bakeries // Order: Restock-42" status="PENDING" />
              <EventRow time="12:02:48" event="GHOST_STOCK_DISCREPANCY" detail="Node: MUM-02 // Delta: -12 Units" status="ADJUSTED" />
              <EventRow time="12:01:05" event="PEAK_LOAD_PREDICTION" detail="Window: 18:00 - 21:00 // Multiplier: 2.8x" status="OPTIMIZED" />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AccuracyGauge({ label, value }: { label: string, value: number }) {
  return (
    <div className="tactical-panel p-6 before:hidden border border-white/5 group">
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
        <span className="font-mono text-sm font-bold text-secondary">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 flex gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={cn(
            "flex-1 h-full transition-colors duration-1000",
            (i / 20) * 100 < value ? "bg-secondary" : "bg-white/10"
          )} />
        ))}
      </div>
    </div>
  );
}

function EventRow({ time, event, detail, status }: any) {
  return (
    <div className="flex gap-8 py-2 border-b border-white/5 last:border-0 group">
      <span className="text-muted-foreground/40">{time}</span>
      <span className="font-bold text-primary tracking-widest">{event}</span>
      <span className="text-muted-foreground flex-1">{detail}</span>
      <span className={cn(
        "px-2 font-bold",
        status === 'FIXED' || status === 'OPTIMIZED' ? 'text-secondary' : status === 'ADJUSTED' ? 'text-accent' : 'text-primary'
      )}>[{status}]</span>
    </div>
  );
}
