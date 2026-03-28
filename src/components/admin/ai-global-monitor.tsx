'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, where, limit, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Cpu, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiGlobalMonitor() {
  const db = useFirestore();
  const { user, userProfile, isUserLoading } = useUser();

  // Defensive identity check for master admin privileges
  const isMasterAdmin = user?.email === 'admin@neurofast.io' || userProfile?.role === 'admin';

  const globalAtRiskQuery = useMemoFirebase(() => {
    // strictly guard against premature query fire during auth handshake
    if (isUserLoading || !user?.uid || !isMasterAdmin) return null;
    
    try {
      // Note: This requires a composite index in production. 
      // If it fails with an index error, check the console for the link.
      return query(
        collectionGroup(db, 'inventory'),
        where('currentStock', '<=', 5),
        orderBy('currentStock', 'asc'),
        limit(15)
      );
    } catch (e) {
      return null;
    }
  }, [db, user?.uid, isMasterAdmin, isUserLoading]);

  const { data: atRiskItems, isLoading } = useCollection(globalAtRiskQuery);

  return (
    <Card className="tactical-panel border-none bg-black/40 overflow-hidden relative group">
      <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <CardContent className="p-0">
        <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Neural Risk Detection Active</span>
          </div>
          {(isLoading || isUserLoading) && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
        </div>

        {isLoading || isUserLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">Aggregating Global SKU Matrix...</p>
          </div>
        ) : !atRiskItems || atRiskItems.length === 0 ? (
          <div className="p-12 text-center space-y-3 opacity-40">
            <AlertCircle className="w-10 h-10 mx-auto text-secondary" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Global Stock Integrity Nominal</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-mono tracking-widest py-3">Global SKU</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Units</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Hazard Index</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest">Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atRiskItems.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white uppercase">{item.name}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">SKU_{item.sku || item.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-base text-destructive">
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={cn(
                          "w-2.5 h-1",
                          i <= (5 - item.currentStock) ? "bg-destructive shadow-[0_0_8px_red]" : "bg-white/5"
                        )} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[8px] border-destructive/20 text-destructive uppercase h-5">CRITICAL</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}