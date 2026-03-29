'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking, logPlatformActivity } from '@/firebase/non-blocking-updates';
import { ActiveStoresGrid } from "@/components/admin/active-stores-grid";
import { AiGlobalMonitor } from "@/components/admin/ai-global-monitor";
import { PlatformActivityLogs } from "@/components/admin/platform-activity-logs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Zap,
  Server,
  Activity,
  Globe,
  Brain,
  Terminal,
  TrendingUp,
  Skull,
  Coins,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const revData = [
  { time: '00:00', val: 4000 },
  { time: '04:00', val: 3200 },
  { time: '08:00', val: 9500 },
  { time: '12:00', val: 14800 },
  { time: '16:00', val: 21200 },
  { time: '20:00', val: 18500 },
  { time: '23:59', val: 24600 },
];

export default function AdminDashboard() {
  const { user, userProfile, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isChaosActive, setIsChaosActive] = useState(false);

  const isMasterAdmin = user?.email === 'admin@neurofast.io' || userProfile?.role === 'admin';

  const storesQuery = useMemoFirebase(() => {
    if (!user?.uid || !isMasterAdmin || isUserLoading) return null; 
    return query(collection(db, 'users'), where('role', '==', 'store'));
  }, [db, user?.uid, isMasterAdmin, isUserLoading]);

  const { data: allStores, error, isLoading: isStoresLoading } = useCollection(storesQuery);

  const stats = useMemo(() => {
    if (!allStores) return { totalNodes: 0, onlineNodes: 0, meshIntegrity: 0 };
    
    const now = Date.now();
    const online = allStores.filter(s => {
      const lastActive = s.lastActive?.toDate?.() || new Date(s.lastActive || 0);
      return (now - lastActive.getTime()) < 120000;
    }).length;

    return {
      totalNodes: allStores.length,
      onlineNodes: online,
      meshIntegrity: allStores.length > 0 ? Math.round((online / allStores.length) * 100) : 0
    };
  }, [allStores]);

  // Incentive Approval Queue (Mocked logic based on metadata for simulation)
  const incentiveQueue = useMemo(() => {
    if (!allStores) return [];
    return allStores.filter(s => s.role === 'store' && !s.incentivePaid).slice(0, 3);
  }, [allStores]);

  const handleTriggerChaos = () => {
    setIsChaosActive(true);
    logPlatformActivity(db, {
      type: 'alert',
      message: "CHAOS_PROTOCOL: PEAK_DEMAND_SPIKE triggered system-wide.",
      impact: 'CRITICAL'
    });
    
    toast({
      title: "PEAK DEMAND ACTIVATED",
      description: "Neural engine simulating 500% load surge across all nodes.",
      variant: "destructive",
      className: "font-mono border-destructive bg-destructive/10"
    });

    setTimeout(() => setIsChaosActive(false), 5000);
  };

  const handleApproveIncentive = (storeId: string, storeName: string) => {
    const storeRef = doc(db, 'users', storeId);
    updateDocumentNonBlocking(storeRef, { incentivePaid: true, lastIncentiveAt: new Date().toISOString() });
    
    logPlatformActivity(db, {
      type: 'system',
      message: `INCENTIVE_APPROVED: Payout authorized for node ${storeName}.`,
      storeId: storeName,
      impact: 'NOMINAL'
    });

    toast({
      title: "PAYOUT AUTHORIZED",
      description: `Incentive release confirmed for ${storeName}.`,
      className: "font-mono border-secondary bg-secondary/10"
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center font-mono text-destructive gap-4">
          <ShieldAlert className="w-12 h-12 animate-pulse" />
          <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-tighter">Apex Link Failure</h2>
            <p className="text-[10px] opacity-50 uppercase tracking-widest mt-2">{error.message}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isUserLoading || (user && !userProfile && isMasterAdmin && isStoresLoading)) {
    return (
      <DashboardLayout>
        <div className="h-full min-h-[60vh] flex items-center justify-center">
          <div className="font-mono text-primary animate-pulse tracking-[0.5em] text-xs uppercase">
            Synchronizing Apex Command...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user && !isMasterAdmin) {
    return (
      <DashboardLayout>
        <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-destructive">
          <ShieldAlert className="w-12 h-12 mb-4" />
          <h2 className="text-xl font-black uppercase tracking-tighter">Access Forbidden</h2>
          <p className="font-mono text-[10px] mt-2 uppercase tracking-widest opacity-50">Node identity lacks strategic clearance.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10 scanning-effect relative">
        <div className="scan-line" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_rgba(20,255,236,0.2)]">
               <ShieldAlert className="w-9 h-9 text-primary glow-cyan" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic text-white">
                Apex Command
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-1">
                Global Network Oversight // Node v11.0 SOVEREIGN
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button 
              onClick={handleTriggerChaos}
              disabled={isChaosActive}
              className={cn(
                "h-12 px-6 font-headline text-[10px] tracking-widest border-none transition-all",
                isChaosActive ? "bg-destructive animate-pulse" : "bg-primary text-black hover:bg-primary/80 glow-cyan"
              )}
            >
              {isChaosActive ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Skull className="w-4 h-4 mr-2" />}
              {isChaosActive ? "SPIKING LOAD..." : "TRIGGER PEAK DEMAND"}
            </Button>
            <div className="px-4 py-2 border border-white/10 bg-black/40 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3 text-secondary animate-pulse" />
              Mesh Sync: Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Registered Hubs" value={stats.totalNodes} icon={<Server className="text-primary" />} color="primary" />
          <StatCard label="Online Nodes" value={stats.onlineNodes} icon={<Activity className="text-secondary animate-pulse" />} color="secondary" />
          <StatCard label="Mesh Integrity" value={`${stats.meshIntegrity}%`} icon={<Zap className="text-accent" />} color="accent" />
          <StatCard label="Incentive Queue" value={incentiveQueue.length} icon={<Coins className="text-white/40" />} color="muted" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-white">AI Global Monitor (Ghost Stock Detection)</h3>
              </div>
              <AiGlobalMonitor />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Globe className="w-5 h-5 text-secondary" />
                <h3 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-white">Live Node Mesh Telemetry</h3>
              </div>
              <ActiveStoresGrid />
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <Coins className="w-5 h-5 text-accent" />
                <h3 className="font-headline text-sm font-bold uppercase tracking-[0.2em] text-white">Incentive Approval Queue</h3>
              </div>
              <Card className="tactical-panel border-none bg-black/40 p-6">
                <div className="space-y-4">
                  {incentiveQueue.length === 0 ? (
                    <p className="text-[10px] font-mono text-muted-foreground uppercase text-center py-10 opacity-40">No pending incentive unlocks.</p>
                  ) : (
                    incentiveQueue.map(store => (
                      <div key={store.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm group hover:bg-primary/5 transition-colors">
                        <div>
                          <p className="font-headline text-[10px] text-white uppercase">{store.storeName || 'UNNAMED_NODE'}</p>
                          <p className="text-[8px] font-mono text-secondary uppercase mt-1">Efficiency: 94%+</p>
                        </div>
                        <Button 
                          onClick={() => handleApproveIncentive(store.id, store.storeName)}
                          className="h-7 px-3 bg-secondary text-black font-mono text-[9px] uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          APPROVE
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white">Aggregate Performance</h3>
              </div>
              <Card className="tactical-panel border-none bg-black/40 p-6 h-[250px]">
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
              <div className="flex items-center gap-4 mb-2">
                <Terminal className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-white">System Event Log</h3>
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
      color === 'primary' && "before:bg-primary shadow-[0_0_15px_rgba(20,255,236,0.1)]",
      color === 'secondary' && "before:bg-secondary",
      color === 'accent' && "before:bg-accent"
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
          {icon}
        </div>
        <div className="text-3xl font-black font-headline tracking-tighter text-white">{value}</div>
      </CardContent>
    </Card>
  );
}
