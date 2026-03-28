'use client';

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Bike, 
  Plus, 
  Search, 
  MapPin, 
  Battery, 
  Calendar, 
  Phone,
  User as UserIcon,
  Loader2,
  Clock,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';

export default function RidersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const ridersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(db, 'riders');
  }, [db, user]);

  const { data: riders, isLoading } = useCollection(ridersQuery);

  const [newRider, setNewRider] = useState({
    name: '',
    mobile: '',
    vehicleType: 'Electric Scooter',
    vehicleNumber: '',
    zone: '',
    batteryLevel: 100,
    emergencyContact: '',
    licenseExpiry: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleAddRider = async () => {
    if (!newRider.name || !newRider.mobile || !newRider.vehicleNumber) {
      toast({ variant: "destructive", title: "Parameter Failure", description: "All strategic fields required for node enrollment." });
      return;
    }

    const riderData = {
      ...newRider,
      status: 'idle',
      darkStoreId: user?.uid || 'BLR-01',
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(db, 'riders'), riderData);
    toast({ title: "Node Integrated", description: "Field agent integrated into the neural fleet." });
    setIsModalOpen(false);
    setNewRider({ name: '', mobile: '', vehicleType: 'Electric Scooter', vehicleNumber: '', zone: '', batteryLevel: 100, emergencyContact: '', licenseExpiry: '', joinDate: new Date().toISOString().split('T')[0] });
  };

  const filteredRiders = (riders || []).filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'all' || r.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  const zones = Array.from(new Set((riders || []).map(r => r.zone)));

  return (
    <DashboardLayout>
      <div className="space-y-10 relative min-h-[80vh]">
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/20 border border-primary/40 flex items-center justify-center rounded-sm">
              <Bike className="w-10 h-10 text-primary glow-cyan" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-black uppercase tracking-tighter italic text-white">Fleet Matrix</h1>
              <p className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.4em]">Operational Field Agent Oversight</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="SEARCH NODE..." 
                className="pl-12 cyber-input h-12" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={setZoneFilter} defaultValue="all">
              <SelectTrigger className="cyber-input h-12 w-44">
                <SelectValue placeholder="ZONE" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1628] border-primary/20">
                <SelectItem value="all" className="font-mono text-[10px]">ALL ZONES</SelectItem>
                {zones.map(z => <SelectItem key={z} value={z} className="font-mono text-[10px] uppercase">{z}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fleet Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-mono text-xs uppercase tracking-[0.5em] text-primary/40">Syncing Fleet Telemetry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
            {filteredRiders.map((rider) => (
              <Card key={rider.id} className="tactical-panel border-none before:bg-primary/60 hover:translate-y-[-4px] transition-all group">
                <CardHeader className="flex flex-row items-center gap-5 pb-6">
                  <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center relative border border-white/5">
                    <UserIcon className="w-7 h-7 text-primary" />
                    <div className={cn(
                      "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0a1628]",
                      rider.status === 'on_delivery' ? 'bg-secondary animate-pulse' : 
                      rider.status === 'idle' ? 'bg-accent' : 'bg-destructive'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-headline text-sm tracking-widest truncate text-white uppercase">{rider.name}</CardTitle>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase mt-1">{rider.vehicleType} // {rider.vehicleNumber}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/40 rounded-sm border border-white/5">
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">Zone</span>
                      <p className="text-[10px] font-mono font-bold text-primary truncate uppercase">{rider.zone || 'UNMAPPED'}</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-sm border border-white/5">
                      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">Comms</span>
                      <p className="text-[10px] font-mono font-bold text-primary truncate">{rider.mobile}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase">
                      <div className="flex items-center gap-2">
                        <Battery className={cn("w-3 h-3", rider.batteryLevel < 20 ? 'text-destructive animate-pulse' : 'text-secondary')} />
                        <span>EV Battery Status</span>
                      </div>
                      <span className="font-bold">{rider.batteryLevel}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", 
                          rider.batteryLevel < 20 ? 'bg-destructive' : 
                          rider.batteryLevel < 50 ? 'bg-accent' : 'bg-secondary'
                        )} 
                        style={{ width: `${rider.batteryLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">SYNCED: {rider.joinDate}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[8px] border-primary/20 text-primary uppercase h-5">{rider.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-black shadow-[0_0_30px_rgba(0,212,255,0.5)] hover:scale-110 transition-transform z-50 p-0 border-none">
              <Plus className="w-8 h-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#060d1c] border-primary/20 max-w-2xl p-0 overflow-hidden shadow-2xl">
            <div className="bg-primary/10 p-8 border-b border-white/5 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center text-black font-headline font-black text-2xl italic">
                <Bike className="w-10 h-10" />
              </div>
              <div>
                <DialogTitle className="font-headline italic text-2xl tracking-tighter text-white uppercase">ENROLL FIELD AGENT</DialogTitle>
                <p className="text-[11px] font-mono text-primary uppercase tracking-[0.4em] mt-1">Sovereign Fleet Integration</p>
              </div>
            </div>
            
            <div className="p-10 grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Rider Full Name</label>
                <Input placeholder="AGENT IDENTITY" value={newRider.name} onChange={e => setNewRider({...newRider, name: e.target.value})} className="cyber-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Mobile Contact</label>
                <Input placeholder="+91 00000 00000" value={newRider.mobile} onChange={e => setNewRider({...newRider, mobile: e.target.value})} className="cyber-input" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Vehicle Type</label>
                <Select onValueChange={v => setNewRider({...newRider, vehicleType: v})} value={newRider.vehicleType}>
                  <SelectTrigger className="cyber-input h-10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a1628] border-primary/20">
                    {["Bike", "Scooter", "Electric Scooter", "Cycle", "Van", "Other"].map(v => (
                      <SelectItem key={v} value={v} className="font-mono text-xs uppercase">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Plate Number</label>
                <Input placeholder="XX 00 XX 0000" value={newRider.vehicleNumber} onChange={e => setNewRider({...newRider, vehicleNumber: e.target.value})} className="cyber-input" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Deployment Zone</label>
                <Input placeholder="e.g. Koramangala" value={newRider.zone} onChange={e => setNewRider({...newRider, zone: e.target.value})} className="cyber-input" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Emergency Comms</label>
                <Input placeholder="NOMINATED CONTACT" value={newRider.emergencyContact} onChange={e => setNewRider({...newRider, emergencyContact: e.target.value})} className="cyber-input" />
              </div>

              <div className="col-span-2 space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">EV Battery Calibration</label>
                  <span className="font-mono text-primary font-bold">{newRider.batteryLevel}%</span>
                </div>
                <Slider 
                  value={[newRider.batteryLevel]} 
                  onValueChange={([v]) => setNewRider({...newRider, batteryLevel: v})} 
                  max={100} step={1}
                />
              </div>
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-mono text-xs uppercase">ABORT</Button>
              <Button onClick={handleAddRider} className="bg-primary text-black font-headline text-[11px] tracking-widest px-10 glow-cyan uppercase">DEPLOY NODE</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
