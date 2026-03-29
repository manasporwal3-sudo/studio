'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking, recordStoreActivity } from '@/firebase/non-blocking-updates';
import { bulkUploadInventory } from '@/firebase/firestore/bulk-upload';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ADMIN_EMAILS } from '@/services/auth-service';
import { 
  Shield, 
  Store, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Cpu,
  Package,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const inventoryItemSchema = z.object({
  name: z.string().min(1, "SKU Name required"),
  currentStock: z.coerce.number().min(0),
  costPrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  reorderPoint: z.coerce.number().min(0),
  sku: z.string().optional(),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number (10 digits)"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
  storeName: z.string().min(2, "Store name is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(10, "Full address is required"),
  pinCode: z.string().length(6, "PIN Code must be exactly 6 digits"),
  gstNumber: z.string().length(15, "GST must be 15 characters").optional().or(z.literal('')),
  inventory: z.array(inventoryItemSchema).min(1, "At least one SKU is required for node activation"),
  expectedOrders: z.coerce.number().min(1, "Required"),
  outletsCount: z.coerce.number().min(1, "Required"),
  terms: z.boolean().refine(val => val === true, "Must accept terms")
}).refine(data => data.password === data.confirmPassword, {
  message: "Neural Keys (passwords) do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, control } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { 
      terms: false,
      inventory: [{ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5, sku: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inventory"
  });

  const passwordValue = watch('password', '');
  const confirmPasswordValue = watch('confirmPassword', '');
  const formData = watch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw?.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return (score / 4) * 100;
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormValues | 'inventory')[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
      if (passwordValue !== confirmPasswordValue) {
        toast({
          title: "Security Mismatch",
          description: "Neural Keys do not match. Integrity check failed.",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 2) {
      fieldsToValidate = ['storeName', 'city', 'address', 'pinCode', 'gstNumber'];
    } else if (step === 3) {
      fieldsToValidate = ['inventory'];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    
    if (isValid) {
      setStep(step + 1);
    } else {
      const firstError = Object.keys(errors).find(k => fieldsToValidate.includes(k as any));
      const errorMsg = firstError ? (errors[firstError as keyof SignupFormValues] as any)?.message : "Please check your entries.";
      toast({
        title: "Validation Locked",
        description: errorMsg || "Required identity vectors missing.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      setUploadStatus("INITIALIZING IDENTITY...");
      const cred = await initiateEmailSignUp(auth, data.email, data.password);
      const user = cred.user;

      setUploadStatus("PROVISIONING HUB...");
      const role = ADMIN_EMAILS.includes(data.email.toLowerCase()) ? 'admin' : 'store';
      
      const userData = {
        uid: user.uid,
        displayName: data.fullName,
        email: data.email,
        phoneNumber: data.mobile,
        address: data.address,
        pinCode: data.pinCode,
        gstNumber: data.gstNumber,
        storeName: data.storeName,
        city: data.city,
        role: role,
        plan: 'Pro',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Provision User Identity
      setDocumentNonBlocking(doc(db, 'users', user.uid), userData, { merge: true });
      
      // 2. Provision Operational DarkStore Metadata (UID Consistency)
      if (role === 'store') {
        const darkStoreData = {
          storeId: user.uid,
          storeName: data.storeName,
          ownerUid: user.uid,
          city: data.city,
          address: data.address,
          pinCode: data.pinCode,
          gstNumber: data.gstNumber,
          plan: 'Pro',
          metrics: {
            totalOrders: 0,
            activeRiders: 0,
            revenue: 0,
            stockHealth: 100
          },
          createdAt: new Date().toISOString(),
        };
        setDocumentNonBlocking(doc(db, 'darkStores', user.uid), darkStoreData, { merge: true });
      }

      recordStoreActivity(db, user.uid);
      
      if (role === 'store') {
        setUploadStatus(`ENROLLING MESH (${data.inventory.length} SKUs)...`);
        await bulkUploadInventory(db, user.uid, data.inventory, (count) => {
          setUploadStatus(`ENROLLING MESH (${count} / ${data.inventory.length})...`);
        });
      }
      
      toast({ title: "Node Deployment Successful", description: `${role === 'admin' ? 'Admin terminal' : 'Dark Store node'} integrated into the global mesh.` });
      router.push(role === 'admin' ? '/admin/dashboard' : '/darkstore/inventory');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deployment Aborted", description: error.message });
      setUploadStatus(null);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020810] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-5xl tactical-panel border-none shadow-2xl overflow-hidden relative z-10">
        <div className="flex flex-col md:flex-row min-h-[750px]">
          {/* Sidebar Status HUD */}
          <div className="w-full md:w-80 bg-[#060d1c] p-10 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                <Shield className="text-primary w-7 h-7" />
              </div>
              <div>
                <h1 className="font-headline text-lg tracking-tighter text-white font-black italic uppercase">NEURO·FAST</h1>
                <p className="text-[9px] font-mono text-primary/60 uppercase tracking-[0.3em]">Sovereign Node v10.6</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'IDENTITY', desc: 'Neural Operator Profile', icon: <User className="w-4 h-4" /> },
                { id: 2, label: 'HUB CONFIG', desc: 'Geospatial Alignment', icon: <Store className="w-4 h-4" /> },
                { id: 3, label: 'MESH INIT', desc: 'SKU Inventory Enrollment', icon: <Package className="w-4 h-4" /> },
                { id: 4, label: 'DEPLOY', desc: 'Final Node Calibration', icon: <Cpu className="w-4 h-4" /> }
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-5 relative">
                  <div className={cn(
                    "w-10 h-10 flex items-center justify-center border-2 transition-all duration-500",
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
          <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar bg-black/40 backdrop-blur-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Operator Identity</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Establish primary neural link for node control.</p>
                    </div>
                    <div className="grid gap-6">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                        <p className="text-[9px] font-mono text-primary uppercase leading-relaxed font-bold">
                          Admin Hint: Use 'admin@neurofast.io' with 'Manas 123' for Sovereign Command Access.
                        </p>
                      </div>
                      <Input placeholder="OPERATOR FULL NAME" {...register('fullName')} className="cyber-input h-12" />
                      <Input placeholder="MOBILE NODE (+91)" {...register('mobile')} className="cyber-input h-12" />
                      <Input type="email" placeholder="EMAIL IDENTITY" {...register('email')} className="cyber-input h-12" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input type="password" placeholder="NEURAL KEY" {...register('password')} className="cyber-input h-12" />
                          <Progress value={getPasswordStrength(formData.password || '')} className="h-1 mt-2" />
                        </div>
                        <Input type="password" placeholder="CONFIRM KEY" {...register('confirmPassword')} className="cyber-input h-12" />
                      </div>
                      {(errors.password || errors.confirmPassword) && (
                        <p className="text-[10px] font-mono text-destructive uppercase">Security Vector Mismatch</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Hub Coordinates</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Define geospatial parameters of the Dark Store hub.</p>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="HUB NAME" {...register('storeName')} className="cyber-input h-12" />
                        <Input placeholder="CITY NODE" {...register('city')} className="cyber-input h-12" />
                      </div>
                      <Textarea placeholder="FULL GEOSPATIAL ADDRESS" {...register('address')} className="cyber-input min-h-[100px]" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="PIN CODE (6 DIGITS)" {...register('pinCode')} className="cyber-input h-12" />
                        <Input placeholder="GST IDENTIFIER (15 CHARS) (OPTIONAL)" {...register('gstNumber')} className="cyber-input h-12" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Mesh Initialization</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Manual SKU enrollment to establish baseline telemetry.</p>
                    </div>

                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-6 bg-white/5 border border-white/5 relative group space-y-4">
                          {index > 0 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => remove(index)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-primary uppercase tracking-widest flex items-center gap-1.5 ml-1 font-bold">
                                <Package className="w-3 h-3" /> SKU PRODUCT NAME
                              </label>
                              <Input placeholder="e.g. Organic Milk 1L" {...register(`inventory.${index}.name` as const)} className="cyber-input h-11" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                <Info className="w-3 h-3" /> SKU IDENTIFIER CODE (OPTIONAL)
                              </label>
                              <Input placeholder="HUB-SKU-001" {...register(`inventory.${index}.sku` as const)} className="cyber-input h-11" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Initial Stock</label>
                              <Input type="number" {...register(`inventory.${index}.currentStock` as const)} className="cyber-input h-11" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Reorder Point</label>
                              <Input type="number" {...register(`inventory.${index}.reorderPoint` as const)} className="cyber-input h-11" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-secondary uppercase tracking-widest ml-1 font-bold">Cost (₹)</label>
                              <Input type="number" {...register(`inventory.${index}.costPrice` as const)} className="cyber-input h-11 border-secondary/20" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-mono text-primary uppercase tracking-widest ml-1 font-bold">Sell (₹)</label>
                              <Input type="number" {...register(`inventory.${index}.sellingPrice` as const)} className="cyber-input h-11 border-primary/20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => append({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5, sku: '' })}
                      className="w-full border-dashed border-primary/40 text-primary h-14 font-headline text-[10px] tracking-[0.2em] uppercase"
                    >
                      <Plus className="w-4 h-4 mr-2" /> ENROLL ADDITIONAL SKU
                    </Button>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Operational Matrix</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Final review of node parameters before mesh deployment.</p>
                    </div>

                    <div className="grid gap-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono uppercase text-muted-foreground mb-1 block">DAILY ORDER VOLUME</label>
                          <Input type="number" {...register('expectedOrders')} className="cyber-input h-12" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono uppercase text-muted-foreground mb-1 block">HUB OUTLET COUNT</label>
                          <Input type="number" {...register('outletsCount')} className="cyber-input h-12" />
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-4 bg-white/5 border border-white/5">
                        <Checkbox 
                          id="terms" 
                          checked={formData.terms} 
                          onCheckedChange={(v) => setValue('terms', v as boolean)} 
                          className="border-primary mt-1" 
                        />
                        <label htmlFor="terms" className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider">
                          I accept the Sovereign Operating Protocol and authorize node telemetry logging.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8 border-t border-white/5">
                  {step > 1 && (
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setStep(step - 1)} 
                      className="flex-1 h-14 font-headline text-xs tracking-widest uppercase border-white/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> REVERT
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button 
                      type="button"
                      onClick={handleNext} 
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-primary text-black glow-cyan"
                    >
                      NEXT PROTOCOL <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleSubmit(onSubmit)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-secondary text-black shadow-[0_0_25px_rgba(0,255,136,0.3)]"
                    >
                      {loading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-[8px] font-mono mt-1">{uploadStatus || "DEPLOYING..."}</span>
                        </div>
                      ) : <><Zap className="w-5 h-5 mr-2" /> DEPLOY NODE</>}
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
