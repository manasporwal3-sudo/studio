'use client';

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InventoryTable } from "@/components/dashboard/inventory-table";
import { Database, Globe } from "lucide-react";

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Inventory Sync" value="100%" icon={<Database className="w-4 h-4" />} trend="+0.4%" />
          <MetricCard title="Active SKUs" value="1,240" icon={<Database className="w-4 h-4" />} trend="+12" />
          <MetricCard title="Global Node" value="LON-042" icon={<Globe className="w-4 h-4" />} trend="Stable" />
        </div>
        <InventoryTable />
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="p-4 glass-panel border-none rounded-2xl flex flex-col gap-1 group hover:border-primary/20 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{title}</span>
        <div className="text-primary/40 group-hover:text-primary transition-colors">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl font-bold font-mono">{value}</span>
        <span className="text-[10px] font-bold text-emerald-400">{trend}</span>
      </div>
    </div>
  );
}
