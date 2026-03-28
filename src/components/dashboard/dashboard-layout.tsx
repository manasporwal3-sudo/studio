'use client';

import React, { Suspense } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Zap, 
  Radio, 
  Network, 
  Crosshair, 
  Activity, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Menu,
  Terminal,
  Cpu
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

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const navItems = [
    { name: 'Command Center', icon: <Zap className="w-4 h-4" />, href: '/dashboard' },
    { name: 'Store Onboarding', icon: <Radio className="w-4 h-4" />, href: '/onboarding' },
    { name: 'Rider Mesh', icon: <Network className="w-4 h-4" />, href: '/riders' },
    { name: 'Instrument Cluster', icon: <Crosshair className="w-4 h-4" />, href: '/rider-cluster' },
    { name: 'Predictive Brain', icon: <Cpu className="w-4 h-4" />, href: '/predictive' },
    { name: 'Agent Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
  ];

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Terminal className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Decorative Light Blooms */}
      <div className="radial-bloom bg-primary/10 w-[600px] h-[600px] -top-48 -left-48" />
      <div className="radial-bloom bg-accent/5 w-[400px] h-[400px] bottom-0 right-0" />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen z-50">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="font-headline font-extrabold tracking-tighter text-lg leading-none block">NEURO-FAST</span>
            <span className="text-[9px] font-mono text-primary/60 tracking-[0.3em] uppercase">Tactical OS v4.0</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <p className="text-[10px] font-mono font-bold text-muted-foreground mb-4 px-3 tracking-[0.2em] uppercase">Operation Modules</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={`${item.href}?store=${activeStoreId}`}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-all group relative cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-[0_0_10px_rgba(20,255,236,1)]" />}
                  <span className={cn("transition-transform duration-300 group-hover:scale-110", isActive && "text-primary glow-text-primary")}>
                    {item.icon}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest">{item.name}</span>
                  {isActive && <ChevronRight className="ml-auto w-3 h-3 animate-pulse" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full font-mono text-[10px] uppercase tracking-[0.2em] text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-3 h-3 mr-2" /> Terminate Uplink
          </Button>
        </div>
      </aside>

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-20 border-b border-white/5 flex items-center px-12 justify-between bg-black/20 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <Menu className="w-5 h-5 md:hidden text-muted-foreground" />
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-sm">
                <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">Active Node: {activeStoreId}</span>
              </div>
              <h2 className="font-headline text-sm font-extrabold uppercase tracking-[0.2em] text-muted-foreground/60">
                System_Link // <span className="text-foreground">{navItems.find(i => i.href === pathname)?.name || 'Command'}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="text-right">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Network Latency</span>
              <div className="text-xs font-mono text-secondary glow-text-secondary flex items-center justify-end gap-2">
                <Activity className="w-3 h-3" /> 1.2MS / STABLE
              </div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="w-8 h-8 border border-white/10 flex items-center justify-center relative">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
              <Zap className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 md:p-12 max-w-[1800px] mx-auto w-full">
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
        <Terminal className="w-8 h-8 text-primary animate-pulse" />
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
