'use client';

import { useState, Suspense, useRef } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS, type InventoryItem } from "@/hooks/use-darkstore-os";
import { useFirestore, useUser } from "@/firebase";
import { doc, collection } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { bulkUploadInventory } from '@/firebase/firestore/bulk-upload';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Cpu, RefreshCw, Crosshair, Package, TrendingUp, Zap, Plus, Trash2, Edit2, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';

function InventoryContent() {
  const { user } = useUser();
  const db = useFirestore();
  const { inventory, isLoading } = useDarkStoreOS(user?.uid || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderPoint: 5,
    sku: ''
  });

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data.map((row: any) => ({
          name: row.Name || row.name || "",
          sku: row.SKU || row.sku || "",
          currentStock: Number(row.Stock || row.currentStock || 0),
          reorderPoint: Number(row["Reorder Point"] || row.reorderPoint || 5),
          costPrice: Number(row["Cost Price"] || row.costPrice || 0),
          sellingPrice: Number(row["Selling Price"] || row.sellingPrice || 0),
        })).filter(item => item.name);
        
        if (parsedData.length > 0) {
          setUploadProgress({ current: 0, total: parsedData.length });
          try {
            await bulkUploadInventory(db, user.uid, parsedData, (count) => {
              setUploadProgress(prev => prev ? { ...prev, current: count } : null);
            });
            toast({ 
              title: "Bulk Mesh Uplink Success", 
              description: `${parsedData.length} SKUs integrated into local node.` 
            });
          } catch (e) {
            toast({ 
              title: "Uplink Failed", 
              description: "The batch write protocol was interrupted.",
              variant: "destructive"
            });
          } finally {
            setUploadProgress(null);
          }
        }
      }
    });
  };

  const handleAddSKU = async () => {
    if (!newItem.name || !user?.uid) return;
    
    const colRef = collection(db, 'users', user.uid, 'inventory');
    addDocumentNonBlocking(colRef, {
      ...newItem,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    setIsAddModalOpen(false);
    setNewItem({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5, sku: '' });
    toast({ title: "SKU Synchronized", description: "Node mesh updated with new data vector." });
  };

  const handleUpdateSKU = async () => {
    if (!editingItem || !user?.uid) return;
    
    const docRef = doc(db, 'users', user.uid, 'inventory', editingItem.id);
    updateDocumentNonBlocking(docRef, {
      ...editingItem,
      lastUpdated: new Date().toISOString()
    });
    
    setEditingItem(null);
    toast({ title: "SKU Re-calibrated", description: "Telemetry updated in the local hub." });
  };

  const handleDeleteSKU = async (id: string) => {
    if (!user?.uid) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "SKU Terminated", description: "Item removed from the neural matrix." });
  };

  const simulateOrder = async () => {
    if (!inventory || inventory.length === 0 || !user?.uid) {
      toast({ title: "Simulation Aborted", description: "Empty node mesh. Add SKUs to simulate.", variant: "destructive" });
      return;
    }

    setIsSimulating(true);
    const randomIndex = Math.floor(Math.random() * inventory.length);
    const target = inventory[randomIndex];

    if (target.currentStock > 0) {
      const docRef = doc(db, 'users', user.uid, 'inventory', target.id);
      updateDocumentNonBlocking(docRef, {
        currentStock: target.currentStock - 1,
        lastUpdated: new Date().toISOString()
      });
      toast({ title: "Order Simulated", description: `Reduced stock for ${target.name}.` });
    } else {
      toast({ title: "Out of Stock", description: `${target.name} cannot fulfill the simulation.`, variant: "destructive" });
    }
    
    setTimeout(() => setIsSimulating(false), 500);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic text-primary text-glow-cyan">Neural Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Local Node Inventory Matrix</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleCsvUpload} 
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProgress !== null}
            className="bg-secondary/10 text-secondary border border-secondary/20 font-headline text-[10px] tracking-widest px-6 hover:bg-secondary/20"
          >
            {uploadProgress ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            {uploadProgress ? "UPLINKING..." : "BULK IMPORT"}
          </Button>

          <Button 
            onClick={simulateOrder}
            disabled={isSimulating || isLoading || inventory.length === 0}
            className="bg-destructive/20 text-destructive border border-destructive/30 font-headline text-[10px] tracking-widest px-6 hover:bg-destructive/40"
          >
            <Zap className="w-4 h-4 mr-2" />
            SIMULATE ORDER
          </Button>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-black font-headline text-[10px] tracking-widest px-6 glow-cyan">
                <Plus className="w-4 h-4 mr-2" />
                INITIATE SKU
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#060d1c] border-primary/20 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="font-headline italic uppercase text-primary">Enroll New SKU</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="SKU NAME" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="cyber-input" />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="STOCK LEVEL" value={newItem.currentStock} onChange={e => setNewItem({...newItem, currentStock: Number(e.target.value)})} className="cyber-input" />
                  <Input placeholder="SKU ID / CODE" value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="cyber-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="COST PRICE ₹" value={newItem.costPrice} onChange={e => setNewItem({...newItem, costPrice: Number(e.target.value)})} className="cyber-input" />
                  <Input type="number" placeholder="SELL PRICE ₹" value={newItem.sellingPrice} onChange={e => setNewItem({...newItem, sellingPrice: Number(e.target.value)})} className="cyber-input" />
                </div>
                <Input type="number" placeholder="REORDER POINT" value={newItem.reorderPoint} onChange={e => setNewItem({...newItem, reorderPoint: Number(e.target.value)})} className="cyber-input" />
              </div>
              <DialogFooter>
                <Button onClick={handleAddSKU} className="w-full bg-primary text-black font-headline text-xs tracking-widest">DEPLOY SKU</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {uploadProgress && (
        <Card className="tactical-panel bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] text-primary uppercase tracking-[0.2em] font-bold">Synchronizing Mesh...</span>
              <span className="font-mono text-[10px] text-primary">{uploadProgress.current} / {uploadProgress.total} SKUs</span>
            </div>
            <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

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
                  <p className="font-mono text-[9px] text-muted-foreground/60 uppercase">Initialize items or upload CSV to begin monitoring.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-mono">SKU / Identifier</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Stock</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Profit Per Unit</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono">Status</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.name}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{item.sku || item.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-lg">{item.currentStock}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-secondary">₹{item.sellingPrice - item.costPrice}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px]",
                          item.status === 'critical' ? 'bg-destructive' : item.status === 'low' ? 'bg-accent' : 'bg-secondary'
                        )}>{item.status.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)} className="text-primary hover:bg-primary/10">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSKU(item.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
              <p className="text-[9px] font-mono text-muted-foreground uppercase text-center">Frame Alignment Required</p>
              <Button size="sm" variant="outline" className="text-[8px] font-mono border-primary/20 text-primary">INITIATE CAMERA</Button>
            </CardContent>
          </Card>

          {inventory.some(i => i.status === 'critical') && (
            <Card className="tactical-panel border-none bg-destructive/10 before:bg-destructive animate-pulse">
              <CardContent className="p-6 flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="font-headline text-[10px] text-destructive uppercase tracking-widest">Critical Stock Alert</p>
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">Multiple SKUs below reorder threshold.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="bg-[#060d1c] border-primary/20 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline italic uppercase text-primary">Edit SKU Matrix</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="SKU NAME" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="cyber-input" />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="STOCK LEVEL" value={editingItem.currentStock} onChange={e => setEditingItem({...editingItem, currentStock: Number(e.target.value)})} className="cyber-input" />
                <Input type="number" placeholder="REORDER POINT" value={editingItem.reorderPoint} onChange={e => setEditingItem({...editingItem, reorderPoint: Number(e.target.value)})} className="cyber-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="COST PRICE ₹" value={editingItem.costPrice} onChange={e => setEditingItem({...editingItem, costPrice: Number(e.target.value)})} className="cyber-input" />
                <Input type="number" placeholder="SELL PRICE ₹" value={editingItem.sellingPrice} onChange={e => setEditingItem({...editingItem, sellingPrice: Number(e.target.value)})} className="cyber-input" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateSKU} className="w-full bg-primary text-black font-headline text-xs tracking-widest">APPLY CHANGES</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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
