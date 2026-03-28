'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, User, Key, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mounted, setMounted] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    if (user) {
      router.push('/inventory');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password).catch((error: any) => {
      toast({
        title: "Uplink Terminated",
        description: "Invalid credentials. Ensure the account is registered in your Firebase Console.",
        variant: "destructive",
      });
    });
  };

  const handleGuestLogin = () => {
    initiateAnonymousSignIn(auth).catch((error: any) => {
      toast({
        title: "Uplink Terminated",
        description: "Anonymous access denied. Please contact system admin.",
        variant: "destructive",
      });
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Fingerprint className="w-12 h-12 text-primary opacity-20" />
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Initializing Link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/30 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[160px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <Card className="w-full max-w-md glass-panel border-white/5 relative z-10 shadow-2xl backdrop-blur-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Fingerprint className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold font-headline tracking-tighter uppercase italic">NEURO-FAST</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold opacity-80">
              System Access Interface v2.0
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2 group">
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="AGENT IDENTITY"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-sm tracking-wide focus:border-primary/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 group">
              <div className="relative">
                <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  placeholder="NEURAL KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-white/10 pl-10 h-12 font-mono text-sm tracking-wide focus:border-primary/50"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20 group">
              <ShieldCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> 
              ESTABLISH UPLINK
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/signup')}
            className="w-full h-10 text-[10px] uppercase font-bold tracking-[0.2em] text-primary hover:bg-primary/5 border border-primary/20"
          >
            <Zap className="w-3 h-3 mr-2" /> ENROLL NEW NODE
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleGuestLogin} 
            className="w-full h-10 text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10"
          >
            ANONYMOUS NEURAL NODE
          </Button>
          
          <p className="text-[8px] text-center text-muted-foreground/40 uppercase tracking-[0.3em] font-mono">
            SECURED BY NEURO-FAST QUANTUM ENCRYPTION
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
