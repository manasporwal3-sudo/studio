
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        const role = userProfile?.roleIds?.[0] || 'darkstore';
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Synchronizing Neural Link...</p>
      </div>
    </div>
  );
}
