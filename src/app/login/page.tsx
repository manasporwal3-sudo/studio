'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/inventory');
    }
  }, [user, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    initiateEmailSignIn(auth, email, password);
  };

  const handleGuestLogin = () => {
    initiateAnonymousSignIn(auth);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md glass-panel border-white/5 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold font-headline tracking-tighter">NEURO-FAST LOGIN</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Secure Neural Access Protocol
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Agent Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/20 border-white/10"
                required
              />
            </div>
            <Button type="submit" className="w-full font-bold">
              <ShieldCheck className="w-4 h-4 mr-2" /> ESTABLISH LINK
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground">
              <span className="bg-[#0a0f1a] px-2">Alternative Access</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleGuestLogin} className="w-full border-white/10 hover:bg-white/5">
            <Zap className="w-4 h-4 mr-2" /> GUEST NEURAL NODE
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
