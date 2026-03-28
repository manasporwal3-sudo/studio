'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProcurementAssistant } from "@/components/dashboard/procurement-assistant";
import { ShoppingCart } from "lucide-react";

export default function RestockPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 glass-panel rounded-2xl border-none flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter">PROCUREMENT AGENT</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Autonomous Restocking Command</p>
          </div>
        </div>
        <ProcurementAssistant />
      </div>
    </DashboardLayout>
  );
}
