'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActiveStoresGrid } from "@/components/admin/active-stores-grid";
import { 
  ShieldAlert, 
  Trash2, 
  Loader2, 
  Zap,
  Server,
  Network,
  Activity
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
      return (new Date().getTime() - s.lastActive.toDate().getTime()) < 120000;
    }).length;

    return {
      totalNodes: stores.length,
      onlineNodes: onlineCount,
      meshIntegrity: stores.length > 0 ? Math.round((onlineCount / stores.length) * 100) : 100
    };
  }, [allUsers]);

  const handleDemoNuke = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently purge all test stores and inventory. Proceed?")) return;
    
    setIsNuking(false); // In a real app we'd set to true, but keeping it reactive for the demo
    toast({
      variant: "destructive",
      title: "DEMO DATA PURGE INITIATED",
      description: "Purging network fabric documents...",
    });
    // Atomic nuke logic would follow here
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-destructive animate-pulse" />
              God Mode Control
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-2">
              Platform Oversight Protocol // Apex v10.0
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
              Nuke Demo Data
            </Button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Registered Nodes" value={stats.totalNodes} icon={<Server className="text-primary" />} color="primary" />
          <StatCard label="Online Now" value={stats.onlineNodes} icon={<Activity className="text-secondary animate-pulse" />} color="secondary" />
          <StatCard label="Mesh Integrity" value={`${stats.meshIntegrity}%`} icon={<Zap className="text-accent" />} color="accent" />
          <StatCard label="Uplink Latency" value="0.8ms" icon={<Network className="text-white/40" />} color="muted" />
        </div>

        {/* Real-time Activity Matrix */}
        <ActiveStoresGrid />
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
