'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Clock, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

function InventoryContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { inventory } = useDarkStoreOS(storeId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-headline tracking-tighter uppercase italic">Inventory Brain</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">Real-time SKU Matrix</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 p-2 gap-2 w-full sm:w-auto justify-center">
            <RefreshCw className="w-3 h-3 animate-spin" />
            AUTO-SYNC: ACTIVE
          </Badge>
        </div>
      </div>

      <Card className="glass-panel border-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest">SKU / Item</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest text-right">Runway</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest text-right">Stock</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase tracking-widest">Node Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="text-sm md:text-base font-bold truncate max-w-[150px]">{item.name}</span>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{item.category}</span>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1 md:gap-2 text-[10px] font-mono">
                          <Clock className="w-3 h-3 text-muted-foreground hidden xs:block" />
                          {Math.floor(item.currentStock / 1.5)}m
                       </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm md:text-lg font-bold">
                      {Math.floor(item.currentStock)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "capitalize border-none px-2 py-0.5 text-[9px]",
                          item.status === 'critical' ? "bg-rose-500/20 text-rose-500" :
                          item.status === 'low' ? "bg-amber-500/20 text-amber-500" :
                          "bg-emerald-500/20 text-emerald-400"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="font-mono text-xs animate-pulse">Establishing Node Link...</div>}>
        <InventoryContent />
      </Suspense>
    </DashboardLayout>
  );
}
