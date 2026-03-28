"use client"

import { useEffect, useState, useCallback } from "react"
import { generateDashboardInsights, type DashboardInsightsOutput } from "@/ai/flows/generate-dashboard-insights-flow"
import { useDarkStoreOS } from "@/hooks/use-darkstore-os"
import { useUser } from "@/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp, ShieldAlert, Sparkles, Loader2, Terminal, Activity, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export function AIInsights() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'PRIMARY-NODE'
  const { user, userProfile } = useUser()
  const { inventory, isLoading: isInventoryLoading } = useDarkStoreOS(user?.uid || '')
  
  const [insights, setInsights] = useState<DashboardInsightsOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInsights = useCallback(async () => {
    if (inventory.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const input = {
        storeProfile: JSON.stringify({
          store_id: storeId,
          company_name: userProfile?.storeName || "AUTHORIZED HUB",
          platform: "SOVEREIGN APEX NODE",
          city: userProfile?.city || "Sovereign Hub",
          hub_historical_context: "Autonomous audit active. Zero simulation mode engaged."
        }),
        inventorySnapshot: JSON.stringify(inventory),
        auditLog: "SYSTEM: Zero-simulation mode initialized. Node parity check passed.",
        previousAnalyses: ""
      }
      const result = await generateDashboardInsights(input)
      setInsights(result)
    } catch (err: any) {
      console.error("Sovereign Engine Failure:", err)
      setError(err.message || "Failed to establish neural link with Sovereign Engine.")
    } finally {
      setLoading(false)
    }
  }, [storeId, userProfile, inventory])

  useEffect(() => {
    if (!isInventoryLoading) {
      loadInsights()
    }
  }, [isInventoryLoading, loadInventoryData => loadInsights()])

  if (loading || isInventoryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h2 className="text-sm font-mono text-primary uppercase tracking-[0.3em]">Auditing Live Node Mesh...</h2>
        </div>
        <Skeleton className="h-96 w-full tactical-panel bg-white/5" />
      </div>
    )
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 tactical-panel bg-white/5">
        <Terminal className="w-12 h-12 text-muted-foreground opacity-20" />
        <div className="text-center space-y-2">
          <h2 className="font-headline text-lg text-muted-foreground uppercase tracking-widest">Inventory Empty</h2>
          <p className="font-mono text-xs text-muted-foreground/60">No SKUs detected in the local node. AI requires telemetry to function.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 tactical-panel bg-destructive/5 border-destructive/20">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center space-y-2">
          <h2 className="font-headline text-lg text-destructive uppercase tracking-widest">Neural Link Interrupted</h2>
          <p className="font-mono text-xs text-muted-foreground">{error}</p>
        </div>
        <Button onClick={loadInsights} variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-destructive/20 hover:bg-destructive/10">
          <RefreshCw className="w-3 h-3 mr-2" /> Attempt Re-sync
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Protocol Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em]">Sovereign Engine v9.0 Apex Active</h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase">Status: Zero Simulation Mode Enabled</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded font-mono text-[9px] text-secondary">
            TRACED_TO_LIVE_NODE: ON
          </div>
        </div>
      </div>

      {/* The Master Intelligence Brief Terminal */}
      {insights?.intelligenceBrief && (
        <Card className="tactical-panel bg-black/60 border-none before:hidden p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-3 h-3 text-secondary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">Master Intelligence Brief — LIVE DATA</span>
            </div>
          </div>
          <CardContent className="p-8">
            <div className="font-mono text-[11px] text-foreground/90 leading-relaxed whitespace-pre-wrap selection:bg-secondary/30">
              {insights.intelligenceBrief}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visual Triage Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts Column */}
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" /> Tactical Crisis Signals
          </h3>
          {insights?.alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              variant={alert.severity === 'critical' || alert.severity === 'error' ? 'destructive' : 'default'}
              className="tactical-panel border-none bg-black/40 before:bg-destructive shadow-lg"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-mono font-bold uppercase tracking-widest text-xs">
                {alert.severity.toUpperCase()} SIGNAL
              </AlertTitle>
              <AlertDescription className="mt-3 font-mono text-[10px] leading-relaxed">
                <p className="mb-3 text-foreground/70">{alert.message}</p>
                <div className="flex items-center gap-3 text-primary">
                  <span className="font-bold">COMMAND:</span>
                  <span className="uppercase">{alert.actionRequired}</span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        {/* Neural Widgets Column */}
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Brain className="w-3 h-3" /> Cognitive Optimization
          </h3>
          <div className="grid gap-4">
            {insights?.widgets.map((widget) => (
              <Card key={widget.id} className="tactical-panel bg-black/40 border-none before:bg-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono font-bold flex items-center gap-2 uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    {widget.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[11px] font-mono text-muted-foreground leading-relaxed italic">
                    {widget.content}
                  </p>
                  <div className="p-4 bg-primary/5 border-l-2 border-primary">
                    <p className="text-[10px] font-mono text-primary font-medium uppercase">
                      Recommendation: {widget.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
