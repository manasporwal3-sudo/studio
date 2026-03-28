
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Shield, Activity, Map, Globe, AlertTriangle, TrendingUp, Zap, Cpu } from "lucide-react";
import { optimizeSupplyChain } from "@/ai/flows/regional-optimizer-flow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const data = [
  { name: 'Node 1', stock: 4000, risk: 2400 },
  { name: 'Node 2', stock: 3000, risk: 1398 },
  { name: 'Node 3', stock: 2000, risk: 9800 },
  { name: 'Node 4', stock: 2780, risk: 3908 },
  { name: 'Node 5', stock: 1890, risk: 4800 },
];

export default function AdminDashboard() {
  const [optimizing, setOptimizing] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  const runOptimizer = async () => {
    setOptimizing(true);
    try {
      const result = await optimizeSupplyChain({
        region: "Maharashtra/Mumbai Cluster",
        inventoryLevels: "Nodes 1-5 reporting critical stock on dairy.",
        weatherForecast: "Heavy rain predicted in 48 hours.",
        upcomingFestivals: "Ganesh Chaturthi preparation peak.",
      });
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic text-primary">Global Command</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Network Oversight Protocol // Apex v9.0</p>
          </div>
          <Button 
            onClick={runOptimizer} 
            disabled={optimizing}
            className="bg-primary text-black font-headline text-[10px] tracking-widest px-8 glow-cyan"
          >
            {optimizing ? "CALIBRATING..." : "RUN GLOBAL OPTIMIZER"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 tactical-panel border-none bg-black/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-headline flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                NETWORK TRAJECTORY
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} />
                  <YAxis stroke="#ffffff20" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#000', border: '1px solid #ffffff10' }} />
                  <Area type="monotone" dataKey="stock" stroke="#00d4ff" fillOpacity={1} fill="url(#colorStock)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="tactical-panel border-none bg-black/40">
            <CardHeader>
              <CardTitle className="text-xs font-headline flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                GHOST STOCK ALERTS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] text-destructive">NODE-00{i}</span>
                    <Badge variant="outline" className="text-[8px] border-destructive text-destructive">CRITICAL</Badge>
                  </div>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">Inventory Discrepancy: -42 Units (Dairy)</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            <Card className="tactical-panel border-none bg-black/60 before:bg-secondary">
              <CardHeader>
                <CardTitle className="text-xs font-headline flex items-center gap-2 text-secondary">
                  <Cpu className="w-4 h-4" />
                  AI PREDICTIVE SUMMARY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-[11px] leading-relaxed text-foreground/80">{insights.summary}</p>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-headline text-[10px] text-muted-foreground tracking-widest uppercase">Targeted Reallocations</h3>
              {insights.risks.map((risk: any, i: number) => (
                <div key={i} className="p-4 tactical-panel bg-white/5 before:hidden border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-headline text-xs text-primary">{risk.location}</span>
                    <Badge className={risk.urgency === 'critical' ? 'bg-destructive' : 'bg-primary'}>{risk.urgency}</Badge>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground mb-2">{risk.reason}</p>
                  <p className="font-mono text-[10px] text-secondary font-bold">COMMAND: {risk.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
