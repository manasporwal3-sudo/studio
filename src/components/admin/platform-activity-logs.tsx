
'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Terminal, Plus, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Platform Activity Logs - Global Event Stream
 */
export function PlatformActivityLogs() {
  const db = useFirestore();

  // Properly memoized using useMemoFirebase to prevent runtime errors
  const logsQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'platform_activity'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [db]);

  const { data: logs, isLoading } = useCollection(logsQuery);

  return (
    <Card className="tactical-panel border-none bg-black/40 h-[400px] overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Neural Event Stream</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-[10px] space-y-4">
          {isLoading ? (
            <p className="text-muted-foreground/40 animate-pulse">Syncing events...</p>
          ) : !logs || logs.length === 0 ? (
            <p className="text-muted-foreground/40 italic">Awaiting node activity signals...</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-4 group">
                <span className="text-muted-foreground/30 whitespace-nowrap">
                  {log.timestamp ? formatDistanceToNow(typeof log.timestamp.toDate === 'function' ? log.timestamp.toDate() : new Date(log.timestamp)) : 'now'}
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold uppercase",
                      log.type === 'signup' ? 'text-primary' : 
                      log.type === 'order' ? 'text-secondary' : 
                      'text-accent'
                    )}>
                      [{log.type}]
                    </span>
                    <span className="text-white/80">{log.message}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground/60 leading-relaxed italic">
                    Node: {log.storeId || 'GLOBAL'} // Impact: {log.impact || 'Nominal'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
