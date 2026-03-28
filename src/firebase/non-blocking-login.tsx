'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in (non-blocking). 
 * Returns the promise so the caller can attach a .catch() if desired.
 */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up (non-blocking). 
 * Returns the promise so the caller can attach a .catch() if desired.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate email/password sign-in (non-blocking). 
 * Returns the promise so the caller can attach a .catch() if desired.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  return signInWithEmailAndPassword(authInstance, email, password);
}
