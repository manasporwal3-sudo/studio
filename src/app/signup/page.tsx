'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Store, User, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  // Step 1: Owner
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (10 digits)"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  // Step 2: Store
  storeName: z.string().min(2, "Store name is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(10, "Full address is required"),
  pinCode: z.string().length(6, "PIN Code must be exactly 6 digits"),
  gstNumber: z.string().length(15, "GST must be 15 characters").optional().or(z.literal('')),
  category: z.string().min(1, "Select a category"),
  expectedOrders: z.coerce.number().min(1, "Required"),
  outletsCount: z.coerce.number().min(1, "Required"),
  // Step 3: Terms
  plan: z.enum(["Free", "Pro"]),
  terms: z.boolean().refine(val => val === true, "Must accept terms")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { plan: 'Free', terms: false, category: 'Grocery' }
  });

  const password = watch('password', '');
  const formData = watch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return (score / 4) * 100;
  };

  const handleNext = async () => {
    const fields = step === 1 
      ? ['fullName', 'mobile', 'email', 'password', 'confirmPassword'] 
      : ['storeName', 'city', 'address', 'pinCode', 'category', 'expectedOrders', 'outletsCount'];
    
    const isValid = await trigger(fields as any);
    if (isValid) setStep(step + 1);
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const cred = await initiateEmailSignUp(auth, data.email, data.password);
      const user = cred.user;

      const userData = {
        id: user.uid,
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        email: data.email,
        phoneNumber: data.mobile,
        address: data.address,
        pinCode: data.pinCode,
        gstNumber: data.gstNumber,
        storeName: data.storeName,
        city: data.city,
        category: data.category,
        expectedDailyOrders: data.expectedOrders,
        outletsCount: data.outletsCount,
        roleIds: ['darkstore'],
        plan: data.plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDocumentNonBlocking(doc(db, 'users', user.uid), userData, { merge: true });
      
      toast({ title: "Registration Successful", description: "Your dark store node is now active." });
      router.push('/darkstore/inventory');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020810] selection:bg-primary/30">
      <div className="w-full max-w-5xl tactical-panel border-none shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[700px]">
          {/* Progress Sidebar */}
          <div className="w-full md:w-1/3 bg-[#060d1c] p-10 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <Shield className="text-primary w-10 h-10" />
              <div>
                <h1 className="font-headline text-xl tracking-tighter text-white">NEURO·FAST</h1>
                <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">SaaS Command Center</p>
              </div>
            </div>

            <div className="space-y-10">
              {[
                { id: 1, label: 'OWNER IDENTITY', desc: 'Personal parameters', icon: <User className="w-5 h-5" /> },
                { id: 2, label: 'HUB DETAILS', desc: 'Geospatial coordinates', icon: <Store className="w-5 h-5" /> },
                { id: 3, label: 'CONFIRMATION', desc: 'Final synchronization', icon: <Zap className="w-5 h-5" /> }
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-6 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    step === s.id ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,212,255,0.4)]" : 
                    step > s.id ? "border-secondary bg-secondary/20 text-secondary" : "border-white/10 text-muted-foreground"
                  )}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-headline text-xs">{s.id}</span>}
                  </div>
                  <div className="hidden md:block">
                    <p className={cn("text-xs font-headline tracking-widest", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/40 mt-1">{s.desc}</p>
                  </div>
                  {s.id < 3 && <div className="absolute left-5 top-10 w-0.5 h-10 bg-white/5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 md:p-16 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white">Owner Identity</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Establish your node operator profile.</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="space-y-1">
                        <Input placeholder="FULL NAME" {...register('fullName')} className="cyber-input h-12" />
                        {errors.fullName && <p className="text-[9px] text-destructive font-mono uppercase">{errors.fullName.message}</p>}
                      </div>
                      
                      <div className="space-y-1">
                        <Input placeholder="MOBILE NUMBER (+91)" {...register('mobile')} className="cyber-input h-12" />
                        {errors.mobile && <p className="text-[9px] text-destructive font-mono uppercase">{errors.mobile.message}</p>}
                      </div>

                      <div className="space-y-1">
                        <Input type="email" placeholder="EMAIL ADDRESS" {...register('email')} className="cyber-input h-12" />
                        {errors.email && <p className="text-[9px] text-destructive font-mono uppercase">{errors.email.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input type="password" placeholder="PASSWORD" {...register('password')} className="cyber-input h-12" />
                          <Progress value={getPasswordStrength(password)} className="h-1 mt-2" />
                          {errors.password && <p className="text-[9px] text-destructive font-mono uppercase mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input type="password" placeholder="CONFIRM KEY" {...register('confirmPassword')} className="cyber-input h-12" />
                          {errors.confirmPassword && <p className="text-[9px] text-destructive font-mono uppercase">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white">Hub Parameters</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Define the geospatial coordinates of your store.</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input placeholder="STORE NAME" {...register('storeName')} className="cyber-input h-12" />
                          {errors.storeName && <p className="text-[9px] text-destructive font-mono uppercase">{errors.storeName.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="CITY" {...register('city')} className="cyber-input h-12" />
                          {errors.city && <p className="text-[9px] text-destructive font-mono uppercase">{errors.city.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Textarea placeholder="FULL HUB ADDRESS" {...register('address')} className="cyber-input min-h-[100px]" />
                        {errors.address && <p className="text-[9px] text-destructive font-mono uppercase">{errors.address.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input placeholder="PIN CODE (6 DIGITS)" {...register('pinCode')} className="cyber-input h-12" />
                          {errors.pinCode && <p className="text-[9px] text-destructive font-mono uppercase">{errors.pinCode.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="GST NUMBER (15 CHARS)" {...register('gstNumber')} className="cyber-input h-12" />
                          {errors.gstNumber && <p className="text-[9px] text-destructive font-mono uppercase">{errors.gstNumber.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Store Category</label>
                        <Select onValueChange={(v) => setValue('category', v)} defaultValue="Grocery">
                          <SelectTrigger className="cyber-input h-12">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a1628] border-primary/20">
                            {["Grocery", "Pharmacy", "Bakery", "Electronics", "Fashion", "Kirana", "Fruits & Vegetables", "Other"].map(cat => (
                              <SelectItem key={cat} value={cat} className="text-xs font-mono">{cat.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input type="number" placeholder="DAILY ORDERS" {...register('expectedOrders')} className="cyber-input h-12" />
                        </div>
                        <div className="space-y-1">
                          <Input type="number" placeholder="OUTLETS" {...register('outletsCount')} className="cyber-input h-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white">Neural Uplink</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Review and finalize your node deployment.</p>
                    </div>

                    <Card className="bg-primary/5 border-primary/20 rounded-xl overflow-hidden">
                      <CardContent className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-8 font-mono text-[11px] uppercase">
                          <div><p className="text-muted-foreground mb-1">Operator</p><p className="text-white font-bold">{formData.fullName}</p></div>
                          <div><p className="text-muted-foreground mb-1">Hub Name</p><p className="text-white font-bold">{formData.storeName}</p></div>
                          <div><p className="text-muted-foreground mb-1">Location</p><p className="text-white font-bold">{formData.city}</p></div>
                          <div><p className="text-muted-foreground mb-1">Category</p><p className="text-primary font-bold">{formData.category}</p></div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <label className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Select Plan</label>
                      <div className="grid grid-cols-2 gap-4">
                        {["Free", "Pro"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setValue('plan', p as any)}
                            className={cn(
                              "p-6 tactical-panel transition-all before:hidden flex flex-col items-center gap-2",
                              formData.plan === p ? "bg-primary/20 border-primary" : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                          >
                            <span className="font-headline text-sm tracking-widest">{p.toUpperCase()}</span>
                            <span className="font-mono text-[8px] opacity-50">{p === 'Free' ? '$0/MO' : '$99/MO'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-5 bg-white/5 border border-white/10 rounded-xl">
                      <Checkbox 
                        id="terms" 
                        checked={formData.terms} 
                        onCheckedChange={(v) => setValue('terms', v as boolean)} 
                        className="border-primary" 
                      />
                      <label htmlFor="terms" className="text-[9px] font-mono text-muted-foreground uppercase cursor-pointer leading-relaxed">
                        I authorize NEURO-FAST to manage my inventory telemetry and accept the Sovereign Node Operating Protocol.
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-10">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(step - 1)} 
                      className="flex-1 h-14 font-headline text-xs tracking-widest uppercase border-white/10 hover:bg-white/5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button 
                      onClick={handleNext} 
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-primary text-black hover:bg-primary/80 glow-cyan"
                    >
                      Initialize Link <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit(onSubmit)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-secondary text-black hover:bg-secondary/80 shadow-[0_0_25px_rgba(0,255,136,0.3)]"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 mr-2" /> Register My Dark Store</>}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}