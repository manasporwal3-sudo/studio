'use client';

import { doc, getDoc, Firestore } from 'firebase/firestore';
import { Auth, signOut } from 'firebase/auth';
import { AppUser } from '@/types';

/**
 * Validates the user's role against the intended portal and routes accordingly.
 * Ensures UID consistency between Auth and Firestore documents.
 */
export async function validateAndRoute(
  db: Firestore,
  auth: Auth,
  uid: string,
  intendedRole: 'admin' | 'store'
): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Primary Identity Check (users collection)
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, message: "Node Identity Not Detected. Ensure enrollment is complete." };
    }

    const profile = userDoc.data() as AppUser;

    // 2. Role Integrity Check
    if (profile.role !== intendedRole) {
      // Allow master admin bypass for development efficiency
      const isMasterAdmin = profile.email === 'admin@neurofast.io' || profile.email === 'system.apex@neurofast.io';
      
      if (!isMasterAdmin) {
        await signOut(auth);
        const errorMsg = intendedRole === 'admin' 
          ? "Strategic Access Denied: Store Operator identity detected." 
          : "Operational Access Denied: Administrative identity detected.";
        return { success: false, message: errorMsg };
      }
    }

    // 3. Operational Hub Check (darkStores collection) for store operators
    if (profile.role === 'store') {
      const storeRef = doc(db, 'darkStores', uid);
      const storeDoc = await getDoc(storeRef);
      if (!storeDoc.exists()) {
        // Log this discrepancy but allow login if the user doc exists (self-healing will happen later)
        console.warn(`Discrepancy: User ${uid} exists but darkStores doc is missing.`);
      }
    }

    return { success: true };
  } catch (error) {
    await signOut(auth);
    return { success: false, message: "Neural Link Synchronization Failure. Check network status." };
  }
}
