'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { Sparkles } from "lucide-react";

export default function InsightsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 glass-panel rounded-2xl border-none flex items-center gap-6">
          <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center border border-accent/30">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter">NEURAL INTELLIGENCE</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Generative Insight Engine</p>
          </div>
        </div>
        <AIInsights />
      </div>
    </DashboardLayout>
  );
}
