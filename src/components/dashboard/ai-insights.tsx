
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
import { motion, AnimatePresence } from "framer-motion"

export function AIInsights() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'PRIMARY-NODE'
  const { user, userProfile } = useUser()
  const { inventory, isLoading: isInventoryLoading } = useDarkStoreOS(user?.uid || '')
  
  const [insights, setInsights] = useState<DashboardInsightsOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

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
          city: userProfile?.city || "Sovereign Hub"
        }),
        inventorySnapshot: JSON.stringify(inventory),
        auditLog: "SYSTEM: Neural parity check passed. Zero fabrication mode engaged.",
        previousAnalyses: ""
      }
      const result = await generateDashboardInsights(input)
      setInsights(result)
      
      // Trigger typing animation
      setIsTyping(true)
      setDisplayedText("")
      let i = 0
      const fullText = result.intelligenceBrief
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + fullText.charAt(i))
        i++
        if (i >= fullText.length) {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, 5)
    } catch (err: any) {
      setError(err.message || "Uplink to Sovereign Engine timed out.")
    } finally {
      setLoading(false)
    }
  }, [storeId, userProfile, inventory])

  useEffect(() => {
    if (!isInventoryLoading) {
      loadInsights()
    }
  }, [isInventoryLoading]);

  if (loading || isInventoryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h2 className="text-sm font-mono text-primary uppercase tracking-[0.3em]">Auditing Node Matrix...</h2>
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
          <h2 className="font-headline text-lg text-muted-foreground uppercase tracking-widest">Inventory Mesh Empty</h2>
          <p className="font-mono text-xs text-muted-foreground/60">AI requires telemetry to function. Deploy SKUs to activate.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 tactical-panel bg-destructive/5 border-destructive/20">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="font-mono text-xs text-muted-foreground">{error}</p>
        <Button onClick={loadInsights} variant="outline" className="font-mono text-[10px] border-destructive/20">RE-SYNC</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-primary uppercase tracking-[0.4em]">Sovereign Engine Active</h2>
            <p className="text-[9px] font-mono text-muted-foreground uppercase">Mode: Real-time Telemetry Analysis</p>
          </div>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="font-mono text-[8px] tracking-widest border-primary/20 hover:bg-primary/5 uppercase">
          <TrendingUp className="w-3 h-3 mr-2" /> Stockout Risks
        </Button>
        <Button variant="outline" size="sm" className="font-mono text-[8px] tracking-widest border-secondary/20 hover:bg-secondary/5 uppercase">
          <Sparkles className="w-3 h-3 mr-2" /> Margin Boost
        </Button>
        <Button variant="outline" size="sm" className="font-mono text-[8px] tracking-widest border-accent/20 hover:bg-accent/5 uppercase">
          <ShieldAlert className="w-3 h-3 mr-2" /> Fleet Health
        </Button>
      </div>

      <Card className="tactical-panel bg-black/60 border-none before:hidden p-0 overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-3 h-3 text-secondary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-secondary">Intelligence Brief — LIVE MESH</span>
          </div>
          {isTyping && <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />}
        </div>
        <CardContent className="p-8">
          <div className="font-mono text-[11px] text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="w-3 h-3" /> Tactical Crisis Signals
          </h3>
          {insights?.alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
              className="tactical-panel border-none bg-black/40 before:bg-destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-mono font-bold uppercase tracking-widest text-xs">{alert.severity} Signal</AlertTitle>
              <AlertDescription className="mt-2 font-mono text-[10px] text-foreground/70">
                {alert.message}
                <div className="mt-2 text-primary uppercase">Action: {alert.actionRequired}</div>
              </AlertDescription>
            </Alert>
          ))}
        </div>

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
                <CardContent>
                  <p className="text-[11px] font-mono text-muted-foreground italic mb-4">{widget.content}</p>
                  <div className="p-3 bg-primary/5 border-l border-primary">
                    <p className="text-[9px] font-mono text-primary uppercase">Recommendation: {widget.recommendation}</p>
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
