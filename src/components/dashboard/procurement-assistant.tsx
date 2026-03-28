"use client"

import { useState } from "react"
import { recommendRestockOrders, type RecommendRestockOrdersOutput } from "@/ai/flows/recommend-restock-orders-flow"
import { SKUS, STORES } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ShoppingCart, RefreshCcw, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export function ProcurementAssistant() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'BLR-01'
  const activeStore = STORES.find(s => s.id === storeId)

  const [recommendations, setRecommendations] = useState<RecommendRestockOrdersOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleAnalyze() {
    setLoading(true)
    try {
      const input = {
        inventory: JSON.stringify(SKUS),
        storeProfile: JSON.stringify({
          store_id: storeId,
          company_name: activeStore?.name,
          platform: "Blinkit Node",
          city: activeStore?.city
        })
      }
      const result = await recommendRestockOrders(input)
      setRecommendations(result)
    } catch (err) {
      toast({
        title: "Autonomous Agent Timeout",
        description: "Uplink to Sovereign v9.0 failed. Retrying sync...",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-panel border-none shadow-2xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">Autonomous Reorder Planner</CardTitle>
              <p className="text-[9px] font-mono text-primary tracking-widest uppercase">Protocol: Apex v9.0 MODE 2</p>
            </div>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            size="sm"
            className="bg-primary hover:bg-primary/80 font-mono text-[10px] uppercase tracking-widest"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCcw className="w-3 h-3 mr-2" />}
            Engage Planner
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {!recommendations && !loading && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center gap-4">
            <Terminal className="w-8 h-8 text-white/10" />
            <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Command Activation...</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="h-20 bg-white/5 animate-pulse" />
            <div className="h-40 bg-white/5 animate-pulse" />
            <div className="h-20 bg-white/5 animate-pulse" />
          </div>
        )}

        {recommendations && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Strategic Summary Term */}
            <div className="p-6 bg-primary/10 border-l-2 border-primary rounded-r-xl">
               <div className="flex items-center gap-2 mb-3">
                 <ShieldCheck className="w-4 h-4 text-primary" />
                 <h4 className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.3em]">Neural Recommendation Brief</h4>
               </div>
               <p className="text-[11px] font-mono text-foreground/80 leading-relaxed italic">
                {recommendations.overallInsights}
               </p>
            </div>

            <div className="space-y-4">
              <h5 className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground px-1">Restock Priority Stream</h5>
              <div className="grid gap-3">
                {recommendations.recommendations.map((rec, i) => (
                  <div 
                    key={i} 
                    className="tactical-panel p-6 bg-black/40 border border-white/5 before:hidden group hover:border-primary/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="font-headline font-bold text-sm tracking-tight">{rec.skuName}</span>
                        <span className={`text-[8px] font-mono px-2 py-0.5 border font-bold uppercase ${
                          rec.urgency === 'Critical' ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary text-primary bg-primary/10'
                        }`}>
                          {rec.urgency}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{rec.skuId}</span>
                        <div className="h-3 w-px bg-white/10" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{rec.supplierName || 'Primary Node'}</span>
                      </div>
                      <p className="text-[10px] font-mono text-foreground/60 leading-tight max-w-md">{rec.justification}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Recommended Qty</span>
                        <span className="text-2xl font-mono font-bold text-primary">+{rec.recommendedQuantity}</span>
                      </div>
                      <Button variant="outline" className="h-8 text-[9px] font-mono uppercase tracking-widest border-white/10 hover:border-primary hover:bg-primary/10 group-hover:scale-105 transition-transform">
                        Confirm <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* v9.0 Brief Terminal */}
            <div className="pt-6 border-t border-white/5">
              <h5 className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground px-1 mb-4">Apex v9.0 Brief Output</h5>
              <div className="p-6 bg-black/40 rounded-xl font-mono text-[10px] text-foreground/70 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                {recommendations.intelligenceBrief}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
