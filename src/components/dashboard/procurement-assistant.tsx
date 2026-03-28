"use client"

import { useState } from "react"
import { recommendRestockOrders, type RecommendRestockOrdersOutput } from "@/ai/flows/recommend-restock-orders-flow"
import { SKUS } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ShoppingCart, RefreshCcw, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProcurementAssistant() {
  const [recommendations, setRecommendations] = useState<RecommendRestockOrdersOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleAnalyze() {
    setLoading(true)
    try {
      const input = {
        skus: SKUS,
        currentTime: new Date().toISOString()
      }
      const result = await recommendRestockOrders(input)
      setRecommendations(result)
    } catch (err) {
      toast({
        title: "Error analyzing inventory",
        description: "The autonomous agent failed to connect. Please retry.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-panel border-none shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Autonomous Restock Agent
          </CardTitle>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            size="sm"
            className="bg-primary hover:bg-primary/80"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
            Analyze Procurement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations && !loading && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
            <p className="text-muted-foreground text-sm">Initiate restock analysis to see AI suggestions.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="h-20 bg-white/5 animate-pulse rounded-lg" />
            <div className="h-20 bg-white/5 animate-pulse rounded-lg" />
            <div className="h-20 bg-white/5 animate-pulse rounded-lg" />
          </div>
        )}

        {recommendations && (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="text-sm font-bold text-primary mb-1 uppercase">Strategic Summary</h4>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {recommendations.overallInsights}
              </p>
            </div>
            
            <div className="grid gap-3">
              {recommendations.recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className="p-4 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{rec.skuName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        rec.urgency === 'Critical' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
                      }`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{rec.supplierName}</span>
                    <p className="text-xs mt-2 opacity-80">{rec.justification}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-xl font-mono font-bold text-primary">+{rec.recommendedQuantity}</span>
                    <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 hover:bg-primary hover:text-white">
                      Confirm <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
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
