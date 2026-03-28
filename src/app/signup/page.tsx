
'use client';

import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Store, User, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const signupSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars").regex(/[A-Z]/, "Need uppercase").regex(/[0-9]/, "Need number"),
  confirmPassword: z.string(),
  storeName: z.string().min(2, "Store name required"),
  city: z.string().min(2, "City required"),
  address: z.string().min(10, "Address too short"),
  pinCode: z.string().length(6, "PIN must be 6 digits"),
  gstNumber: z.string().length(15, "GST must be 15 chars").optional().or(z.literal('')),
  category: z.string().min(1, "Select category"),
  expectedOrders: z.coerce.number().min(1),
  outletsCount: z.coerce.number().min(1),
  plan: z.enum(["Free", "Pro"]),
  terms: z.boolean().refine(val => val === true, "Must accept terms")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { plan: 'Free', terms: false }
  });

  const formData = watch();

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormValues)[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['storeName', 'city', 'address', 'pinCode', 'category', 'expectedOrders', 'outletsCount'];
    
    const isValid = await trigger(fieldsToValidate);
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
        expectedDailyOrders: data.expectedOrders,
        outletsCount: data.outletsCount,
        roleIds: ['owner'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDocumentNonBlocking(doc(db, 'users', user.uid), userData, { merge: true });
      
      toast({ title: "Registration Successful", description: "Welcome to Neuro-Fast Sovereign." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="w-full max-w-4xl cyber-panel border-none shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Sidebar / Progress */}
          <div className="w-full md:w-1/3 bg-black/40 p-8 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <div>
                <h1 className="font-headline text-lg tracking-tighter">NEURO·FAST</h1>
                <p className="text-[10px] font-mono text-primary/60 uppercase">Node Deployment v9.0</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'OWNER', desc: 'Identify Identity' },
                { id: 2, label: 'STORE', desc: 'Hub Configuration' },
                { id: 3, label: 'CONFIRM', desc: 'Neural Authorization' }
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-4 group">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs border transition-all",
                    step === s.id ? "bg-primary border-primary text-black glow-cyan" : 
                    step > s.id ? "bg-secondary border-secondary text-black" : "border-white/10 text-muted-foreground"
                  )}>
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <div>
                    <p className={cn("text-xs font-headline tracking-widest", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/40">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline italic tracking-tighter">OWNER REGISTRATION</h2>
                    <div className="grid gap-4">
                      <div className="space-y-1">
                        <Input placeholder="FULL NAME" {...register('fullName')} className="cyber-input" />
                        {errors.fullName && <p className="text-[10px] text-destructive font-mono">{errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <Input placeholder="MOBILE NUMBER (+91)" {...register('mobile')} className="cyber-input" />
                        {errors.mobile && <p className="text-[10px] text-destructive font-mono">{errors.mobile.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <Input type="email" placeholder="EMAIL ADDRESS" {...register('email')} className="cyber-input" />
                        {errors.email && <p className="text-[10px] text-destructive font-mono">{errors.email.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Input type="password" placeholder="PASSWORD" {...register('password')} className="cyber-input" />
                          {errors.password && <p className="text-[10px] text-destructive font-mono">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input type="password" placeholder="CONFIRM" {...register('confirmPassword')} className="cyber-input" />
                          {errors.confirmPassword && <p className="text-[10px] text-destructive font-mono">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline italic tracking-tighter">STORE TELEMETRY</h2>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Input placeholder="STORE NAME" {...register('storeName')} className="cyber-input" />
                          {errors.storeName && <p className="text-[10px] text-destructive font-mono">{errors.storeName.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="CITY" {...register('city')} className="cyber-input" />
                          {errors.city && <p className="text-[10px] text-destructive font-mono">{errors.city.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Textarea placeholder="FULL ADDRESS" {...register('address')} className="cyber-input min-h-[80px]" />
                        {errors.address && <p className="text-[10px] text-destructive font-mono">{errors.address.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Input placeholder="PIN CODE" {...register('pinCode')} className="cyber-input" />
                          {errors.pinCode && <p className="text-[10px] text-destructive font-mono">{errors.pinCode.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="GST NUMBER (OPTIONAL)" {...register('gstNumber')} className="cyber-input" />
                          {errors.gstNumber && <p className="text-[10px] text-destructive font-mono">{errors.gstNumber.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Select onValueChange={(val) => setValue('category', val)}>
                          <SelectTrigger className="cyber-input">
                            <SelectValue placeholder="CATEGORY" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-primary/20">
                            {["Grocery", "Pharmacy", "Bakery", "Electronics", "Kirana", "Fruits & Veg"].map(cat => (
                              <SelectItem key={cat} value={cat}>{cat.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input type="number" placeholder="DAILY ORDERS" {...register('expectedOrders')} className="cyber-input" />
                        <Input type="number" placeholder="OUTLETS" {...register('outletsCount')} className="cyber-input" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline italic tracking-tighter">NEURAL CONFIRMATION</h2>
                    <Card className="bg-white/5 border-white/5 p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono uppercase">
                        <div><p className="text-muted-foreground">Manager</p><p className="text-primary">{formData.fullName}</p></div>
                        <div><p className="text-muted-foreground">Hub</p><p className="text-primary">{formData.storeName}</p></div>
                        <div className="col-span-2"><p className="text-muted-foreground">Deployment Vector</p><p className="text-primary">{formData.address}, {formData.city}</p></div>
                      </div>
                    </Card>

                    <div className="grid grid-cols-2 gap-4">
                      {["Free", "Pro"].map(p => (
                        <div 
                          key={p}
                          onClick={() => setValue('plan', p as "Free" | "Pro")}
                          className={cn(
                            "p-4 border cursor-pointer transition-all",
                            formData.plan === p ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,212,255,0.2)]" : "border-white/10 hover:border-white/30"
                          )}
                        >
                          <p className="font-headline text-xs">{p} PROTOCOL</p>
                          <p className="text-[9px] font-mono text-muted-foreground mt-1">
                            {p === 'Free' ? 'Baseline Analysis' : 'Apex Intelligence Engine'}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" onCheckedChange={(val) => setValue('terms', val as boolean)} />
                      <label htmlFor="terms" className="text-[10px] font-mono text-muted-foreground uppercase cursor-pointer">Accept Node Operator Terms & Conditions</label>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-12 font-headline text-[10px] tracking-widest">
                      <ArrowLeft className="w-4 h-4 mr-2" /> REVERT
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button onClick={handleNext} className="flex-[2] h-12 font-headline text-[10px] tracking-widest bg-primary text-black hover:bg-primary/80 glow-cyan">
                      NEXT VECTOR <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit(onSubmit)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-12 font-headline text-[10px] tracking-widest bg-secondary text-black hover:bg-secondary/80 glow-green"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-2" /> INITIALIZE DARK STORE</>}
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
