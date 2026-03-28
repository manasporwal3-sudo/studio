"use client"

import { SKUS } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

export function InventoryTable() {
  return (
    <Card className="glass-panel border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline tracking-tight">Live Inventory Sync</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="status-indicator health-green" />
          Neural Link Active
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">SKU / Item</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground text-right">On Hand</TableHead>
              <TableHead className="text-muted-foreground text-right">Predicted (4h)</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKUS.map((sku) => (
              <TableRow key={sku.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{sku.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{sku.id}</span>
                  </div>
                </TableCell>
                <TableCell>{sku.category}</TableCell>
                <TableCell className="text-right font-mono text-lg">{sku.currentStock}</TableCell>
                <TableCell className="text-right font-mono text-lg text-primary">{sku.predictedDemand4Hours}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={cn(
                      "capitalize border-none",
                      sku.status === 'critical' ? "bg-destructive/20 text-destructive" :
                      sku.status === 'low' ? "bg-warning/20 text-[#f59e0b]" :
                      "bg-emerald-500/20 text-[#10b981]"
                    )}
                  >
                    {sku.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
