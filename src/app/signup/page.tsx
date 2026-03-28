'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Store, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Package, 
  Plus, 
  Trash2,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

const inventorySchema = z.object({
  name: z.string().min(2, "Name required"),
  currentStock: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0),
});

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
  expectedOrders: z.coerce.number().min(1, "Required"),
  outletsCount: z.coerce.number().min(1, "Required"),
  // Step 3: Inventory
  inventory: z.array(inventorySchema).min(1, "Add at least one SKU to initialize the node mesh"),
  // Step 4: Terms
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

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, control } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      plan: 'Free', 
      terms: false,
      inventory: [{ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inventory"
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
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['storeName', 'city', 'address', 'pinCode', 'expectedOrders', 'outletsCount'];
    if (step === 3) fieldsToValidate = ['inventory'];
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) setStep(step + 1);
    else {
      toast({
        title: "Tactical Error",
        description: "Please correct the highlighted parameters before proceeding.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const cred = await initiateEmailSignUp(auth, data.email, data.password);
      const user = cred.user;

      // 1. Create User Profile
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
        expectedDailyOrders: data.expectedOrders,
        outletsCount: data.outletsCount,
        roleIds: ['darkstore'],
        plan: data.plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDocumentNonBlocking(doc(db, 'users', user.uid), userData, { merge: true });

      // 2. Initialize Inventory Mesh
      data.inventory.forEach((item) => {
        addDocumentNonBlocking(collection(db, 'users', user.uid, 'inventory'), {
          ...item,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      });
      
      toast({ title: "Node Enrollment Complete", description: "Your dark store hub is now live in the neural mesh." });
      router.push('/darkstore/inventory');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deployment Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020810] selection:bg-primary/30 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-6xl tactical-panel border-none shadow-2xl overflow-hidden relative z-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row min-h-[750px]">
          {/* Progress Sidebar */}
          <div className="w-full md:w-80 bg-[#060d1c] p-10 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <Shield className="text-primary w-7 h-7" />
              </div>
              <div>
                <h1 className="font-headline text-lg tracking-tighter text-white font-black italic">NEURO·FAST</h1>
                <p className="text-[9px] font-mono text-primary/60 uppercase tracking-[0.3em]">Sovereign Node v9.0</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'OPERATOR', desc: 'Identity Protocol', icon: <User className="w-4 h-4" /> },
                { id: 2, label: 'HUB CONFIG', desc: 'Node Coordinates', icon: <Store className="w-4 h-4" /> },
                { id: 3, label: 'MESH INIT', desc: 'SKU Inventory', icon: <Package className="w-4 h-4" /> },
                { id: 4, label: 'FINAL SYNC', desc: 'Uplink Confirmation', icon: <Zap className="w-4 h-4" /> }
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-5 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-sm flex items-center justify-center border-2 transition-all duration-500",
                    step === s.id ? "border-primary bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,212,255,0.4)]" : 
                    step > s.id ? "border-secondary bg-secondary/20 text-secondary" : "border-white/10 text-muted-foreground/40"
                  )}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-headline text-xs">{s.id}</span>}
                  </div>
                  <div className="hidden md:block">
                    <p className={cn("text-[10px] font-headline tracking-widest uppercase", step === s.id ? "text-primary" : "text-muted-foreground/60")}>{s.label}</p>
                    <p className="text-[8px] font-mono text-muted-foreground/40 mt-1 uppercase tracking-tighter">{s.desc}</p>
                  </div>
                  {s.id < 4 && <div className="absolute left-5 top-10 w-px h-8 bg-white/5" />}
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 md:p-16 overflow-y-auto max-h-[85vh] custom-scrollbar bg-black/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-10"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Operator Identity</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Establish the primary node controller profile.</p>
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
                          <Input type="password" placeholder="NEURAL KEY (PASSWORD)" {...register('password')} className="cyber-input h-12" />
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
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Hub Coordinates</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Define the physical parameters of this Dark Store node.</p>
                    </div>
                    
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input placeholder="STORE HUB NAME" {...register('storeName')} className="cyber-input h-12" />
                          {errors.storeName && <p className="text-[9px] text-destructive font-mono uppercase">{errors.storeName.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="CITY" {...register('city')} className="cyber-input h-12" />
                          {errors.city && <p className="text-[9px] text-destructive font-mono uppercase">{errors.city.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Textarea placeholder="FULL HUB GEOLOCATION ADDRESS" {...register('address')} className="cyber-input min-h-[100px]" />
                        {errors.address && <p className="text-[9px] text-destructive font-mono uppercase">{errors.address.message}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input placeholder="PIN CODE (6 DIGITS)" {...register('pinCode')} className="cyber-input h-12" />
                          {errors.pinCode && <p className="text-[9px] text-destructive font-mono uppercase">{errors.pinCode.message}</p>}
                        </div>
                        <div className="space-y-1">
                          <Input placeholder="GST NUMBER (OPTIONAL)" {...register('gstNumber')} className="cyber-input h-12" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono uppercase text-muted-foreground mb-1 block">DAILY ORDER VOLUME</label>
                          <Input type="number" placeholder="EXPECTED ORDERS" {...register('expectedOrders')} className="cyber-input h-12" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono uppercase text-muted-foreground mb-1 block">NETWORK OUTLETS</label>
                          <Input type="number" placeholder="HUB COUNT" {...register('outletsCount')} className="cyber-input h-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Mesh Initialization</h2>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Populate the hub with real SKUs. No simulation data used.</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => append({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5 })}
                        className="font-mono text-[9px] uppercase tracking-widest border-primary/20 hover:bg-primary/5 h-10 px-4"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add SKU
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-5 tactical-panel bg-black/40 border-white/5 before:hidden flex gap-4 group">
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="col-span-2">
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">SKU Name</label>
                              <Input {...register(`inventory.${index}.name` as const)} placeholder="Organic Milk..." className="cyber-input h-9 text-xs" />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Stock</label>
                              <Input type="number" {...register(`inventory.${index}.currentStock` as const)} className="cyber-input h-9 text-xs" />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Cost ₹</label>
                              <Input type="number" {...register(`inventory.${index}.costPrice` as const)} className="cyber-input h-9 text-xs" />
                            </div>
                            <div>
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Sell ₹</label>
                              <Input type="number" {...register(`inventory.${index}.sellingPrice` as const)} className="cyber-input h-9 text-xs" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-end">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => remove(index)}
                              className="text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {errors.inventory && <p className="text-[9px] text-destructive font-mono uppercase text-center mt-4">{errors.inventory.message}</p>}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Neural Uplink</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Review and finalize node deployment parameters.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="col-span-2 bg-primary/5 border-primary/20 rounded-sm overflow-hidden before:hidden p-0">
                        <div className="bg-white/5 p-4 border-b border-white/5 flex items-center justify-between">
                          <span className="font-headline text-[10px] uppercase tracking-widest text-primary">Deployment Manifest</span>
                          <Cpu className="w-3 h-3 text-primary animate-pulse" />
                        </div>
                        <div className="p-8 grid grid-cols-2 gap-8 font-mono text-[11px] uppercase">
                          <div><p className="text-muted-foreground/40 mb-1">Node Operator</p><p className="text-white font-bold">{formData.fullName}</p></div>
                          <div><p className="text-muted-foreground/40 mb-1">Hub Identifier</p><p className="text-white font-bold">{formData.storeName}</p></div>
                          <div><p className="text-muted-foreground/40 mb-1">Mesh Coordinates</p><p className="text-white font-bold">{formData.city}</p></div>
                          <div><p className="text-muted-foreground/40 mb-1">SKU Count</p><p className="text-primary font-bold">{formData.inventory?.length || 0} ITEMS</p></div>
                        </div>
                      </Card>

                      <div className="space-y-4">
                        <label className="font-headline text-[10px] uppercase text-muted-foreground tracking-[0.2em] block">Sovereign Plan</label>
                        {["Free", "Pro"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setValue('plan', p as any)}
                            className={cn(
                              "w-full p-5 tactical-panel transition-all duration-300 before:hidden flex justify-between items-center group",
                              formData.plan === p ? "bg-primary/20 border-primary" : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                          >
                            <span className="font-headline text-xs tracking-widest uppercase">{p}</span>
                            <span className="font-mono text-[9px] opacity-50">{p === 'Free' ? '0/MO' : '99/MO'}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-6 bg-white/5 border border-white/5 rounded-sm">
                      <Checkbox 
                        id="terms" 
                        checked={formData.terms} 
                        onCheckedChange={(v) => setValue('terms', v as boolean)} 
                        className="border-primary mt-1" 
                      />
                      <label htmlFor="terms" className="text-[9px] font-mono text-muted-foreground uppercase cursor-pointer leading-relaxed tracking-wider">
                        I authorize NEURO-FAST to manage my operational telemetry and confirm the accuracy of the initialized inventory mesh. I accept the Sovereign Node Operating Protocol.
                      </label>
                    </div>
                  </div>
                )}

                {/* Tactical Footer Navigation */}
                <div className="flex gap-4 pt-10 border-t border-white/5">
                  {step > 1 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(step - 1)} 
                      className="flex-1 h-14 font-headline text-xs tracking-widest uppercase border-white/10 hover:bg-white/5 rounded-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button 
                      onClick={handleNext} 
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-primary text-black hover:bg-primary/80 glow-cyan rounded-sm"
                    >
                      Next Protocol <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit(onSubmit)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-secondary text-black hover:bg-secondary/80 shadow-[0_0_25px_rgba(0,255,136,0.3)] rounded-sm"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5 mr-2" /> Deploy Dark Store Node</>}
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-8 font-mono text-[9px] text-muted-foreground/20 uppercase tracking-[0.5em] pointer-events-none">
        UPLINK: ENCRYPTED // NODE_INIT: V9.0
      </div>
    </div>
  );
}
