
'use client';

import { useState } from 'react';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bike, 
  Plus, 
  Search, 
  MapPin, 
  Battery, 
  TrendingUp, 
  Calendar, 
  ShieldAlert, 
  Phone,
  User as UserIcon,
  Loader2
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
    return collection(db, 'riders');
  }, [db]);

  const { data: riders, isLoading } = useCollection(ridersQuery);

  const [newRider, setNewRider] = useState({
    name: '',
    mobile: '',
    vehicleType: 'Electric Scooter',
    vehicleNumber: '',
    zone: '',
    batteryLevel: 100,
    emergencyContact: ''
  });

  const handleAddRider = async () => {
    if (!newRider.name || !newRider.mobile || !newRider.vehicleNumber || !newRider.zone) {
      toast({ variant: "destructive", title: "Missing Data", description: "Complete all tactical fields." });
      return;
    }

    const riderData = {
      ...newRider,
      id: crypto.randomUUID(),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'idle',
      darkStoreId: user?.uid || 'BLR-01',
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(db, 'riders'), riderData);
    toast({ title: "Rider Enrolled", description: "New node added to the mesh network." });
    setIsModalOpen(false);
    setNewRider({ name: '', mobile: '', vehicleType: 'Electric Scooter', vehicleNumber: '', zone: '', batteryLevel: 100, emergencyContact: '' });
  };

  const filteredRiders = (riders || []).filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'all' || r.zone === zoneFilter;
    return matchesSearch && matchesZone;
  });

  const zones = Array.from(new Set((riders || []).map(r => r.zone)));

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Bike className="w-8 h-8 text-primary glow-cyan" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-black uppercase tracking-tighter italic">Fleet Intelligence</h1>
              <p className="font-mono text-[10px] text-primary/60 uppercase tracking-[0.3em]">Neural Mesh Node Map</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="SEARCH NODE..." 
                className="pl-10 cyber-input" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-black font-headline text-[10px] tracking-widest px-6 glow-cyan hover:bg-primary/80">
                  <Plus className="w-4 h-4 mr-2" /> ADD NODE
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/20 max-w-2xl p-0 overflow-hidden">
                <div className="bg-primary/10 p-6 border-b border-white/5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-black font-headline font-bold">
                    {newRider.name[0] || '?'}
                  </div>
                  <div>
                    <DialogTitle className="font-headline italic text-lg tracking-tighter">ENROLL FIELD AGENT</DialogTitle>
                    <p className="text-[10px] font-mono text-primary/60">Sovereign Mesh Integration</p>
                  </div>
                </div>
                <div className="p-8 grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Full Name</label>
                    <Input placeholder="AGENT NAME" value={newRider.name} onChange={e => setNewRider({...newRider, name: e.target.value})} className="cyber-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Mobile Node</label>
                    <Input placeholder="+91 XXXXX XXXXX" value={newRider.mobile} onChange={e => setNewRider({...newRider, mobile: e.target.value})} className="cyber-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Vehicle Tech</label>
                    <Select onValueChange={v => setNewRider({...newRider, vehicleType: v})} value={newRider.vehicleType}>
                      <SelectTrigger className="cyber-input"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-primary/20">
                        {["Bike", "Scooter", "Electric Scooter", "Cycle", "Van"].map(v => (
                          <SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">License Plate</label>
                    <Input placeholder="KA-01-XX-0000" value={newRider.vehicleNumber} onChange={e => setNewRider({...newRider, vehicleNumber: e.target.value})} className="cyber-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Tactical Zone</label>
                    <Input placeholder="KORAMANGALA / INDIRANAGAR" value={newRider.zone} onChange={e => setNewRider({...newRider, zone: e.target.value})} className="cyber-input" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Emergency Comms</label>
                    <Input placeholder="CONTACT NUMBER" value={newRider.emergencyContact} onChange={e => setNewRider({...newRider, emergencyContact: e.target.value})} className="cyber-input" />
                  </div>
                  <div className="col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">Battery Calibration</label>
                      <span className="font-mono text-primary">{newRider.batteryLevel}%</span>
                    </div>
                    <Slider 
                      value={[newRider.batteryLevel]} 
                      onValueChange={([v]) => setNewRider({...newRider, batteryLevel: v})} 
                      max={100} step={1} 
                    />
                  </div>
                </div>
                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="font-mono text-xs uppercase">Cancel</Button>
                  <Button onClick={handleAddRider} className="bg-primary text-black font-headline text-[10px] tracking-widest px-8 glow-cyan">INITIALIZE NODE</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Synchronizing Mesh Nodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiders.map((rider) => (
              <Card key={rider.id} className="cyber-panel border-none before:bg-primary transition-all hover:translate-y-[-4px] group">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center relative">
                    <UserIcon className="w-6 h-6 text-primary" />
                    <div className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      rider.status === 'on_delivery' ? 'bg-secondary animate-pulse' : 
                      rider.status === 'idle' ? 'bg-accent' : 'bg-destructive'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-headline text-xs tracking-widest truncate">{rider.name.toUpperCase()}</CardTitle>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase">{rider.vehicleType} // {rider.vehicleNumber}</p>
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-[8px] font-mono uppercase">ID: {rider.id.slice(0, 5)}</Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/20 rounded border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Zone</span>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-primary truncate">{rider.zone}</p>
                    </div>
                    <div className="p-3 bg-black/20 rounded border border-white/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Comms</span>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-primary truncate">{rider.mobile}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase">
                      <div className="flex items-center gap-2">
                        <Battery className={cn("w-3 h-3", rider.batteryLevel < 20 ? 'text-destructive animate-pulse' : 'text-secondary')} />
                        <span>Battery Node</span>
                      </div>
                      <span className={rider.batteryLevel < 20 ? 'text-destructive' : 'text-secondary'}>{rider.batteryLevel}%</span>
                    </div>
                    <Progress 
                      value={rider.batteryLevel} 
                      className="h-1 bg-white/5" 
                      indicatorClassName={cn(
                        rider.batteryLevel < 20 ? 'bg-destructive' : 
                        rider.batteryLevel < 50 ? 'bg-accent' : 'bg-secondary'
                      )}
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">Joined: {rider.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-1 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-mono text-secondary font-bold">98.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
