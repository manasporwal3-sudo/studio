
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2, Cpu } from 'lucide-react';

export default function RootPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Correctly route based on the 'role' field in the user document
        const role = userProfile?.role || 'store';
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/darkstore/inventory');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, userProfile, isUserLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020810] gap-6">
      <div className="relative">
        <Cpu className="w-12 h-12 text-primary animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
      </div>
      <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.6em] animate-pulse">
        Synchronizing Neural Link...
      </p>
    </div>
  );
}
