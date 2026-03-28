'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { Sparkles } from "lucide-react";

export default function InsightsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-4 md:p-6 glass-panel rounded-2xl border-none flex flex-row items-center gap-4 md:gap-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/20 rounded-xl md:rounded-2xl flex items-center justify-center border border-accent/30 shrink-0">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-headline tracking-tighter uppercase italic">Neural Intelligence</h1>
            <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest font-semibold">Generative Apex Engine</p>
          </div>
        </div>
        <AIInsights />
      </div>
    </DashboardLayout>
  );
}
