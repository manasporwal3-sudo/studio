'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Eye, Mail, Server, RefreshCw, Network } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ActiveStoresGrid() {
  const db = useFirestore();
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();

  const isMasterAdmin = user?.email === 'admin@neurofast.io' || userProfile?.role === 'admin';

  const storesQuery = useMemoFirebase(() => {
    if (isUserLoading || !user || !isMasterAdmin) return null;
    
    return query(
      collection(db, 'users'),
      where('role', '==', 'store'),
      orderBy('lastActive', 'desc')
    );
  }, [db, user, isMasterAdmin, isUserLoading]);

  const { data: stores, isLoading } = useCollection(storesQuery);

  const isOnline = (lastActive: any) => {
    if (!lastActive) return false;
    const date = typeof lastActive.toDate === 'function' ? lastActive.toDate() : new Date(lastActive);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 120000; // 2 minutes
  };

  const handleGhostTunnel = (storeId: string) => {
    router.push(`/darkstore/inventory?store=${storeId}`);
  };

  return (
    <Card className="tactical-panel border-none bg-black/40 overflow-hidden before:bg-primary/20">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Network className="w-4 h-4 text-primary" />
          <CardTitle className="text-[10px] font-headline tracking-[0.2em] text-white uppercase">
            LIVE NETWORK NODE MESH
          </CardTitle>
        </div>
        {(isLoading || isUserLoading) && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-white/[0.02]">
           {stores?.map((store) => {
             const online = isOnline(store.lastActive);
             return (
               <div key={store.id} className="relative group flex flex-col items-center justify-center p-4 tactical-panel before:hidden border-white/5 bg-black/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => handleGhostTunnel(store.uid)}>
                  <div className={cn(
                    "w-3 h-3 rounded-full mb-3",
                    online ? "bg-secondary shadow-[0_0_10px_#00ff88] animate-pulse" : "bg-destructive shadow-[0_0_5px_red] opacity-40"
                  )} />
                  <span className="font-headline text-[8px] text-white uppercase text-center truncate w-full">{store.storeName || 'HUB'}</span>
                  <div className="absolute top-1 right-1">
                    <div className={cn("w-1 h-1 rounded-full", online ? "bg-secondary" : "bg-destructive")} />
                  </div>
               </div>
             )
           })}
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-mono tracking-widest py-4">Identifier</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest">Network Status</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest">Heartbeat</TableHead>
              <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Oversight</TableHead>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-white/5 hover:bg-white/5 group transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white uppercase">{store.storeName || 'UNNAMED_HUB'}</span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase">{store.uid}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {online ? (
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </div>
                          <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest glow-text-primary">LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 opacity-50">
                          <div className="w-2 h-2 rounded-full border border-primary/40"></div>
                          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">IDLE</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[9px] text-muted-foreground uppercase">
                      {store.lastActive 
                        ? formatDistanceToNow(typeof store.lastActive.toDate === 'function' ? store.lastActive.toDate() : new Date(store.lastActive), { addSuffix: true })
                        : 'NO_SIGNAL'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleGhostTunnel(store.uid)}
                        className="text-primary hover:bg-primary/10 font-mono text-[9px] uppercase tracking-widest h-7"
                      >
                        <Eye className="w-3 h-3 mr-2" />
                        GHOST_TUNNEL
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {!isLoading && !isUserLoading && (!stores || stores.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="p-12 text-center">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Awaiting node synchronization...</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
