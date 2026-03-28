
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Package, Fingerprint, Activity, Cpu, Info, UserPlus, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StoreLoginForm } from '@/components/auth/StoreLoginForm';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type PortalType = 'selection' | 'store' | 'admin';

export default function LoginPage() {
  const [portal, setPortal] = useState<PortalType>('selection');
  const [mounted, setMounted] = useState(false);
  const { user, userProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (user && userProfile) {
      router.push(userProfile.role === 'admin' ? '/admin/dashboard' : '/darkstore/inventory');
    }
  }, [user, userProfile, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#020810] flex flex-col items-center justify-center p-4 overflow-hidden relative font-mono">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#14ffec_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
      </div>

      {/* System HUD */}
      <div className="fixed top-8 right-8 flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-sm backdrop-blur-md">
        <div className="flex flex-col items-end">
          <span className="text-[8px] uppercase tracking-widest text-muted-foreground">Network Integrity</span>
          <div className="flex items-center gap-2 text-[10px] text-secondary font-bold">
            <Activity className="w-3 h-3 animate-pulse" /> SYSTEM STATUS: ONLINE
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 border border-primary/40 flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(20,255,236,0.2)]">
            <Fingerprint className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-black tracking-tighter text-white italic uppercase">NEURO·FAST</h1>
            <p className="text-[9px] uppercase tracking-[0.5em] text-primary/60 font-bold">Sovereign Master Gateway</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
          <AnimatePresence mode="wait">
            {portal === 'selection' ? (
              <>
                <motion.div
                  key="store-node"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setPortal('store')}
                  className="cursor-pointer"
                >
                  <Card className="h-full tactical-panel group hover:bg-primary/5 transition-all border-white/10 bg-black/40">
                    <CardContent className="p-12 flex flex-col items-center text-center justify-center h-full space-y-6">
                      <div className="w-20 h-20 bg-primary/10 border border-primary/20 flex items-center justify-center rounded-3xl group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                        <Package className="w-10 h-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white">Store Node Access</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed px-4">
                          Operational Hub for Dark Store Management, SKU Monitoring, and Fleet Logistics.
                        </p>
                      </div>
                      <div className="text-[8px] font-mono text-primary/40 uppercase tracking-[0.4em] group-hover:text-primary transition-colors">
                        [ INITIATE OPERATOR LINK ]
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  key="admin-node"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setPortal('admin')}
                  className="cursor-pointer"
                >
                  <Card className="h-full tactical-panel group hover:bg-destructive/5 transition-all border-white/10 bg-black/40 before:bg-destructive/60">
                    <CardContent className="p-12 flex flex-col items-center text-center justify-center h-full space-y-6">
                      <div className="w-20 h-20 bg-destructive/10 border border-destructive/20 flex items-center justify-center rounded-3xl group-hover:scale-110 group-hover:bg-destructive/20 transition-all">
                        <Shield className="w-10 h-10 text-destructive" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="font-headline text-2xl font-black uppercase tracking-tighter text-white">Terminal Admin Access</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed px-4">
                          Strategic Oversight, Global Telemetry, and Sovereign Platform Controls.
                        </p>
                      </div>
                      <div className="text-[8px] font-mono text-destructive/40 uppercase tracking-[0.4em] group-hover:text-destructive transition-colors">
                        [ ESTABLISH MASTER UPLINK ]
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-1 md:col-span-2 flex justify-center"
              >
                <Card className="w-full max-w-md tactical-panel bg-black/60 border-primary/20 p-8 shadow-2xl backdrop-blur-3xl">
                  {portal === 'store' ? (
                    <StoreLoginForm onBack={() => setPortal('selection')} />
                  ) : (
                    <AdminLoginForm onBack={() => setPortal('selection')} />
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-sm flex items-start gap-3 max-w-md">
            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[9px] font-mono text-primary uppercase tracking-widest font-bold">Sovereign Master Node Access</p>
              <p className="text-[8px] font-mono text-muted-foreground uppercase leading-relaxed">
                ADMIN: admin@neurofast.io // KEY: Manas 123 <br/>
                These master credentials will auto-provision the admin terminal on first use.
              </p>
            </div>
          </div>
          
          <Link href="/signup">
            <Button variant="ghost" className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary hover:bg-primary/10">
              <UserPlus className="w-4 h-4 mr-2" /> Initiate Node Enrollment
            </Button>
          </Link>

          <p className="text-[8px] text-muted-foreground/30 uppercase tracking-[0.4em] font-mono">
            NEURO-FAST SOVEREIGN GATEWAY // QUANTUM KEY ENCRYPTION ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}
