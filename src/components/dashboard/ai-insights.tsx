"use client"

import { useEffect, useState, useCallback } from "react"
import { generateDashboardInsights, type DashboardInsightsOutput } from "@/ai/flows/generate-dashboard-insights-flow"
import { useDarkStoreOS } from "@/hooks/use-darkstore-os"
import { useUser } from "@/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertCircle, TrendingUp, ShieldAlert, Sparkles, Loader2, Terminal, Activity, BarChart3, LineChart } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

export function AIInsights() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'PRIMARY-NODE'
  const { user, userProfile } = useUser()
  const { inventory, revenue, isLoading: isInventoryLoading } = useDarkStoreOS(user?.uid || '')
  
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
          city: userProfile?.city || "Sovereign Hub",
          total_realized_revenue: revenue
        }),
        inventorySnapshot: JSON.stringify(inventory.sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0)).slice(0, 20)),
        auditLog: `SYSTEM: Autonomous Demand Engine active. Real-time realized revenue: ${revenue}. Neural parity check passed.`,
        previousAnalyses: ""
      }
      const result = await generateDashboardInsights(input)
      setInsights(result)
      
      // Trigger typing animation for the brief
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
  }, [storeId, userProfile, inventory, revenue])

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
    <div className="space-y-10 pb-24">
      {/* Header Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-headline font-bold text-primary uppercase tracking-[0.4em]">Sovereign Engine v9.0</h2>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Mode: Deep Telemetry Synthesis</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadInsights} variant="outline" size="sm" className="font-mono text-[9px] tracking-widest uppercase border-white/10 hover:bg-white/5 h-9 px-4">
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Main Intelligence Brief */}
      <Card className="tactical-panel bg-black/60 border-none before:hidden p-0 overflow-hidden shadow-2xl">
        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-secondary" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-secondary">Intelligence Brief — LIVE MESH</span>
          </div>
          {isTyping && <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />}
        </div>
        <CardContent className="p-8">
          <div className="font-mono text-[12px] text-foreground/90 leading-relaxed whitespace-pre-wrap max-w-4xl">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>
        </CardContent>
      </Card>

      {/* Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {insights?.widgets.map((widget) => (
          <Card key={widget.id} className={cn(
            "tactical-panel bg-black/40 border-none before:bg-primary min-h-[400px] flex flex-col",
            widget.urgency === 'critical' && "before:bg-destructive shadow-[0_0_20px_rgba(255,45,85,0.1)]"
          )}>
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-headline font-bold flex items-center gap-3 uppercase tracking-widest">
                  {widget.type === 'chart' ? <BarChart3 className="w-4 h-4 text-primary" /> : <Activity className="w-4 h-4 text-primary" />}
                  {widget.title}
                </CardTitle>
                <span className={cn(
                  "font-mono text-[8px] px-2 py-0.5 border font-bold uppercase tracking-tighter",
                  widget.urgency === 'critical' ? "border-destructive text-destructive" : "border-primary text-primary"
                )}>
                  {widget.urgency}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-6">
              {widget.type === 'chart' && widget.chartData && (
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {widget.chartType === 'area' ? (
                      <AreaChart data={widget.chartData}>
                        <defs>
                          <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#060d1c', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                          labelStyle={{ color: '#00d4ff', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#00d4ff" fillOpacity={1} fill={`url(#grad-${widget.id})`} strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <BarChart data={widget.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 8}} />
                        <Tooltip 
                          cursor={{fill: '#ffffff05'}}
                          contentStyle={{ backgroundColor: '#060d1c', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                        />
                        <Bar dataKey="value" fill="#00ff88" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-[11px] font-mono text-muted-foreground italic leading-relaxed">
                  {widget.content}
                </p>
                <div className="p-4 bg-primary/5 border-l-2 border-primary rounded-r-sm">
                  <p className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest mb-1">Recommended Protocol:</p>
                  <p className="text-[10px] font-mono text-foreground/80 leading-relaxed uppercase">{widget.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Signal HUD */}
      <div className="space-y-6">
        <h3 className="font-headline text-[10px] uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          Tactical Crisis Signals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights?.alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              className={cn(
                "tactical-panel border-none bg-black/40 before:w-1.5",
                alert.severity === 'critical' ? "before:bg-destructive" : "before:bg-accent"
              )}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-mono font-bold uppercase tracking-widest text-[11px]">{alert.severity} Vector Detected</AlertTitle>
              <AlertDescription className="mt-3 font-mono text-[10px] text-foreground/70 leading-relaxed">
                {alert.message}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-primary font-bold">ACTION:</span>
                  <span className="uppercase text-primary">{alert.actionRequired}</span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  )
}
