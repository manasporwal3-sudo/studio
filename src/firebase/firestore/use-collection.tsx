'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * 
 * IMPORTANT: Use stable references from useMemoFirebase.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: CollectionReference<DocumentData> | Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);
  
  // Track active listener to prevent SDK assertion failures during rapid re-renders
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup existing listener before starting a new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      unsubscribeRef.current = onSnapshot(
        memoizedTargetRefOrQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const results: WithId<T>[] = [];
          snapshot.forEach((doc) => {
            results.push({ ...(doc.data() as T), id: doc.id });
          });
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        async (err: FirestoreError) => {
          // Handle permission denied with contextual richness
          if (err.code === 'permission-denied') {
            const path = (memoizedTargetRefOrQuery as any).path || 'queried_collection';
            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path,
            });
            setError(contextualError);
            errorEmitter.emit('permission-error', contextualError);
          } else {
            setError(err);
          }
          setData(null);
          setIsLoading(false);
        }
      );
    } catch (e: any) {
      setError(e);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}