
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { validateAndRoute } from '@/services/auth-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, User, Key, Loader2, ArrowLeft, Cpu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { recordStoreActivity } from '@/firebase/non-blocking-updates';

export function StoreLoginForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cred = await initiateEmailSignIn(auth, email, password);
      const validation = await validateAndRoute(db, auth, cred.user.uid, 'store');
      
      if (validation.success) {
        recordStoreActivity(db, cred.user.uid);
        toast({ title: "Uplink Established", description: "Node authorized. Synchronizing local mesh." });
        router.push('/darkstore/inventory');
      } else {
        toast({ title: "Security Protocol Locked", description: validation.message, variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let errorMsg = "Invalid Hub Credentials.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        errorMsg = "Identity not detected in the mesh. Ensure node enrollment is complete at /signup.";
      }
      
      toast({ 
        title: "Uplink Terminated", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-xl font-headline italic uppercase text-primary">Store Operator</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Encrypted Local Hub Access</p>
        </div>
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-sm mb-6 flex items-center gap-3">
        <Cpu className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-[8px] font-mono text-primary uppercase tracking-widest">Scanning Authorization Vectors</span>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="AGENT IDENTITY"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs focus:border-primary/50"
            required
          />
        </div>
        <div className="relative">
          <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="password"
            placeholder="NEURAL KEY"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs focus:border-primary/50"
            required
          />
        </div>
        <Button disabled={isLoading} type="submit" className="w-full h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 border-none">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "INITIATE HUB UPLINK"}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
          New Operator? <a href="/signup" className="text-primary hover:underline">Enroll Now</a>
        </p>
      </div>
    </div>
  );
}
