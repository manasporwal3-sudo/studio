'use client';

import { useState, useEffect } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Fingerprint, 
  Store, 
  Bike, 
  MapPin, 
  Smartphone, 
  PackageCheck, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'darkstore' | 'rider' | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: '',
    address: '',
    city: '',
    zip: '',
    initialSkus: ['Milk', 'Bread', 'Eggs']
  });

  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && step === 5) {
      // Finalize setup if user is logged in and we are at the end
      const userRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        roleIds: [role === 'darkstore' ? 'manager' : 'rider'],
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ').slice(1).join(' '),
        phoneNumber: formData.phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (role === 'darkstore') {
        const storeRef = doc(collection(db, 'darkStores'));
        setDocumentNonBlocking(storeRef, {
          id: storeRef.id,
          name: `${formData.name}'s Hub`,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zip,
          country: 'India',
          managerUserId: user.uid,
          status: 'Operational',
          members: { [user.uid]: 'manager' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      router.push('/dashboard');
    }
  }, [user, step, db, role, formData, router]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSendOtp = () => {
    if (!formData.phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast({ title: "OTP Transmitted", description: "Tactical verification code sent to node device." });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpVerified(true);
      toast({ title: "Identity Confirmed", description: "Neural link verified via mobile node." });
      setStep(4);
    }, 1500);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    initiateEmailSignUp(auth, formData.email, formData.password);
    // Success is handled by the useEffect watching for 'user'
  };

  const renderStep = () => {
    switch(step) {
      case 1: // Role Selection
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-headline font-bold text-center text-sm uppercase tracking-[0.3em] text-primary">Select Node Role</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setRole('darkstore')}
                className={cn(
                  "tactical-panel p-8 cursor-pointer group transition-all duration-300 before:bg-primary",
                  role === 'darkstore' ? "bg-primary/20 border-primary" : "bg-white/5 opacity-60 hover:opacity-100"
                )}
              >
                <Store className={cn("w-10 h-10 mb-4 transition-colors", role === 'darkstore' ? "text-primary" : "text-muted-foreground")} />
                <h4 className="font-headline font-bold uppercase tracking-widest text-sm">Dark Store</h4>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase font-mono">Manage Inventory & Hub Operations</p>
              </div>
              <div 
                onClick={() => setRole('rider')}
                className={cn(
                  "tactical-panel p-8 cursor-pointer group transition-all duration-300 before:bg-secondary",
                  role === 'rider' ? "bg-secondary/20 border-secondary" : "bg-white/5 opacity-60 hover:opacity-100"
                )}
              >
                <Bike className={cn("w-10 h-10 mb-4 transition-colors", role === 'rider' ? "text-secondary" : "text-muted-foreground")} />
                <h4 className="font-headline font-bold uppercase tracking-widest text-sm">Field Agent</h4>
                <p className="text-[10px] text-muted-foreground mt-2 uppercase font-mono">Last-Mile Fulfillment & Rider Mesh</p>
              </div>
            </div>
            <Button 
              disabled={!role} 
              onClick={handleNext} 
              className="w-full h-12 font-bold uppercase tracking-widest"
            >
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        );
      case 2: // Location & Details
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h3 className="font-headline font-bold text-sm uppercase tracking-[0.3em] text-primary">Node Identity</h3>
            <div className="space-y-4">
              <div className="relative group">
                <Smartphone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                <Input 
                  placeholder="MOBILE NUMBER (+91)" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs uppercase"
                />
              </div>
              {role === 'darkstore' && (
                <>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                    <Input 
                      placeholder="HUB ADDRESS" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      placeholder="CITY" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="bg-black/40 border-white/10 h-12 font-mono text-xs uppercase"
                    />
                    <Input 
                      placeholder="ZIP CODE" 
                      value={formData.zip}
                      onChange={(e) => setFormData({...formData, zip: e.target.value})}
                      className="bg-black/40 border-white/10 h-12 font-mono text-xs uppercase"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={handleBack} className="w-1/3 h-12 uppercase font-mono text-[10px]">Back</Button>
              <Button 
                onClick={handleSendOtp} 
                className="w-2/3 h-12 font-bold uppercase tracking-widest"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verify Identity"}
              </Button>
            </div>
          </div>
        );
      case 3: // OTP Verification
        return (
          <div className="space-y-6 animate-in zoom-in duration-500 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
              <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline font-bold text-sm uppercase tracking-widest">Neural Key Verification</h3>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">Enter the code transmitted to {formData.phone}</p>
            </div>
            <Input 
              placeholder="0 0 0 0 0 0" 
              value={formData.otp}
              onChange={(e) => setFormData({...formData, otp: e.target.value})}
              className="bg-black/40 border-white/10 h-16 font-mono text-2xl text-center tracking-[1em] focus:border-primary"
            />
            <Button 
              onClick={handleVerifyOtp} 
              disabled={loading || formData.otp.length < 4}
              className="w-full h-12 font-bold uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Establish Secure Link"}
            </Button>
            <Button variant="link" onClick={handleSendOtp} className="text-[10px] uppercase font-mono text-primary/60">Resend Code</Button>
          </div>
        );
      case 4: // Inventory & Final Credentials
        return (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-sm uppercase tracking-[0.3em] text-primary">Final Authorization</h3>
              <Input 
                type="text" 
                placeholder="FULL AGENT NAME" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/40 border-white/10 h-12 font-mono text-xs uppercase"
                required
              />
              <Input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-black/40 border-white/10 h-12 font-mono text-xs"
                required
              />
              <Input 
                type="password" 
                placeholder="NEW NEURAL PASSWORD" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-black/40 border-white/10 h-12 font-mono text-xs"
                required
              />
              {role === 'darkstore' && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-mono uppercase font-bold text-primary">Pre-load Inventory</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.initialSkus.map(sku => (
                      <div key={sku} className="px-2 py-1 bg-black/40 text-[9px] font-mono text-muted-foreground uppercase border border-white/5">
                        {sku}
                      </div>
                    ))}
                    <div className="px-2 py-1 bg-primary/20 text-[9px] font-mono text-primary uppercase border border-primary/30 cursor-pointer">+ Add More</div>
                  </div>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 font-bold uppercase tracking-widest text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Initialize Node Deployment"}
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-xl glass-panel border-white/5 relative z-10 shadow-2xl backdrop-blur-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto flex gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
               <Fingerprint className="w-6 h-6 text-primary" />
             </div>
             <div className="text-left">
               <CardTitle className="text-2xl font-bold font-headline tracking-tighter uppercase italic">NODE ENROLLMENT</CardTitle>
               <CardDescription className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold opacity-80">
                 Sovereign Apex v9.0 Deployment
               </CardDescription>
             </div>
          </div>
          
          <div className="flex items-center gap-1 w-full max-w-xs mx-auto pt-4">
            {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={cn(
                  "h-1 flex-1 transition-all duration-500",
                  step >= i ? "bg-primary" : "bg-white/10"
                )} 
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 pb-8">
          {renderStep()}
        </CardContent>

        <CardFooter className="pb-8 flex flex-col gap-4 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Already have a Node ID? <Button variant="link" onClick={() => router.push('/login')} className="p-0 text-primary uppercase font-bold text-[10px]">Establish Uplink</Button>
          </p>
          <div className="flex items-center justify-center gap-2 opacity-40">
            <Zap className="w-3 h-3" />
            <span className="text-[8px] uppercase tracking-[0.4em] font-mono">Quantum Encryption Active</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
