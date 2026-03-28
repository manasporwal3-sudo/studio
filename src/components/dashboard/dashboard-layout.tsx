
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  ShoppingCart, 
  Sparkles, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Menu,
  Zap,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const activeStoreId = searchParams.get('store') || STORES[0].id;
  const activeStore = STORES.find(s => s.id === activeStoreId) || STORES[0];

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleStoreChange = (storeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('store', storeId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const navItems = [
    { name: 'Live Control', icon: <Zap className="w-4 h-4" />, href: '/dashboard' },
    { name: 'Inventory Brain', icon: <Database className="w-4 h-4" />, href: '/inventory' },
    { name: 'Demand Oracle', icon: <TrendingUp className="w-4 h-4" />, href: '/trends' },
    { name: 'Profit Engine', icon: <DollarSign className="w-4 h-4" />, href: '/profit' },
    { name: 'AI Agent', icon: <Brain className="w-4 h-4" />, href: '/restock' },
    { name: 'Neural Insights', icon: <Sparkles className="w-4 h-4" />, href: '/insights' },
    { name: 'Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
  ];

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Brain className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 glass-panel hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold tracking-tighter text-sm">NEURO-FAST</span>
        </div>

        <div className="px-4 mb-6">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-2 tracking-widest">Active Nodes</p>
          <div className="space-y-1">
            {STORES.map(store => (
              <button
                key={store.id}
                onClick={() => handleStoreChange(store.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  activeStoreId === store.id 
                    ? "bg-primary/20 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                <MapPin className="w-3 h-3" />
                {store.name}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
           <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-2 tracking-widest">Control Panels</p>
          {navItems.map((item) => {
            const hrefWithStore = `${item.href}?store=${activeStoreId}`;
            return (
              <Link key={item.href} href={hrefWithStore}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                  pathname === item.href 
                    ? "bg-primary/20 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  {item.icon}
                  {item.name}
                  {pathname === item.href && <ChevronRight className="ml-auto w-3 h-3" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-3 h-3 mr-2" /> Disconnect Node
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between glass-panel sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Menu className="w-5 h-5 md:hidden text-muted-foreground" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">{activeStore.id}</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {activeStore.name} // {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Pulse</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 100% OPERATIONAL
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Brain className="w-8 h-8 text-primary animate-pulse" />
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
