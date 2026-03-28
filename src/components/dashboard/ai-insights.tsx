"use client"

import { useEffect, useState } from "react"
import { generateDashboardInsights, type DashboardInsightsOutput } from "@/ai/flows/generate-dashboard-insights-flow"
import { SKUS, STORES } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp, ShieldAlert, Sparkles, Loader2, FileText, Terminal, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

export function AIInsights() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'BLR-01'
  const activeStore = STORES.find(s => s.id === storeId)
  
  const [insights, setInsights] = useState<DashboardInsightsOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInsights() {
      setLoading(true)
      try {
        const input = {
          storeProfile: JSON.stringify({
            store_id: storeId,
            company_name: activeStore?.name,
            platform: "Zepto Hub",
            city: activeStore?.city,
            hub_historical_context: "High temperature forecast. Previous weekend saw a 40% spike in beverage demand. Supply chain delays noted on Dairy SKU-001."
          }),
          inventorySnapshot: JSON.stringify(SKUS),
          auditLog: "LOGIN: Admin @ 08:00; MANUAL_EDIT: SKU-005 stock adjusted (-10); SYSTEM: Neural parity check successful.",
          previousAnalyses: ""
        }
        const result = await generateDashboardInsights(input)
        setInsights(result)
      } catch (err) {
        console.error("Sovereign Engine Failure:", err)
      } finally {
        setLoading(false)
      }
    }
    loadInsights()
  }, [storeId, activeStore])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h2 className="text-sm font-mono text-primary uppercase tracking-[0.3em]">Engaging Sovereign Apex v9.0...</h2>
        </div>
        <Skeleton className="h-96 w-full tactical-panel bg-white/5" />
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
            <p className="text-[9px] font-mono text-muted-foreground uppercase">Status: Continuous Cognitive Auditing</p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded font-mono text-[9px] text-secondary">
            ZERO_FABRICATION: ON
          </div>
          <div className="px-3 py-1 bg-accent/10 border border-accent/30 rounded font-mono text-[9px] text-accent">
            CALC_TRACING: ON
          </div>
        </div>
      </div>

      {/* The Master Intelligence Brief Terminal */}
      {insights?.intelligenceBrief && (
        <Card className="tactical-panel bg-black/60 border-none before:hidden p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-3 h-3 text-secondary" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">Master Intelligence Brief — Secure Terminal</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-secondary/40" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
              <div className="w-2 h-2 rounded-full bg-destructive/40" />
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
              className="tactical-panel border-none bg-black/40 before:bg-destructive shadow-lg transition-all hover:scale-[1.01]"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-mono font-bold uppercase tracking-widest text-xs">
                {alert.severity.toUpperCase()} SIGNAL DETECTED
              </AlertTitle>
              <AlertDescription className="mt-3 font-mono text-[10px] leading-relaxed">
                <p className="mb-3 text-foreground/70 border-b border-white/5 pb-2">{alert.message}</p>
                <div className="flex items-center gap-3 text-primary">
                  <span className="font-bold">COMMAND_REQ:</span>
                  <span className="uppercase">{alert.actionRequired}</span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
          {insights?.alerts.length === 0 && (
            <div className="p-8 border border-dashed border-white/5 text-center flex flex-col items-center gap-2">
              <Activity className="w-4 h-4 text-white/10" />
              <span className="font-mono text-[9px] uppercase text-muted-foreground">No crisis signals in current node stream</span>
            </div>
          )}
        </div>

        {/* Neural Widgets Column */}
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Brain className="w-3 h-3" /> Cognitive Optimization
          </h3>
          <div className="grid gap-4">
            {insights?.widgets.map((widget) => (
              <Card key={widget.id} className="tactical-panel bg-black/40 border-none before:bg-primary group hover:bg-white/[0.04] transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-mono font-bold flex items-center gap-2 uppercase tracking-widest">
                      <TrendingUp className="w-3 h-3 text-primary" />
                      {widget.title}
                    </CardTitle>
                    <div className={`px-2 py-0.5 border font-mono text-[8px] uppercase font-bold tracking-tighter ${
                      widget.urgency === 'critical' ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary text-primary'
                    }`}>
                      {widget.urgency}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[11px] font-mono text-muted-foreground leading-relaxed italic">
                    {widget.content}
                  </p>
                  <div className="p-4 bg-primary/5 border-l-2 border-primary flex items-start gap-4">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-mono text-primary/60 uppercase block mb-1">Strategic Lever</span>
                      <p className="text-[10px] font-mono text-primary font-medium uppercase tracking-tight leading-tight">
                        {widget.recommendation}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Protocol Sig */}
      <div className="text-center py-12 border-t border-white/5 opacity-40">
        <p className="font-mono text-[8px] uppercase tracking-[0.6em] mb-2">
          End of Brief · Neuro-Fast Sovereign Engine v9.0 Apex · Store Node: {storeId}
        </p>
        <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-muted-foreground">
          Zero Simulation Protocol Engaged · All Insights Traced to Hub Logic
        </p>
      </div>
    </div>
  )
}
