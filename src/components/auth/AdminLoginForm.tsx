
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { validateAndRoute } from '@/services/auth-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, User, Key, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
      const cred = await initiateEmailSignIn(auth, email, password);
      const validation = await validateAndRoute(db, auth, cred.user.uid, 'admin');
      
      if (validation.success) {
        toast({ title: "Admin Access Granted", description: "Global Command Interface authorized." });
        router.push('/admin/dashboard');
      } else {
        toast({ title: "Security Override Engaged", description: validation.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Access Denied", description: "Invalid Administrative Credentials.", variant: "destructive" });
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

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="ADMIN ID"
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
          className="w-full h-12 font-bold uppercase tracking-widest text-xs bg-destructive/80 hover:bg-destructive text-white shadow-lg shadow-destructive/20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ESTABLISH COMMAND UPLINK"}
        </Button>
      </form>
    </div>
  );
}
