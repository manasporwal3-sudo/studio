
'use client';

import { Suspense } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDarkStoreOS } from "@/hooks/use-darkstore-os";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, TrendingUp, PieChart, ArrowUpRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ProfitContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store') || 'BLR-01';
  const { inventory, revenue } = useDarkStoreOS(storeId);

  const profitData = [
    { name: 'Jan', value: 4500 }, { name: 'Feb', value: 5200 }, { name: 'Mar', value: 4800 },
    { name: 'Apr', value: 6100 }, { name: 'May', value: 5900 }, { name: 'Jun', value: 7200 },
    { name: 'Jul', value: 8100 }, { name: 'Aug', value: 7800 }, { name: 'Sep', value: 9200 },
    { name: 'Oct', value: 8500 }, { name: 'Nov', value: 10100 }, { name: 'Dec', value: revenue }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2 text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-widest">Real-time P&L</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-4xl font-bold font-mono text-emerald-400 tracking-tighter">
              ${(revenue * 0.38).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-2">
              <ArrowUpRight className="w-3 h-3" /> +14.2% FROM YESTERDAY
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2 text-primary">
              <span className="text-xs font-bold uppercase tracking-widest">OpEx Efficiency</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-4xl font-bold font-mono tracking-tighter">92.4%</div>
            <div className="text-[10px] text-muted-foreground font-bold mt-2">OPTIMIZED BY AI AGENT</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2 text-blue-400">
              <span className="text-xs font-bold uppercase tracking-widest">Avg Ticket</span>
              <PieChart className="w-4 h-4" />
            </div>
            <div className="text-4xl font-bold font-mono tracking-tighter">$14.85</div>
            <div className="text-[10px] text-muted-foreground font-bold mt-2">+2.1% SKU CROSS-SELL</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="text-md uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            12-Month Profit Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {profitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === profitData.length - 1 ? '#3b82f6' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none">
        <CardHeader>
          <CardTitle className="text-md uppercase tracking-widest">SKU Profit Ranking</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {inventory.sort((a, b) => (b.unitPrice * b.margin) - (a.unitPrice * a.margin)).slice(0, 5).map((item, i) => (
                <div key={item.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-muted-foreground">#0{i+1}</span>
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold">{(item.margin * 100).toFixed(0)}% MARGIN</span>
                    <p className="text-[10px] text-muted-foreground uppercase">Top Performer</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfitPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading Profit Engine...</div>}>
        <ProfitContent />
      </Suspense>
    </DashboardLayout>
  );
}
