'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useUser, useAuth } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Key, Clock, LogOut } from "lucide-react";

export default function AccountPage() {
  const { user } = useUser();
  const auth = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="glass-panel border-none overflow-hidden">
          <CardHeader className="bg-primary/10 pb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-3xl font-bold shadow-2xl">
                {user?.email?.[0].toUpperCase() || 'A'}
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-bold font-headline tracking-tighter uppercase">
                  {user?.email?.split('@')[0] || 'Neural Agent'}
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-primary">
                  Authorized Node Operator
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Identity Protocol</p>
                  <p className="text-sm font-mono">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Key className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Neural ID</p>
                  <p className="text-xs font-mono opacity-50">{user?.uid}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Last Synchronization</p>
                  <p className="text-sm font-mono">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              className="w-full h-12 font-bold uppercase tracking-widest"
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
