'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  category?: string;
  status: 'healthy' | 'low' | 'critical';
  unitPrice?: number;
  margin?: number;
}

export function useDarkStoreOS(storeId: string) {
  const { user } = useUser();
  const db = useFirestore();
  
  // Real-time Inventory Mesh -Traced to User Subcollection
  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'users', user.uid, 'inventory');
  }, [db, user?.uid]);

  const { data: rawInventory, isLoading } = useCollection(inventoryQuery);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [salesTrends, setSalesTrends] = useState<{ time: string; sales: number }[]>([]);

  useEffect(() => {
    if (rawInventory) {
      const processed = rawInventory.map(item => {
        const margin = (item.sellingPrice - item.costPrice) / (item.sellingPrice || 1);
        let status: 'healthy' | 'low' | 'critical' = 'healthy';
        
        if (item.currentStock <= 0) {
          status = 'critical';
        } else if (item.currentStock <= (item.reorderPoint || 5)) {
          status = 'low';
        }

        return {
          ...item,
          margin,
          unitPrice: item.sellingPrice,
          status
        } as InventoryItem;
      });
      setInventory(processed);
    }
  }, [rawInventory]);

  // Derive trends from actual inventory state (Velocity is 0 if no sales recorded)
  useEffect(() => {
    if (inventory.length > 0) {
      // Create static baseline for trends based on SKU count
      const baselineTrends = Array.from({ length: 8 }).map((_, i) => ({
        time: `${8 + i * 2}:00`,
        sales: 0 // Zero fabrication
      }));
      setSalesTrends(baselineTrends);
      
      // Calculate real potential revenue (Stock Value)
      const stockValue = inventory.reduce((acc, item) => acc + (item.sellingPrice * item.currentStock), 0);
      setRevenue(stockValue);
    }
  }, [inventory.length]);

  return { 
    inventory, 
    revenue, 
    events, 
    salesTrends,
    isLoading 
  };
}
