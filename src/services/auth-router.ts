'use client';

import { doc, getDoc, Firestore } from 'firebase/firestore';
import { Auth, signOut } from 'firebase/auth';
import { AppUser } from '@/types';

/**
 * Validates the user's role against the intended portal and routes accordingly.
 * @param db Firestore instance
 * @param auth Auth instance
 * @param uid User ID
 * @param intendedRole The role expected for the portal ('admin' or 'store')
 */
export async function validateAndRoute(
  db: Firestore,
  auth: Auth,
  uid: string,
  intendedRole: 'admin' | 'store'
): Promise<{ success: boolean; message?: string }> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, message: "Node Identity Not Found in Firestore. Please register first." };
    }

    const profile = userDoc.data() as AppUser;

    if (profile.role !== intendedRole) {
      await signOut(auth);
      const errorMsg = intendedRole === 'admin' 
        ? "Unauthorized: Store Operator identity detected. Use the Store Node portal." 
        : "Access Denied: Administrative identity detected. Use the Admin Terminal.";
      return { success: false, message: errorMsg };
    }

    return { success: true };
  } catch (error) {
    await signOut(auth);
    return { success: false, message: "Neural Link Synchronization Failure." };
  }
}