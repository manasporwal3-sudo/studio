/**
 * NEURO·FAST SOVEREIGN — CORE TYPE DEFINITIONS
 * Version: 10.0 APEX
 */

export type UserRole = 'admin' | 'store';

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  storeId?: string; // Present if role is 'store'
  displayName: string;
  storeName?: string;
  lastActive?: any; // Firestore Timestamp
  createdAt: string;
  updatedAt: string;
}

export interface DarkStoreMetrics {
  totalOrders: number;
  activeRiders: number;
  revenue: number;
  stockHealth: number; // 0-100
}

export interface DarkStore {
  storeId: string;
  storeName: string;
  ownerUid: string;
  city: string;
  address: string;
  pinCode: string;
  gstNumber?: string;
  metrics: DarkStoreMetrics;
  plan: 'Free' | 'Pro';
  createdAt: string;
}

export interface PlatformTelemetry {
  totalStores: number;
  totalRiders: number;
  globalSKUCount: number;
  activeNodes: number;
}
