
'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveStoresGrid } from "@/components/admin/active-stores-grid";
import { AiGlobalMonitor } from "@/components/admin/ai-global-monitor";
import { PlatformActivityLogs } from "@/components/admin/platform-activity-logs";
import { 
  ShieldAlert, 
  Trash2, 
  Zap,
  Server,
  Network,
  Activity,
  Globe,
  Settings,
  Brain,
  Terminal,
  TrendingUp,
  Cpu
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revData = [
  { time: '00:00', val: 400 },
  { time: '04:00', val: 300 },
  { time: '08:00', val: 900 },
  { time: '12:00', val: 1400 },
  { time: '16:00', val: 2100 },
  { time: '20:00', val: 1800 },
  { time: '23:59', val: 2400 },
];

export default function AdminDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isNuking, setIsNuking] = useState(false);

  // Stats Telemetry
  const storesQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: allUsers } = useCollection(storesQuery);

  const stats = useMemo(() => {
    const stores = allUsers?.filter(u => u.role === 'store') || [];
    const onlineCount = stores.filter(s => {
      if (!s.lastActive) return false;
      const lastActiveDate = typeof s.lastActive.toDate === 'function' ? s.lastActive.toDate() : new Date(s.lastActive);
      return (new Date().getTime() - lastActiveDate.getTime()) < 120000;
    }).length;

    return {
      totalNodes: stores.length,
      onlineNodes: onlineCount,
      meshIntegrity: stores.length > 0 ? Math.round((onlineCount / stores.length) * 100) : 100
    };
  }, [allUsers]);

  const handleDemoNuke = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently purge all test stores and inventory. Proceed?")) return;
    
    setIsNuking(false);
    toast({
      variant: "destructive",
      title: "DEMO DATA PURGE INITIATED",
      description: "Purging network fabric documents...",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(20,255,236,0.2)]">
               <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-white flex items-center gap-3">
                Apex Command
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-1">
                Global Network Oversight // Node v10.5
              </p>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              variant="destructive"
              onClick={handleDemoNuke}
              disabled={isNuking}
              className="bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive/20 font-mono text-[10px] tracking-widest h-12 px-8 uppercase"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Platform
            </Button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Registered Hubs" value={stats.totalNodes} icon={<Server className="text-primary" />} color="primary" />
          <StatCard label="Online Nodes" value={stats.onlineNodes} icon={<Activity className="text-secondary animate-pulse" />} color="secondary" />
          <StatCard label="Mesh Integrity" value={`${stats.meshIntegrity}%`} icon={<Zap className="text-accent" />} color="accent" />
          <StatCard label="Revenue Command" value="₹2.4M" icon={<TrendingUp className="text-white/40" />} color="muted" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Matrix */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-white">AI Global Monitor</h3>
              </div>
              <AiGlobalMonitor />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Globe className="w-5 h-5 text-secondary" />
                <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-white">Active Node Matrix</h3>
              </div>
              <ActiveStoresGrid />
            </div>
          </div>

          {/* Sidebar Modules */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-white">Aggregate Performance</h3>
              </div>
              <Card className="tactical-panel bg-black/40 border-none p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revData}>
                    <defs>
                      <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14ffec" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14ffec" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }} labelStyle={{ fontSize: '10px' }} itemStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="val" stroke="#14ffec" fillOpacity={1} fill="url(#colorAdminRev)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Terminal className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-headline text-xs font-bold uppercase tracking-widest text-white">Global Event Log</h3>
              </div>
              <PlatformActivityLogs />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <Card className={cn(
      "tactical-panel border-none bg-black/40 before:bg-white/10",
      color === 'primary' && "before:bg-primary",
      color === 'secondary' && "before:bg-secondary",
      color === 'accent' && "before:bg-accent"
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="text-3xl font-black font-headline tracking-tighter text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
