"use client"

import { useState } from "react"
import { recommendRestockOrders, type RecommendRestockOrdersOutput } from "@/ai/flows/recommend-restock-orders-flow"
import { useDarkStoreOS } from "@/hooks/use-darkstore-os"
import { useUser } from "@/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RefreshCcw, Loader2, ArrowRight, ShieldCheck, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

export function ProcurementAssistant() {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('store') || 'PRIMARY-NODE'
  const { user, userProfile } = useUser()
  const { inventory, isLoading: isInventoryLoading } = useDarkStoreOS(user?.uid || '')

  const [recommendations, setRecommendations] = useState<RecommendRestockOrdersOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleAnalyze() {
    if (inventory.length === 0) {
      toast({
        title: "Empty Node",
        description: "Initialize inventory to enable restock planning.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const input = {
        inventory: JSON.stringify(inventory),
        storeProfile: JSON.stringify({
          store_id: storeId,
          company_name: userProfile?.storeName || "AUTHORIZED HUB",
          platform: "SOVEREIGN APEX NODE",
          city: userProfile?.city || "Sovereign Hub"
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
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <h4 className="text-sm font-headline font-bold uppercase tracking-widest">Reorder Command</h4>
              <p className="text-[9px] font-mono text-primary tracking-widest uppercase">Zero-Simulation Engine Active</p>
            </div>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || isInventoryLoading}
            size="sm"
            className="bg-primary hover:bg-primary/80 font-mono text-[10px] uppercase tracking-widest"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <RefreshCcw className="w-3 h-3 mr-2" />}
            Analyze Node
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {(!recommendations && !loading) && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center gap-4">
            <Terminal className="w-8 h-8 text-white/10" />
            <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.2em]">Awaiting Live Data Stream...</p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-6 bg-primary/10 border-l-2 border-primary rounded-r-xl">
               <p className="text-[11px] font-mono text-foreground/80 leading-relaxed italic">
                {recommendations.overallInsights}
               </p>
            </div>

            <div className="grid gap-3">
              {recommendations.recommendations.map((rec, i) => (
                <div key={i} className="tactical-panel p-6 bg-black/40 border border-white/5 before:hidden flex items-center justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-headline font-bold text-sm tracking-tight">{rec.skuName}</span>
                      <span className={`text-[8px] font-mono px-2 py-0.5 border font-bold uppercase ${
                        rec.urgency === 'Critical' ? 'border-destructive text-destructive bg-destructive/10' : 'border-primary text-primary bg-primary/10'
                      }`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-foreground/60 leading-tight">{rec.justification}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">Qty</span>
                      <span className="text-2xl font-mono font-bold text-primary">+{rec.recommendedQuantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
