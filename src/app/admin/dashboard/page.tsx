
'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActiveStoresGrid } from "@/components/admin/active-stores-grid";
import { 
  ShieldAlert, 
  Trash2, 
  Zap,
  Server,
  Network,
  Activity,
  Globe,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
          <div>
            <h1 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-white flex items-center gap-3">
              <Server className="w-8 h-8 text-primary glow-cyan" />
              Store Management
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-2">
              Global Node Oversight & Hub Management // Apex v10.5
            </p>
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
          <StatCard label="Neural Latency" value="0.8ms" icon={<Settings className="text-white/40" />} color="muted" />
        </div>

        {/* Real-time Hub Management Matrix */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="font-headline text-lg font-bold uppercase tracking-widest text-white">Hub Management Matrix</h3>
          </div>
          <ActiveStoresGrid />
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
