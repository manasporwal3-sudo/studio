'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  costPrice: number;
  sellingPrice: number;
  reorderPoint: number;
  category: string;
  status: 'healthy' | 'low' | 'critical';
  unitPrice?: number; // Compat
  margin?: number;
}

export function useDarkStoreOS(storeId: string) {
  const { user } = useUser();
  const db = useFirestore();
  
  // Real-time Inventory Mesh
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
        // Margin Health Triage: (SP - CP) / SP
        const margin = (item.sellingPrice - item.costPrice) / item.sellingPrice;
        let status: 'healthy' | 'low' | 'critical' = 'healthy';
        
        if (item.currentStock <= 0) {
          status = 'critical';
        } else if (item.currentStock <= item.reorderPoint) {
          status = 'low';
        }

        return {
          ...item,
          margin,
          unitPrice: item.sellingPrice, // Internal mapping for components expecting unitPrice
          status
        } as InventoryItem;
      });
      setInventory(processed);
    }
  }, [rawInventory]);

  // Telemetry for trends based on the live inventory data
  useEffect(() => {
    if (inventory.length > 0) {
      // Simulate velocity based on inventory size and stock levels
      const mockTrends = Array.from({ length: 8 }).map((_, i) => ({
        time: `${8 + i}:00`,
        sales: Math.floor(Math.random() * (inventory.length * 0.5))
      }));
      setSalesTrends(mockTrends);
      
      // Calculate revenue (retail value)
      const totalRev = inventory.reduce((acc, item) => acc + (item.sellingPrice * (Math.random() * 5)), 0);
      setRevenue(totalRev);
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
