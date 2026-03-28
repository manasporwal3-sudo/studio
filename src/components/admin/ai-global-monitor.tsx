
'use client';

import { useCollection, useFirestore, useUser } from "@/firebase";
import { collectionGroup, query, where, limit, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, AlertCircle, TrendingDown, Cpu, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

/**
 * AI Global Monitor - Platform-wide SKU Intelligence
 * Monitors for high-risk stockouts across all store hubs.
 */
export function AiGlobalMonitor() {
  const db = useFirestore();

  // Collection Group Query: Fetch all items across all inventory subcollections
  // Note: This requires a composite index on collectionGroup 'inventory' in production.
  const globalAtRiskQuery = useMemo(() => {
    return query(
      collectionGroup(db, 'inventory'),
      where('currentStock', '<=', 5),
      orderBy('currentStock', 'asc'),
      limit(10)
    );
  }, [db]);

  const { data: atRiskItems, isLoading } = useCollection(globalAtRiskQuery);

  return (
    <Card className="tactical-panel border-none bg-black/40 overflow-hidden relative group">
      {/* Scanning Animation */}
      <div className="scan-line opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <CardContent className="p-0">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">Neural Risk Detection Active</span>
          </div>
          {isLoading && <RefreshCw className="w-3 h-3 text-primary animate-spin" />}
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">Aggregating Global SKU Matrix...</p>
          </div>
        ) : !atRiskItems || atRiskItems.length === 0 ? (
          <div className="p-20 text-center space-y-3 opacity-40">
            <AlertCircle className="w-10 h-10 mx-auto text-secondary" />
            <p className="font-mono text-[10px] uppercase tracking-widest">Global Stock Integrity Nominal</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase font-mono tracking-widest py-4">SKU Name</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Units</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest text-right">Risk Level</TableHead>
                <TableHead className="text-[10px] uppercase font-mono tracking-widest">Protocol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atRiskItems.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-white">{item.name}</span>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">SKU: {item.sku || item.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-lg text-destructive">
                    {item.currentStock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={cn(
                          "w-3 h-1",
                          i <= (5 - item.currentStock) ? "bg-destructive shadow-[0_0_5px_red]" : "bg-white/5"
                        )} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[8px] border-destructive/20 text-destructive uppercase">CRITICAL</Badge>
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
