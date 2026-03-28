'use client';

import { writeBatch, doc, collection, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Executes a chunked batched write for large inventory datasets.
 * Automatically splits data into batches of 500 to stay within Firestore limits.
 */
export async function bulkUploadInventory(
  db: Firestore,
  userId: string,
  items: any[],
  onProgress?: (count: number) => void
) {
  const inventoryCol = collection(db, 'users', userId, 'inventory');
  const CHUNK_SIZE = 500;
  
  try {
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      
      chunk.forEach((item) => {
        const newDocRef = doc(inventoryCol);
        batch.set(newDocRef, {
          ...item,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      });
      
      await batch.commit();
      if (onProgress) {
        onProgress(Math.min(i + CHUNK_SIZE, items.length));
      }
    }
  } catch (error: any) {
    const contextualError = new FirestorePermissionError({
      operation: 'write',
      path: `users/${userId}/inventory`,
      requestResourceData: { batch_size: items.length }
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
  }
}
