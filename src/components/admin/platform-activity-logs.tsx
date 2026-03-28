'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Terminal, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformActivityLogs() {
  const db = useFirestore();
  const { user, userProfile } = useUser();

  const logsQuery = useMemoFirebase(() => {
    // Defensive check: Ensure user is an admin before firing query
    if (!user || userProfile?.role !== 'admin') return null;
    return query(
      collection(db, 'platform_activity'),
      orderBy('timestamp', 'desc'),
      limit(30)
    );
  }, [db, user, userProfile?.role]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  return (
    <Card className="tactical-panel border-none bg-black/40 h-[380px] overflow-hidden flex flex-col">
      <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-3 h-3 text-muted-foreground" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Neural Event Stream</span>
        </div>
        {isLoading && <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />}
      </div>
      
      <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-[9px] space-y-3">
        {isLoading && (!logs || logs.length === 0) ? (
          <p className="text-muted-foreground/20 animate-pulse">Establishing uplink...</p>
        ) : !logs || logs.length === 0 ? (
          <p className="text-muted-foreground/20 italic uppercase tracking-widest text-center mt-20">Awaiting node signals...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4 group border-l border-white/5 pl-2 py-0.5 hover:border-primary/40 transition-colors">
              <span className="text-muted-foreground/30 whitespace-nowrap tabular-nums">
                {log.timestamp ? formatDistanceToNow(typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate() : new Date(log.timestamp), { addSuffix: false }).toUpperCase() : 'NOW'}
              </span>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "font-bold uppercase tracking-widest",
                    log.type === 'signup' ? 'text-primary' : 
                    log.type === 'order' ? 'text-secondary' : 
                    log.type === 'alert' ? 'text-destructive' :
                    'text-accent'
                  )}>
                    [{log.type}]
                  </span>
                  <span className="text-white/70 leading-relaxed">{log.message}</span>
                </div>
                {log.storeId && (
                  <p className="text-[7px] text-muted-foreground/40 mt-0.5 uppercase tracking-tighter">
                    NODE_ID: {log.storeId} // IMPACT: {log.impact || 'NOMINAL'}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}