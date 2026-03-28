'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useUser, useAuth } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, LogOut } from "lucide-react";

export default function AccountPage() {
  const { user } = useUser();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleString());
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="glass-panel border-none overflow-hidden">
          <CardHeader className="bg-primary/10 pb-6 md:pb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary flex items-center justify-center text-2xl md:text-3xl font-bold shadow-2xl">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl md:text-3xl font-bold font-headline tracking-tighter uppercase italic">
                  {user?.email?.split('@')[0] || 'Neural Agent'}
                </CardTitle>
                <CardDescription className="text-[10px] uppercase tracking-widest font-bold text-primary">
                  Authorized Node Operator
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 md:pt-8 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Identity Protocol</p>
                  <p className="text-xs font-mono truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Last Synchronization</p>
                  <p className="text-xs font-mono">
                    {mounted ? currentTime : 'Syncing...'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full h-12 font-bold uppercase tracking-widest text-[10px] md:text-xs"
              onClick={() => auth.signOut()}
            >
              <LogOut className="w-4 h-4 mr-2" /> Terminate Node Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
