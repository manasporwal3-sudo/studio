
'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Database, Clock, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

function InventoryContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { inventory } = useDarkStoreOS(storeId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic">Inventory Brain</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-bold">Real-time SKU Matrix</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 p-2 gap-2">
            <RefreshCw className="w-3 h-3 animate-spin" />
            AUTO-SYNC: ON
          </Badge>
        </div>
      </div>

      <Card className="glass-panel border-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground">SKU / Item</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground text-right">Runway Timer</TableHead>
                <TableHead className="text-muted-foreground text-right">Current Stock</TableHead>
                <TableHead className="text-muted-foreground">Node Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-base">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{item.category}</span>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex items-center justify-end gap-2 text-xs font-mono">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {Math.floor(item.currentStock / 1.5)}m
                     </div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-lg font-bold">
                    {Math.floor(item.currentStock)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "capitalize border-none px-3 py-1",
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
        </CardContent>
      </Card>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Inventory...</div>}>
        <InventoryContent />
      </Suspense>
    </DashboardLayout>
  );
}
