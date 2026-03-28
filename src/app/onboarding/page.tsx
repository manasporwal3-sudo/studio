'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Database, Globe, Layers, ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const protocols = [
  { id: 'REST', icon: <Globe />, label: 'REST API' },
  { id: 'GQL', icon: <Layers />, label: 'GraphQL' },
  { id: 'MQTT', icon: <Radio />, label: 'MQTT/IoT' },
  { id: 'WS', icon: <Terminal />, label: 'Websocket' }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedProto, setSelectedProto] = useState('');
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const fields = [
    { raw: 'p_id', mapped: 'SKU_ID', confidence: 0.99 },
    { raw: 'stk_lvl', mapped: 'CURRENT_STOCK', confidence: 0.98 },
    { raw: 'v_id', mapped: 'VENDOR_ID', confidence: 0.95 },
    { raw: 'ts', mapped: 'LAST_SYNCED', confidence: 1.00 }
  ];

  const startDiscovery = () => {
    setIsDiscovering(true);
    let i = 0;
    const interval = setInterval(() => {
      setDiscoveryStep(prev => prev + 1);
      i++;
      if (i >= fields.length) {
        clearInterval(interval);
        setTimeout(() => setStep(3), 1000);
      }
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 border-2 border-primary flex items-center justify-center bg-primary/10">
            <Radio className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold uppercase tracking-[0.4em]">Universal Onboarding</h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest max-w-md">Connect any POS, ERP, or IoT Node to the Neuro-Fast Neural Mesh.</p>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-2">Select Uplink Protocol</h3>
              <div className="grid grid-cols-2 gap-4">
                {protocols.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProto(p.id)}
                    className={cn(
                      "tactical-panel p-6 flex flex-col items-center gap-4 transition-all duration-300 before:hidden",
                      selectedProto === p.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    <div className={cn("w-10 h-10 flex items-center justify-center", selectedProto === p.id && "animate-pulse")}>
                      {p.icon}
                    </div>
                    <span className="font-mono text-[10px] font-bold tracking-widest">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest border-b border-white/5 pb-2">Node Configuration</h3>
              <Card className="tactical-panel bg-black/40 border-none before:hidden p-6 space-y-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Gateway URL</label>
                  <Input placeholder="https://api.darkstore-01.io/v2" className="bg-black/40 border-white/10 font-mono text-xs h-12" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Auth Token</label>
                  <Input type="password" value="******************" className="bg-black/40 border-white/10 font-mono text-xs h-12" />
                </div>
                <Button 
                  disabled={!selectedProto}
                  onClick={() => setStep(2)}
                  className="w-full h-12 font-mono text-xs uppercase tracking-[0.2em] mt-4"
                >
                  Initiate Discovery <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="tactical-panel p-12 bg-black/60 before:hidden">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/20 rounded-full flex items-center justify-center">
                  <Database className={cn("w-10 h-10 text-primary", isDiscovering && "animate-spin")} />
                </div>
                {isDiscovering && <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              
              {!isDiscovering ? (
                <div className="text-center space-y-6">
                  <h2 className="font-headline font-bold text-xl uppercase tracking-widest">Uplink Established</h2>
                  <p className="font-mono text-xs text-muted-foreground">Ready to discover schema from Node {selectedProto}...</p>
                  <Button onClick={startDiscovery} className="px-12 h-12 font-mono uppercase tracking-widest">Analyze Schema</Button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  {fields.map((f, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-3 border border-white/5 transition-opacity duration-300",
                      i >= discoveryStep ? "opacity-20" : "opacity-100 bg-primary/5"
                    )}>
                      <div className="flex items-center gap-3">
                        <Terminal className="w-3 h-3 text-primary" />
                        <span className="font-mono text-[10px] text-muted-foreground">{f.raw}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-[10px] text-primary font-bold">{f.mapped}</span>
                      </div>
                      <span className="font-mono text-[9px] text-secondary">{(f.confidence * 100).toFixed(0)}% MATCH</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-secondary/20 flex items-center justify-center rounded-full border-2 border-secondary shadow-[0_0_30px_rgba(132,255,0,0.3)]">
              <CheckCircle2 className="w-12 h-12 text-secondary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-headline font-extrabold text-3xl uppercase tracking-[0.2em] text-secondary glow-text-secondary">Uplink Optimized</h2>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Node Integrated into Predictive Brain</p>
            </div>
            <Button onClick={() => setStep(1)} variant="outline" className="font-mono uppercase tracking-[0.2em] px-8">Return to Control</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
