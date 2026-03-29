'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS, type InventoryItem } from "@/hooks/use-darkstore-os";
import { useFirestore, useUser } from "@/firebase";
import { doc, collection } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, recordStoreActivity, logPlatformActivity } from '@/firebase/non-blocking-updates';
import { bulkUploadInventory } from '@/firebase/firestore/bulk-upload';
import { INITIAL_INVENTORY_MESH } from '@/lib/inventory-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Cpu, RefreshCw, Crosshair, Package, Zap, Plus, Trash2, Edit2, AlertCircle, Layers, ShoppingCart, Activity, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function InventoryContent() {
  const { user, userProfile } = useUser();
  const db = useFirestore();
  const { inventory, isLoading } = useDarkStoreOS(user?.uid || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);
  const { toast } = useToast();

  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    reorderPoint: 5,
    sku: '',
    unitsSold: 0
  });

  // Calculate items needing refill (less than 5)
  const itemsNeedingRefill = useMemo(() => {
    return inventory.filter(item => item.currentStock < 5);
  }, [inventory]);

  const handleAutoRefill = async () => {
    if (!user?.uid || itemsNeedingRefill.length === 0) return;
    
    setIsRefilling(true);
    try {
      itemsNeedingRefill.forEach(item => {
        const docRef = doc(db, 'users', user.uid, 'inventory', item.id);
        updateDocumentNonBlocking(docRef, {
          currentStock: 30,
          lastUpdated: new Date().toISOString()
        });
      });

      recordStoreActivity(db, user.uid);
      logPlatformActivity(db, {
        type: 'restock',
        message: `AUTO_REFILL: ${itemsNeedingRefill.length} SKUs recalibrated to 30 units.`,
        storeId: userProfile?.storeName || user.uid,
        impact: 'HIGH'
      });

      toast({ 
        title: "Neural Stock Calibration", 
        description: `${itemsNeedingRefill.length} SKUs successfully refilled to 30 units.`,
        className: "bg-[#060d1c] border-secondary/30 text-secondary font-mono text-[10px] uppercase tracking-widest"
      });
    } finally {
      setIsRefilling(false);
    }
  };

  const handleExpandMesh = async () => {
    if (!user?.uid) return;
    setIsExpanding(true);
    try {
      const dataToUpload = INITIAL_INVENTORY_MESH.map(item => ({ ...item, unitsSold: 0 }));
      await bulkUploadInventory(db, user.uid, dataToUpload, (count) => {
        // Progress tracking optional
      });
      recordStoreActivity(db, user.uid);
      logPlatformActivity(db, {
        type: 'system',
        message: `Node mesh expanded with ${INITIAL_INVENTORY_MESH.length} SKUs.`,
        storeId: userProfile?.storeName || user.uid,
        impact: 'HIGH'
      });
      toast({ title: "Mesh Expansion Complete", description: "50+ SKUs successfully enrolled in the local node." });
    } catch (e) {
      toast({ title: "Expansion Failed", description: "Could not synchronize industrial mesh.", variant: "destructive" });
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAddSKU = async () => {
    if (!newItem.name || !user?.uid) return;
    
    const colRef = collection(db, 'users', user.uid, 'inventory');
    addDocumentNonBlocking(colRef, {
      ...newItem,
      addedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    
    recordStoreActivity(db, user.uid);
    logPlatformActivity(db, {
      type: 'system',
      message: `Manual SKU Enrollment: ${newItem.name}`,
      storeId: userProfile?.storeName || user.uid
    });
    
    setIsAddModalOpen(false);
    setNewItem({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5, sku: '', unitsSold: 0 });
    toast({ title: "SKU Synchronized", description: "Node mesh updated with new data vector." });
  };

  const handleUpdateSKU = async () => {
    if (!editingItem || !user?.uid) return;
    
    const docRef = doc(db, 'users', user.uid, 'inventory', editingItem.id);
    updateDocumentNonBlocking(docRef, {
      ...editingItem,
      lastUpdated: new Date().toISOString()
    });
    
    recordStoreActivity(db, user.uid);
    setEditingItem(null);
    toast({ title: "SKU Re-calibrated", description: "Telemetry updated in the local hub." });
  };

  const handleDeleteSKU = async (id: string) => {
    if (!user?.uid) return;
    const docRef = doc(db, 'users', user.uid, 'inventory', id);
    deleteDocumentNonBlocking(docRef);
    recordStoreActivity(db, user.uid);
    toast({ title: "SKU Terminated", description: "Item removed from the neural matrix." });
  };

  // Autonomous Demand Engine Logic - High Velocity (2-3s)
  const processAutomatedOrder = useCallback(async () => {
    if (!inventory || inventory.length === 0 || !user?.uid) return;

    const basketSize = Math.floor(Math.random() * 2) + 1;
    const basket: InventoryItem[] = [];
    
    const availableItems = inventory.filter(i => i.currentStock > 0);
    if (availableItems.length === 0) return;

    for(let i = 0; i < basketSize; i++) {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const target = availableItems[randomIndex];
      if (!basket.find(b => b.id === target.id)) {
        basket.push(target);
      }
    }

    if (basket.length > 0) {
      basket.forEach(item => {
        const docRef = doc(db, 'users', user.uid, 'inventory', item.id);
        updateDocumentNonBlocking(docRef, {
          currentStock: Math.max(0, item.currentStock - 1),
          unitsSold: (item.unitsSold || 0) + 1,
          lastUpdated: new Date().toISOString()
        });
      });

      recordStoreActivity(db, user.uid);
      logPlatformActivity(db, {
        type: 'order',
        message: `AUTO_FULFILL: ${basket.map(b => b.name).join(', ')}`,
        storeId: userProfile?.storeName || user.uid,
        impact: 'NOMINAL'
      });

      toast({ 
        title: "Autonomous Fulfillment", 
        description: `Order fulfilled for: ${basket.map(b => b.name).join(', ')}`,
        className: "bg-[#060d1c] border-primary/30 text-primary font-mono text-[10px] uppercase tracking-widest",
        duration: 2000
      });
    }
  }, [inventory, user?.uid, userProfile?.storeName, db, toast]);

  useEffect(() => {
    if (isLoading || inventory.length === 0) return;

    const interval = setInterval(() => {
      processAutomatedOrder();
    }, 2500);

    return () => clearInterval(interval);
  }, [inventory.length, isLoading, processAutomatedOrder]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tighter uppercase italic text-primary text-glow-cyan">Neural Hub</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Local Node Inventory Matrix</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {itemsNeedingRefill.length > 0 && (
            <Button 
              onClick={handleAutoRefill}
              disabled={isRefilling}
              className="bg-accent text-black font-headline text-[10px] tracking-widest px-6 shadow-[0_0_20px_rgba(0,212,255,0.3)] animate-pulse"
            >
              {isRefilling ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpCircle className="w-4 h-4 mr-2" />}
              AUTO-REFILL LOW STOCK ({itemsNeedingRefill.length})
            </Button>
          )}

          <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/30 px-4 py-2 gap-2 font-mono text-[10px] tracking-widest uppercase">
            <Activity className="w-3 h-3 animate-pulse" />
            Autonomous Demand: ACTIVE (2.5s)
          </Badge>

          <Button 
            onClick={handleExpandMesh}
            disabled={isExpanding || isLoading}
            className="bg-secondary/20 text-secondary border border-secondary/30 font-headline text-[10px] tracking-widest px-6 hover:bg-secondary/40"
          >
            {isExpanding ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
            EXPAND MESH (50+ SKUs)
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
                  <p className="font-mono text-[9px] text-muted-foreground/60 uppercase">Initialize items to begin monitoring.</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-white/5 border-white/5 hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase font-mono">SKU / Identifier</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Stock</TableHead>
                    <TableHead className="text-[10px] uppercase font-mono text-right">Units Sold</TableHead>
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
                      <TableCell className="text-right font-mono text-xs text-secondary">{item.unitsSold || 0}</TableCell>
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
