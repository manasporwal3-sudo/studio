
'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

function TrendsContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { salesTrends } = useDarkStoreOS(storeId);

  // Simulated 4-hour LSTM forecast
  const forecastData = [
    ...salesTrends.map(t => ({ ...t, type: 'actual' })),
    { time: '16:00', sales: Math.floor(Math.random() * 20) + 40, type: 'forecast' },
    { time: '17:00', sales: Math.floor(Math.random() * 20) + 50, type: 'forecast' },
    { time: '18:00', sales: Math.floor(Math.random() * 20) + 80, type: 'forecast' },
    { time: '19:00', sales: Math.floor(Math.random() * 20) + 95, type: 'forecast' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic">Demand Oracle</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-bold">Predictive LSTM Forecasting</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 p-2 gap-2">
          <Sparkles className="w-3 h-3" />
          CONFIDENCE: 94.2%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Predicted Peak" value="19:00 HRS" icon={<Layers className="w-4 h-4" />} trend="HIGH" />
        <MetricCard title="Stock Health" value="98.5%" icon={<Activity className="w-4 h-4" />} trend="STABLE" />
        <MetricCard title="Sales Velocity" value="4.2 r/s" icon={<TrendingUp className="w-4 h-4" />} trend="+12%" />
      </div>

      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="text-md uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            4-Hour Rolling Demand Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
           <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fill="url(#colorActual)" 
                  data={forecastData.filter(d => d.type === 'actual')} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeDasharray="5 5" 
                  strokeWidth={2} 
                  fill="url(#colorForecast)" 
                  data={forecastData.filter(d => d.type === 'forecast' || d.time === '15:00')} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="p-4 glass-panel border-none rounded-2xl flex flex-col gap-1 group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{title}</span>
        <div className="text-primary/40 group-hover:text-primary transition-colors">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-[10px] font-bold text-primary">{trend}</span>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Trends...</div>}>
        <TrendsContent />
      </Suspense>
    </DashboardLayout>
  );
}
