'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';

export interface DashboardMetrics {
  profit: number;
  deliveries: number;
  efficiency: number;
  isIncentiveUnlocked: boolean;
  isLoading: boolean;
}

/**
 * useDashboardMetrics - Sovereign real-time calculation engine.
 * Derives tactical node metrics from the live inventory mesh.
 */
export function useDashboardMetrics(): DashboardMetrics {
  const { user } = useUser();
  const db = useFirestore();

  // Establish high-fidelity link to local inventory mesh
  const inventoryQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'users', user.uid, 'inventory');
  }, [db, user?.uid]);

  const { data: inventory, isLoading } = useCollection(inventoryQuery);

  const metrics = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return {
        profit: 0,
        deliveries: 0,
        efficiency: 0,
        isIncentiveUnlocked: false,
        isLoading
      };
    }

    // 1. Calculate Real-time P&L
    const totalProfit = inventory.reduce((acc, item) => {
      const margin = (item.sellingPrice || 0) - (item.costPrice || 0);
      return acc + (margin * (item.unitsSold || 0));
    }, 0);

    // 2. Aggregate Fulfillments (Deliveries)
    const totalDeliveries = inventory.reduce((acc, item) => {
      return acc + (item.unitsSold || 0);
    }, 0);

    // 3. Measure Node Efficiency (Stock Availability)
    const outOfStockCount = inventory.filter(item => (item.currentStock || 0) <= 0).length;
    const efficiency = ((inventory.length - outOfStockCount) / inventory.length) * 100;

    // 4. Evaluate Incentive Protocol (Efficiency > 92% and Deliveries > 50)
    const isIncentiveUnlocked = efficiency > 92 && totalDeliveries > 50;

    return {
      profit: totalProfit,
      deliveries: totalDeliveries,
      efficiency: Math.round(efficiency),
      isIncentiveUnlocked,
      isLoading
    };
  }, [inventory, isLoading]);

  return metrics;
}
