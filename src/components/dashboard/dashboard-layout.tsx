'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Zap, 
  Network, 
  Crosshair, 
  Activity, 
  User as UserIcon, 
  LogOut,
  ChevronRight,
  Menu,
  Terminal,
  Cpu,
  Loader2,
  Package,
  BarChart3,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STORES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FloatingChatbot } from './floating-chatbot';

function NavLinks({ role, activeStoreId, pathname, onItemClick }: { role: string, activeStoreId: string, pathname: string, onItemClick?: () => void }) {
  const adminItems = [
    { name: 'Global Command', icon: <Globe className="w-4 h-4" />, href: '/admin/dashboard' },
    { name: 'Node Mesh', icon: <Network className="w-4 h-4" />, href: '/riders' },
    { name: 'Sovereign Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
  ];

  const storeItems = [
    { name: 'Neural Hub', icon: <Package className="w-4 h-4" />, href: '/darkstore/inventory' },
    { name: 'Rider Matrix', icon: <Network className="w-4 h-4" />, href: '/riders' },
    { name: 'Instrument Cluster', icon: <Crosshair className="w-4 h-4" />, href: '/rider-cluster' },
    { name: 'AI Insights', icon: <Activity className="w-4 h-4" />, href: '/insights' },
    { name: 'Node Account', icon: <UserIcon className="w-4 h-4" />, href: '/account' },
  ];

  const navItems = role === 'admin' ? adminItems : storeItems;

  return (
    <nav className="flex-1 space-y-1">
      <p className="text-[10px] font-mono font-bold text-muted-foreground mb-4 px-3 tracking-[0.3em] uppercase opacity-50">
        {role === 'admin' ? 'Strategic Command' : 'Operational Hub'}
      </p>
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
  const { user, userProfile, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const activeStoreId = searchParams.get('store') || STORES[0].id;
  const role = userProfile?.roleIds?.[0] || 'darkstore';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user && isMounted && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [user, isUserLoading, router, isMounted, pathname]);

  if (!isMounted || isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020810] gap-6">
        <Cpu className="w-12 h-12 text-primary animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-[0.6em] text-primary/60">Establishing Sovereign Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#020810] relative overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#00d4ff]/5 rounded-full blur-[200px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
      </div>

      <aside className="w-72 border-r border-white/5 bg-[#060d1c]/80 backdrop-blur-3xl hidden md:flex flex-col sticky top-0 h-screen z-50">
        <div className="p-10 flex items-center gap-5">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.25)] rounded-sm">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <span className="font-headline font-black tracking-tighter text-xl leading-none block text-white italic">NEURO·FAST</span>
            <span className="text-[9px] font-mono text-primary/60 tracking-[0.4em] uppercase mt-1">{role.toUpperCase()} APEX</span>
          </div>
        </div>

        <div className="flex-1 px-4 mt-12">
          <NavLinks role={role} activeStoreId={activeStoreId} pathname={pathname} />
        </div>

        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
          <Button 
            variant="ghost" 
            className="w-full font-mono text-[10px] uppercase tracking-[0.3em] text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-4 h-4 mr-3" /> Terminate Link
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 z-10 w-full relative">
        <header className="h-20 border-b border-white/5 flex items-center px-6 md:px-16 justify-between bg-[#060d1c]/40 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] bg-[#020810]/95 backdrop-blur-3xl border-r border-white/10 p-0 flex flex-col">
                <SheetHeader className="p-8 border-b border-white/5 flex flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center rounded-sm">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <SheetTitle className="font-headline font-black tracking-tighter text-base leading-none block text-white italic">NEURO·FAST</SheetTitle>
                    <span className="text-[9px] font-mono text-primary/60 tracking-[0.3em] uppercase">{role.toUpperCase()}</span>
                  </div>
                </SheetHeader>
                <div className="flex-1 px-4 py-8 overflow-y-auto">
                  <NavLinks role={role} activeStoreId={activeStoreId} pathname={pathname} onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-5">
              <div className="px-4 py-1.5 bg-primary/10 border border-primary/30 rounded-sm">
                <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">{activeStoreId}</span>
              </div>
              <h2 className="font-headline text-[11px] md:text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/60 line-clamp-1">
                <span className="text-white italic">{(pathname.split('/').pop() || 'Command').toUpperCase()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.4em]">Neural Latency</span>
              <div className="text-xs font-mono text-secondary glow-text-secondary flex items-center justify-end gap-2 font-bold mt-1">
                <Activity className="w-3.5 h-3.5" /> 0.8MS
              </div>
            </div>
            <div className="w-10 h-10 border border-white/10 flex items-center justify-center relative group cursor-pointer hover:border-primary/40 transition-colors rounded-sm">
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-secondary rounded-full" />
              <Zap className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-16 max-w-[1920px] mx-auto w-full relative">
          {children}
        </main>
        
        {user && pathname !== '/login' && pathname !== '/signup' && <FloatingChatbot />}
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020810] gap-4">
        <Terminal className="w-10 h-10 text-primary animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/40">Initializing Layout Node...</p>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}