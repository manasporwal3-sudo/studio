"use client"

import { useEffect, useState } from "react"
import { generateDashboardInsights, type DashboardInsightsOutput } from "@/ai/flows/generate-dashboard-insights-flow"
import { SKUS } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp, ShieldAlert, Sparkles, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function AIInsights() {
  const [insights, setInsights] = useState<DashboardInsightsOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInsights() {
      try {
        const input = {
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
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full glass-panel" />
        <Skeleton className="h-40 w-full glass-panel" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <h2 className="text-lg font-semibold text-primary uppercase tracking-widest">Generative Intelligence</h2>
      </div>

      <div className="grid gap-4">
        {insights?.alerts.map((alert) => (
          <Alert 
            key={alert.id} 
            variant={alert.severity === 'critical' ? 'destructive' : 'default'}
            className="glass-panel border-l-4 border-l-destructive"
          >
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle className="font-bold">{alert.severity === 'critical' ? 'CRITICAL ALERT' : 'System Notice'}</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">{alert.message}</p>
              <div className="p-2 bg-black/20 rounded border border-white/5 text-xs font-mono">
                ACTION: {alert.actionRequired}
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      <div className="grid gap-4">
        {insights?.widgets.map((widget) => (
          <Card key={widget.id} className="glass-panel overflow-hidden border-none group hover:bg-white/[0.03] transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  {widget.title}
                </CardTitle>
                <div className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  widget.urgency === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                }`}>
                  {widget.urgency}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {widget.content}
              </p>
              <div className="p-3 bg-primary/5 rounded border border-primary/10 flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary font-medium">{widget.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
