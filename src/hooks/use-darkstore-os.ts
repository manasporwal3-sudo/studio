
'use client';

import { useState, useEffect, useCallback } from 'react';
import { INITIAL_INVENTORY, SKUS } from '@/lib/mock-data';

export type InventoryItem = typeof INITIAL_INVENTORY[0];

export function useDarkStoreOS(storeId: string) {
  // Initialize with seed data immediately to prevent blank flashes
  const [inventory, setInventory] = useState<InventoryItem[]>(() => 
    INITIAL_INVENTORY.map(item => ({ 
      ...item, 
      currentStock: 45 // Fixed initial seed for hydration stability
    }))
  );
  const [revenue, setRevenue] = useState(2540);
  const [events, setEvents] = useState<{ id: string; time: string; msg: string; type: 'sale' | 'restock' | 'alert' }[]>([]);
  const [salesTrends, setSalesTrends] = useState<{ time: string; sales: number }[]>([]);

  // Initialize store-specific telemetry
  useEffect(() => {
    // Randomize once on mount
    setInventory(INITIAL_INVENTORY.map(item => ({ 
      ...item, 
      currentStock: Math.floor(Math.random() * 60) + 20 
    })));
    setRevenue(Math.floor(Math.random() * 5000) + 1000);
    setEvents([{ 
      id: 'init', 
      time: new Date().toLocaleTimeString(), 
      msg: `System Uplink Established: Node ${storeId} Active`, 
      type: 'alert' 
    }]);
    
    const initialTrends = Array.from({ length: 8 }).map((_, i) => ({
      time: `${8 + i}:00`,
      sales: Math.floor(Math.random() * 40) + 10
    }));
    setSalesTrends(initialTrends);
  }, [storeId]);

  const tick = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Peak hour multiplier (Sovereign v9.0 Logic)
    let multiplier = 1.0;
    if ((hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 21)) {
      multiplier = 2.5;
    }

    setInventory(prev => prev.map(item => {
      const depletion = Math.random() * item.baseVelocity * multiplier;
      const newStock = Math.max(0, item.currentStock - depletion);
      
      let status: 'healthy' | 'low' | 'critical' = 'healthy';
      if (newStock < 5) status = 'critical';
      else if (newStock < 15) status = 'low';

      // Auto-restock logic for critical nodes
      if (newStock < 5) {
        const restockQty = Math.floor(Math.random() * 30) + 20;
        const poNumber = `PO-${Math.floor(Math.random() * 100000)}`;
        
        setTimeout(() => {
          setEvents(e => [{ 
            id: Math.random().toString(), 
            time: new Date().toLocaleTimeString(), 
            msg: `SOVEREIGN AUTO-HEAL: Restocked ${item.name} (+${restockQty}). ${poNumber}`, 
            type: 'restock' 
          }, ...e].slice(0, 50));
          
          setInventory(inv => inv.map(i => i.id === item.id ? { ...i, currentStock: i.currentStock + restockQty, status: 'healthy' } : i));
        }, 1500);
      }

      if (depletion > 0.1) {
        const saleValue = depletion * item.unitPrice;
        setRevenue(r => r + saleValue);
      }

      return { ...item, currentStock: newStock, status };
    }));

    // Update telemetry charts
    if (now.getSeconds() % 15 === 0) {
      setSalesTrends(prev => {
        const last = prev[prev.length - 1];
        const nextTime = new Date();
        return [...prev.slice(1), { 
          time: nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          sales: Math.floor(Math.random() * 50 * multiplier) 
        }];
      });
    }
  }, [storeId]);

  useEffect(() => {
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [tick]);

  return { inventory, revenue, events, salesTrends };
}
