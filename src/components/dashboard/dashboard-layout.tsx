
'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
  Cpu,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

function NavLinks({ activeStoreId, pathname, onItemClick }: { activeStoreId: string, pathname: string, onItemClick?: () => void }) {
  const navItems = [
    { name: 'Command Center', icon: <Zap className="w-4 h-4" />, href: '/dashboard' },
    { name: 'Store Onboarding', icon: <Radio className="w-4 h-4" />, href: '/onboarding' },
    { name: 'Rider Mesh', icon: <Network className="w-4 h-4" />, href: '/riders' },
    { name: 'Instrument Cluster', icon: <Crosshair className="w-4 h-4" />, href: '/rider-cluster' },
    { name: 'Predictive Brain', icon: <Cpu className="w-4 h-4" />, href: '/predictive' },
    { name: 'Neural Insights', icon: <Activity className="w-4 h-4" />, href: '/insights' },
    { name: 'Agent Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
  ];

  return (
    <nav className="flex-1 space-y-1">
      <p className="text-[10px] font-mono font-bold text-muted-foreground mb-4 px-3 tracking-[0.3em] uppercase opacity-50">Cognitive Modules</p>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={`${item.href}?store=${activeStoreId}`} onClick={onItemClick}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 transition-all group relative cursor-pointer",
              isActive 
                ? "bg-primary/10 text-primary border-r-2 border-primary" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}>
              <span className={cn("transition-transform duration-300 group-hover:scale-110", isActive && "text-primary glow-text-primary")}>
                {item.icon}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest">{item.name}</span>
              {isActive && <ChevronRight className="ml-auto w-3 h-3 animate-pulse" />}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const activeStoreId = searchParams.get('store') || STORES[0].id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && isMounted) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, isMounted]);

  if (!isMounted || isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Terminal className="w-10 h-10 text-primary animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-primary/60">Establishing Sovereign Link...</p>
      </div>
    );
  }

  // Fallback for redirecting state
  if (!user && pathname !== '/login') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Redirecting to Access Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background relative overflow-x-hidden">
      {/* Cinematic Ambient Backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen z-50">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <span className="font-headline font-extrabold tracking-tighter text-lg leading-none block">NEURO·FAST</span>
            <span className="text-[9px] font-mono text-primary/60 tracking-[0.3em] uppercase">SOVEREIGN v9.0</span>
          </div>
        </div>

        <div className="flex-1 px-4 mt-8">
          <NavLinks activeStoreId={activeStoreId} pathname={pathname} />
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="mb-4 p-4 bg-primary/5 border border-white/5 rounded-sm">
             <div className="flex items-center justify-between mb-1">
               <span className="font-mono text-[8px] text-muted-foreground uppercase">Neural Health</span>
               <span className="font-mono text-[8px] text-primary uppercase">99.8%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary" style={{ width: '99.8%' }} />
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full font-mono text-[10px] uppercase tracking-[0.2em] text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-3 h-3 mr-2" /> Terminate Uplink
          </Button>
        </div>
      </aside>

      {/* Main Command View */}
      <div className="flex-1 flex flex-col min-w-0 z-10 w-full">
        <header className="h-16 md:h-20 border-b border-white/5 flex items-center px-4 md:px-12 justify-between bg-black/20 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-background/95 backdrop-blur-xl border-r border-white/10 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-white/5 flex flex-row items-center gap-4">
                  <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <SheetTitle className="font-headline font-extrabold tracking-tighter text-sm leading-none block">NEURO·FAST</SheetTitle>
                    <span className="text-[8px] font-mono text-primary/60 tracking-[0.2em] uppercase">APEX v9.0</span>
                  </div>
                </SheetHeader>
                <div className="flex-1 px-4 py-6 overflow-y-auto">
                  <NavLinks activeStoreId={activeStoreId} pathname={pathname} onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
                <div className="p-6 border-t border-white/5 space-y-4">
                  <Button 
                    variant="ghost" 
                    className="w-full font-mono text-[10px] uppercase tracking-[0.2em] text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      auth.signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-3 h-3 mr-2" /> Terminate Uplink
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="px-2 md:px-3 py-1 bg-primary/10 border border-primary/30 rounded-sm">
                <span className="font-mono text-[8px] md:text-[10px] text-primary font-bold uppercase tracking-widest">{activeStoreId}</span>
              </div>
              <h2 className="font-headline text-[10px] md:text-sm font-extrabold uppercase tracking-[0.1em] md:tracking-[0.2em] text-muted-foreground/60 line-clamp-1">
                <span className="hidden xs:inline">Hub_Link // </span><span className="text-foreground">{(pathname.split('/').pop() || 'Command').toUpperCase()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-8">
             <div className="text-right hidden sm:block">
              <span className="text-[8px] md:text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.3em]">Neural Latency</span>
              <div className="text-[10px] md:text-xs font-mono text-secondary glow-text-secondary flex items-center justify-end gap-2">
                <Activity className="w-3 h-3" /> 1.2MS
              </div>
            </div>
            <div className="h-6 md:h-8 w-px bg-white/5 hidden sm:block" />
            <div className="flex items-center gap-2 md:gap-3">
              <div className="px-2 md:px-3 py-1 bg-accent/10 border border-accent/30 rounded-sm hidden xs:block">
                <span className="font-mono text-[8px] md:text-[9px] text-accent font-bold uppercase">Apex v9.0</span>
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 border border-white/10 flex items-center justify-center relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-12 max-w-[1800px] mx-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Terminal className="w-8 h-8 text-primary animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary/40">Initializing Layout Node...</p>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
