'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Eye, Mail, Server, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ActiveStoresGrid() {
  const db = useFirestore();
  const router = useRouter();

  const storesQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'users'),
      where('role', '==', 'store'),
      orderBy('lastActive', 'desc')
    );
  }, [db]);

  const { data: stores, isLoading } = useCollection(storesQuery);

  const isOnline = (lastActive: any) => {
    if (!lastActive) return false;
    const date = lastActive.toDate();
    const now = new Date();
    return (now.getTime() - date.getTime()) < 120000; // 2 minutes
  };

  const handleGhostTunnel = (storeId: string) => {
    router.push(`/darkstore/inventory?store=${storeId}`);
  };

  return (
    <Card className="tactical-panel border-none bg-black/40 overflow-hidden before:bg-primary/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <CardTitle className="text-xs font-headline tracking-widest text-white uppercase">
            Active Node Telemetry
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[9px] border-primary/20 text-primary">LIVE MESH</Badge>
          {isLoading && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-mono tracking-widest py-6">Store Identifier</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest">Network Status</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest">Last Activity</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Protocol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {stores?.map((store) => {
                const online = isOnline(store.lastActive);
                return (
                  <motion.tr
                    key={store.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-white/5 hover:bg-white/5 group transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-white">{store.storeName || 'Unnamed Hub'}</span>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground uppercase">
                          <Mail className="w-2.5 h-2.5" />
                          {store.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {online ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </div>
                          <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">ONLINE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 opacity-50">
                          <div className="w-2 h-2 rounded-full border border-primary/40"></div>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">IDLE</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {store.lastActive 
                        ? formatDistanceToNow(store.lastActive.toDate(), { addSuffix: true }).toUpperCase()
                        : 'NEVER SYNCED'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleGhostTunnel(store.uid)}
                        className="text-primary hover:bg-primary/10 font-mono text-[9px] uppercase tracking-widest h-8"
                      >
                        <Eye className="w-3.5 h-3.5 mr-2" />
                        GHOST_TUNNEL
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {!isLoading && stores?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="p-20 text-center">
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">No active nodes detected in the neural mesh.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
