'use client';

import React from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Brain, 
  Database, 
  TrendingUp, 
  ShoppingCart, 
  Sparkles, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const navItems = [
    { name: 'Inventory Sync', icon: <Database className="w-4 h-4" />, href: '/inventory' },
    { name: 'Velocity Trends', icon: <TrendingUp className="w-4 h-4" />, href: '/trends' },
    { name: 'Restock Agent', icon: <ShoppingCart className="w-4 h-4" />, href: '/restock' },
    { name: 'AI Intelligence', icon: <Sparkles className="w-4 h-4" />, href: '/insights' },
    { name: 'My Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
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

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
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
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/20 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
              {user.email?.[0].toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold truncate uppercase">{user.email?.split('@')[0] || 'Agent'}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Active Link</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
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
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Node Latency</span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 14MS
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
