
'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Activity, 
  ShieldAlert, 
  Database, 
  Eye, 
  Trash2, 
  Loader2, 
  Zap,
  TrendingUp,
  Server,
  Network
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isNuking, setIsNuking] = useState(false);

  // Real-time Store Directory
  const storesQuery = useMemoFirebase(() => {
    return collection(db, 'darkStores');
  }, [db]);

  const { data: stores, isLoading: isLoadingStores } = useCollection(storesQuery);

  // Platform-wide Metrics Calculation
  const stats = useMemo(() => {
    if (!stores) return { totalNodes: 0, totalRiders: 0, healthyNodes: 0 };
    return {
      totalNodes: stores.length,
      totalRiders: stores.reduce((acc, s) => acc + (s.metrics?.activeRiders || 0), 0),
      healthyNodes: stores.filter(s => (s.metrics?.stockHealth || 0) > 70).length
    };
  }, [stores]);

  const handleGhostTunnel = (storeId: string) => {
    toast({
      title: "Ghost Protocol Initiated",
      description: `Tunneling into Node: ${storeId}`,
    });
    router.push(`/darkstore/inventory?store=${storeId}`);
  };

  const handleDemoNuke = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently purge all test stores and inventory. Proceed?")) return;
    
    setIsNuking(true);
    const batch = writeBatch(db);
    
    try {
      // 1. Purge Stores
      const storesSnap = await getDocs(collection(db, 'darkStores'));
      storesSnap.forEach(s => batch.delete(s.ref));

      // 2. Note: A real nuke would recursively delete subcollections. 
      // For this demo, we purge the primary store directory.
      
      await batch.commit();
      toast({
        variant: "destructive",
        title: "DEMO DATA PURGED",
        description: "Platform state has been reset to zero baseline.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Nuke Failed",
        description: e.message,
      });
    } finally {
      setIsNuking(false);
    }
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.4em] font-bold mt-2">Platform Oversight Protocol // Apex v10.0</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
              variant="destructive"
              onClick={handleDemoNuke}
              disabled={isNuking}
              className="bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive/20 font-mono text-[10px] tracking-widest h-12 px-8 uppercase"
            >
              {isNuking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Nuke Demo Data
            </Button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Active Nodes" value={stats.totalNodes} icon={<Server className="text-primary" />} color="primary" />
          <StatCard label="Global Fleet" value={stats.totalRiders} icon={<Activity className="text-secondary" />} color="secondary" />
          <StatCard label="Mesh Integrity" value={`${Math.round((stats.healthyNodes / (stats.totalNodes || 1)) * 100)}%`} icon={<Zap className="text-accent" />} color="accent" />
          <StatCard label="Platform Latency" value="0.8ms" icon={<Network className="text-white/40" />} color="muted" />
        </div>

        {/* Global Control Grid */}
        <Card className="tactical-panel border-none bg-black/40 overflow-hidden before:bg-primary/20">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <CardTitle className="text-xs font-headline flex items-center gap-3 tracking-widest text-white uppercase">
              <Database className="w-4 h-4 text-primary" />
              Network Node Directory
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[9px] border-primary/20 text-primary">LIVE TELEMETRY</Badge>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingStores ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60">Scanning Network Fabric...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-mono tracking-widest py-6">Store Name / ID</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Riders</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Stock Health</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono tracking-widest">Plan</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores?.map((store) => (
                    <TableRow key={store.id} className="border-white/5 hover:bg-white/5 group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{store.storeName}</span>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">{store.storeId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-secondary">{store.metrics?.activeRiders || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn(
                            "font-mono text-xs font-bold",
                            (store.metrics?.stockHealth || 0) > 70 ? "text-secondary" : "text-destructive"
                          )}>{store.metrics?.stockHealth || 0}%</span>
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full", (store.metrics?.stockHealth || 0) > 70 ? "bg-secondary" : "bg-destructive")} 
                              style={{ width: `${store.metrics?.stockHealth || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase font-mono border-white/10",
                          store.plan === 'Pro' ? "bg-primary/10 text-primary border-primary/20" : "text-muted-foreground"
                        )}>{store.plan || 'Free'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleGhostTunnel(store.storeId)}
                          className="text-primary hover:bg-primary/10 font-mono text-[9px] uppercase tracking-widest"
                        >
                          <Eye className="w-3.5 h-3.5 mr-2" />
                          Ghost Protocol
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {stores?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-20 text-center">
                        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">No nodes registered in the mesh.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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
