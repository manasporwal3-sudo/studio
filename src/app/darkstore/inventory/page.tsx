
'use client';

import { useState, Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, RefreshCw, Crosshair, Package, TrendingUp, Zap } from "lucide-react";
import { predictDemand } from "@/ai/flows/predict-demand-flow";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function InventoryContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { inventory, isLoading } = useDarkStoreOS(storeId);
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState<any>(null);
  const { toast } = useToast();

  const runSimulation = async () => {
    if (!inventory || inventory.length === 0) {
      toast({
        title: "Simulation Protocol Aborted",
        description: "Local Node Inventory is empty. Add SKUs to initialize the predictive brain.",
        variant: "destructive",
      });
      return;
    }

    setSimulating(true);
    try {
      // Pick a target SKU for simulation (usually the first one in the node)
      const target = inventory[0];
      const result = await predictDemand({
        sku: target.id,
        skuName: target.name,
        currentStock: target.currentStock,
        reorderPoint: target.reorderPoint,
        sellingPrice: target.sellingPrice,
        costPrice: target.costPrice,
        historicalSales: [{ timestamp: new Date().toISOString(), quantity: 15 }]
      });
      setSimResults(result);
    } catch (e) {
      console.error(e);
      toast({
        title: "Uplink Terminated",
        description: "Failed to establish a link with the Demand Intelligence Core.",
        variant: "destructive",
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic text-primary">Neural Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Local Node Management // Apex v9.0</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={runSimulation}
            disabled={simulating || isLoading || inventory.length === 0}
            className="bg-secondary text-black font-headline text-[10px] tracking-widest px-6 glow-green"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {simulating ? "SIMULATING..." : "24H SALES SIMULATOR"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 tactical-panel border-none bg-black/40 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary/60">Scanning Node Mesh...</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                <Package className="w-12 h-12 text-white/5" />
                <div className="space-y-1">
                  <p className="font-headline text-sm uppercase tracking-widest text-muted-foreground">No SKUs Detected</p>
                  <p className="font-mono text-[9px] text-muted-foreground/60 uppercase">Add items via the signup or node command to begin monitoring.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-mono">Identifier</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Stock</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Runway</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.name}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{item.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-lg">{Math.floor(item.currentStock)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{Math.floor(item.currentStock / 1.2)}h</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px]",
                          item.status === 'critical' ? 'bg-destructive' : item.status === 'low' ? 'bg-accent' : 'bg-secondary'
                        )}>{item.status.toUpperCase()}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="tactical-panel border-none bg-black/60 before:bg-primary">
            <CardHeader>
              <CardTitle className="text-xs font-headline flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-primary" />
                SMART SCANNER
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/5 gap-4">
              <Package className="w-8 h-8 text-white/10" />
              <p className="text-[9px] font-mono text-muted-foreground uppercase text-center">Awaiting Frame Alignment...</p>
              <Button size="sm" variant="outline" className="text-[8px] font-mono">INITIATE CAMERA</Button>
            </CardContent>
          </Card>

          {simResults && (
            <Card className="tactical-panel border-none bg-secondary/10 before:bg-secondary animate-in zoom-in duration-300">
              <CardHeader>
                <CardTitle className="text-xs font-headline flex items-center gap-2 text-secondary">
                  <Zap className="w-4 h-4" />
                  SIMULATION PEAK
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold font-mono text-secondary">+{simResults.predictedDemandQuantity}</div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">Predicted 24h Demand</div>
                </div>
                <p className="text-[10px] font-mono text-foreground/70 leading-relaxed italic">{simResults.reasoning}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DarkstoreInventoryPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="font-mono text-xs animate-pulse text-primary tracking-widest uppercase">Syncing Local Node...</div>}>
        <InventoryContent />
      </Suspense>
    </DashboardLayout>
  );
}
