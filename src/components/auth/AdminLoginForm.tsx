
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { validateAndRoute } from '@/services/auth-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, User, Key, Loader2, ArrowLeft, Activity, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { recordStoreActivity } from '@/firebase/non-blocking-updates';
import Link from 'next/link';

export function AdminLoginForm({ onBack }: { onBack: () => void }) {
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
      // Initiate sign-in. This will fail if the account hasn't been created via /signup.
      const cred = await initiateEmailSignIn(auth, email, password);
      
      // Validate that this user actually has the 'admin' role in Firestore.
      const validation = await validateAndRoute(db, auth, cred.user.uid, 'admin');
      
      if (validation.success) {
        recordStoreActivity(db, cred.user.uid);
        toast({ title: "Admin Access Granted", description: "Sovereign Command Hub authorized." });
        router.push('/admin/dashboard');
      } else {
        // User exists but role mismatch (e.g. a store operator trying to use admin terminal)
        toast({ 
          title: "Security Override", 
          description: validation.message, 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      // Do not throw the error to prevent Next.js error overlays.
      // Firebase auth/invalid-credential is the common error for "not found" or "wrong password".
      let errorMsg = "Identity not detected in the mesh.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        errorMsg = "This identity has not been enrolled. You MUST complete Node Enrollment at /signup first using admin@neurofast.io.";
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = "Neural Key mismatch. Integrity check failed.";
      }
      
      toast({ 
        title: "Access Denied", 
        description: errorMsg, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-destructive">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-xl font-headline italic uppercase text-destructive">Terminal Admin</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Sovereign Strategic Control</p>
        </div>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-[9px] font-mono text-primary uppercase font-bold">Node Enrollment Required</p>
          <p className="text-[8px] font-mono text-muted-foreground uppercase leading-relaxed">
            Administrative identities are NOT pre-seeded. You must enroll at /signup with 'admin@neurofast.io' to establish your link.
          </p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="ADMIN ID (e.g. admin@neurofast.io)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs focus:border-destructive/50"
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
            className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-xs focus:border-destructive/50"
            required
          />
        </div>
        <Button 
          disabled={isLoading} 
          type="submit" 
          className="w-full h-12 font-bold uppercase tracking-widest text-xs bg-destructive/80 hover:bg-destructive text-white shadow-lg shadow-destructive/20 border-none"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ESTABLISH COMMAND UPLINK"}
        </Button>
      </form>

      <div className="pt-4 text-center space-y-4">
        <Link href="/signup">
          <Button variant="outline" className="w-full border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest h-10">
            Go to Node Enrollment (Signup)
          </Button>
        </Link>
        <p className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
          NEURO-FAST SOVEREIGN GATEWAY v10.5
        </p>
      </div>
    </div>
  );
}
