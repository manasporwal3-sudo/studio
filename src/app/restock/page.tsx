
'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProcurementAssistant } from "@/components/dashboard/procurement-assistant";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Terminal, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

function RestockContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { events } = useDarkStoreOS(storeId);
  const agentLogs = events.filter(e => e.type === 'restock' || e.type === 'alert');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-6 p-6 glass-panel rounded-2xl border-none">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tighter uppercase italic">Autonomous AI Agent</h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Zero-Latency Decision Framework</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcurementAssistant />
        
        <Card className="glass-panel border-none h-full">
          <CardHeader>
            <CardTitle className="text-md uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Live Agent Decision Stream
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/40 rounded-xl p-4 font-mono text-xs h-[500px] overflow-y-auto space-y-3 custom-scrollbar">
              {agentLogs.length === 0 && <p className="text-muted-foreground italic">Waiting for agent activity...</p>}
              {agentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 border-l-2 border-primary/20 pl-3 py-1">
                  <span className="text-primary/40">[{log.time}]</span>
                  <span className={cn(
                    "font-bold",
                    log.type === 'restock' ? "text-blue-400" : "text-amber-400"
                  )}>{log.type.toUpperCase()}:</span>
                  <span className="text-foreground/80">{log.msg}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RestockPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading AI Agent...</div>}>
        <RestockContent />
      </Suspense>
    </DashboardLayout>
  );
}
