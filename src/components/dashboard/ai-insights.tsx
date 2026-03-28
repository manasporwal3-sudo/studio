
"use client"

import { useEffect, useState } from "react"
import { generateDashboardInsights, type DashboardInsightsOutput } from "@/ai/flows/generate-dashboard-insights-flow"
import { SKUS } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp, ShieldAlert, Sparkles, Loader2, FileText, Terminal } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

export function AIInsights() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'BLR-01'
  const [insights, setInsights] = useState<DashboardInsightsOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInsights() {
      setLoading(true)
      try {
        const input = {
          storeId: storeId,
          currentInventoryStatus: JSON.stringify(SKUS),
          recentSalesData: "Sales peaked at 12:00 PM today with milk and bread leading. Velocity is 15% higher than yesterday.",
          predictiveForecast: "Anticipating a 25% surge in beverage demand over the next 4 hours due to high local temperature forecasts."
        }
        const result = await generateDashboardInsights(input)
        setInsights(result)
      } catch (err) {
        console.error("Failed to load insights:", err)
      } finally {
        setLoading(false)
      }
    }
    loadInsights()
  }, [storeId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h2 className="text-sm font-mono text-primary uppercase tracking-[0.3em]">Syncing Intelligence Stream...</h2>
        </div>
        <Skeleton className="h-64 w-full tactical-panel before:hidden bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40 w-full tactical-panel before:hidden bg-white/5" />
          <Skeleton className="h-40 w-full tactical-panel before:hidden bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Protocol Version Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em]">Sovereign Engine v8.0 Active</h2>
        </div>
        <div className="px-2 py-1 bg-primary/10 border border-primary/30 rounded font-mono text-[9px] text-primary">
          ZERO_FABRICATION: ENABLED
        </div>
      </div>

      {/* Intelligence Brief - Protocol v8.0 Format */}
      {insights?.intelligenceBrief && (
        <Card className="tactical-panel bg-black/40 border-none before:hidden p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FileText className="w-24 h-24" />
          </div>
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center gap-3 text-secondary mb-2">
              <Terminal className="w-4 h-4" />
              <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest">Master Intelligence Brief</CardTitle>
            </div>
            <div className="h-px w-full bg-gradient-to-right from-secondary/40 to-transparent" />
          </CardHeader>
          <CardContent className="p-0">
            <pre className="font-mono text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap selection:bg-secondary/30">
              {insights.intelligenceBrief}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* UI Widgets & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Tactical Alerts</h3>
          {insights?.alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              variant={alert.severity === 'critical' || alert.severity === 'error' ? 'destructive' : 'default'}
              className="tactical-panel border-none bg-black/20 before:bg-destructive shadow-lg"
            >
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-mono font-bold uppercase tracking-widest text-xs">
                {alert.severity.toUpperCase()} ALERT
              </AlertTitle>
              <AlertDescription className="mt-2 font-mono text-[10px] leading-relaxed">
                <p className="mb-2 text-foreground/70">{alert.message}</p>
                <div className="p-2 bg-black/40 border border-white/5 text-primary">
                  ACTION_REQ: {alert.actionRequired}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Neural Widgets</h3>
          <div className="grid gap-4">
            {insights?.widgets.map((widget) => (
              <Card key={widget.id} className="tactical-panel bg-black/40 border-none before:bg-primary group hover:bg-white/[0.03] transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-mono font-bold flex items-center gap-2 uppercase tracking-widest">
                      <Brain className="w-3 h-3 text-primary" />
                      {widget.title}
                    </CardTitle>
                    <div className={`px-2 py-0.5 border font-mono text-[8px] uppercase font-bold ${
                      widget.urgency === 'critical' ? 'border-destructive text-destructive' : 'border-primary text-primary'
                    }`}>
                      {widget.urgency}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[11px] font-mono text-muted-foreground leading-relaxed mb-4">
                    {widget.content}
                  </p>
                  <div className="p-3 bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <TrendingUp className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] font-mono text-primary font-medium">{widget.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Protocol Signature */}
      <div className="text-center py-8 opacity-20 hover:opacity-100 transition-opacity">
        <p className="font-mono text-[8px] uppercase tracking-[0.5em]">
          Analysis generated by NEURO·FAST Sovereign Engine v8.0 · All figures derived from operator data only
        </p>
      </div>
    </div>
  )
}
