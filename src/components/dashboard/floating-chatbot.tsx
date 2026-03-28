'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, X, Terminal, Loader2, Cpu } from 'lucide-react';
import { askStoreHelper } from '@/ai/flows/store-helper-flow';
import { useDarkStoreOS } from '@/hooks/use-darkstore-os';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const { inventory } = useDarkStoreOS(user?.uid || 'primary');
  
  const ridersQuery = useMemoFirebase(() => collection(db, 'riders'), [db]);
  const { data: riders } = useCollection(ridersQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askStoreHelper({
        storeId: user?.uid || 'BLR-HUB',
        inventory: JSON.stringify(inventory),
        riders: JSON.stringify(riders || []),
        userMessage: userMsg,
        history: messages
      });

      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "ERROR: NEURAL UPLINK TIMEOUT. CHECK CORE SYSTEMS." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 left-10 z-[60]">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-3xl bg-[#00d4ff] text-black shadow-[0_0_40px_rgba(0,212,255,0.4)] hover:scale-105 transition-all p-0 flex items-center justify-center group"
        >
          <Cpu className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </Button>
      ) : (
        <Card className="w-96 h-[550px] tactical-panel bg-[#060d1c] border-primary/40 flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom-5 duration-300">
          <CardHeader className="bg-primary/10 p-5 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="font-headline text-xs tracking-widest text-white uppercase">NEURO·FAST GROK</CardTitle>
                <p className="text-[9px] font-mono text-primary/60 uppercase">Autonomous Agent v1.0</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-3 opacity-40">
                <Cpu className="w-8 h-8 mx-auto text-primary animate-pulse" />
                <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">System ready. Awaiting operational query regarding node telemetry.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "p-4 rounded-sm text-[11px] font-mono leading-relaxed",
                m.role === 'user' ? "bg-white/5 ml-8 border-r-2 border-primary" : "bg-primary/5 mr-8 border-l-2 border-primary text-white"
              )}>
                <span className="text-[8px] block mb-1 opacity-50">{m.role === 'user' ? 'OPERATOR' : 'GROK·OS'}</span>
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 p-4 bg-primary/5 mr-8 border-l-2 border-primary">
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                <span className="font-mono text-[10px] animate-pulse">Processing node data...</span>
              </div>
            )}
          </CardContent>

          <div className="p-5 border-t border-white/5 bg-black/40">
            <div className="relative">
              <Input 
                placeholder="ASK GROK..." 
                className="cyber-input h-12 pr-12" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Button 
                onClick={handleSend}
                size="icon" 
                variant="ghost" 
                className="absolute right-2 top-2 text-primary hover:bg-primary/10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}