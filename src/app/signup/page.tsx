'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { bulkUploadInventory } from '@/firebase/firestore/bulk-upload';
import { doc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
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
  FileSpreadsheet
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
  plan: z.enum(["Free", "Pro"]),
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, control } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { 
      plan: 'Free', 
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
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return (score / 4) * 100;
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof SignupFormValues | 'inventory')[] = [];
    if (step === 1) {
      fieldsToValidate = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['storeName', 'city', 'address', 'pinCode', 'gstNumber'];
    } else if (step === 3) {
      fieldsToValidate = ['inventory'];
    }
    
    // Explicitly validate password match if in step 1
    if (step === 1 && passwordValue !== confirmPasswordValue) {
      toast({
        title: "Security Mismatch",
        description: "Neural Keys (passwords) do not match.",
        variant: "destructive"
      });
      return;
    }

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    } else {
      const firstError = Object.keys(errors).find(k => fieldsToValidate.includes(k as any));
      const errorMsg = firstError ? (errors[firstError as keyof SignupFormValues] as any)?.message : "Please check your entries.";
      toast({
        title: "Step Validation Failed",
        description: errorMsg || "Required identity vectors missing.",
        variant: "destructive"
      });
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data.map((row: any) => ({
          name: row.Name || row.name || "",
          sku: row.SKU || row.sku || "",
          currentStock: Number(row.Stock || row.currentStock || 0),
          reorderPoint: Number(row["Reorder Point"] || row.reorderPoint || 5),
          costPrice: Number(row["Cost Price"] || row.costPrice || 0),
          sellingPrice: Number(row["Selling Price"] || row.sellingPrice || 0),
        })).filter(item => item.name);
        
        if (parsedData.length > 0) {
          if (fields.length === 1 && !fields[0].name) {
            remove(0);
          }
          parsedData.forEach(item => append(item));
          toast({ 
            title: "Bulk Mesh Uplink Ready", 
            description: `${parsedData.length} SKUs prepared for node integration.` 
          });
        }
      }
    });
  };

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      setUploadStatus("ESTABLISHING IDENTITY...");
      const cred = await initiateEmailSignUp(auth, data.email, data.password);
      const user = cred.user;

      setUploadStatus("CONFIGURING HUB...");
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
      
      setUploadStatus(`INTEGRATING MESH (0 / ${data.inventory.length})...`);
      await bulkUploadInventory(db, user.uid, data.inventory, (count) => {
        setUploadStatus(`INTEGRATING MESH (${count} / ${data.inventory.length})...`);
      });
      
      toast({ title: "Node Enrollment Complete", description: "Your dark store hub is now live in the neural mesh." });
      router.push('/darkstore/inventory');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Deployment Failed", description: error.message });
      setUploadStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = () => {
    toast({
      title: "Deployment Aborted",
      description: "Validation failed. Please review all steps.",
      variant: "destructive"
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020810] selection:bg-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[160px] animate-pulse delay-700" />
      </div>

      <div className="w-full max-w-5xl tactical-panel border-none shadow-2xl overflow-hidden relative z-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row min-h-[750px]">
          <div className="w-full md:w-80 bg-[#060d1c] p-10 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.2)] rounded-sm">
                <Shield className="text-primary w-7 h-7" />
              </div>
              <div>
                <h1 className="font-headline text-lg tracking-tighter text-white font-black italic uppercase">NEURO·FAST</h1>
                <p className="text-[9px] font-mono text-primary/60 uppercase tracking-[0.3em]">Sovereign Node v10.1</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'OPERATOR', desc: 'Identity Protocol', icon: <User className="w-4 h-4" /> },
                { id: 2, label: 'HUB CONFIG', desc: 'Node Coordinates', icon: <Store className="w-4 h-4" /> },
                { id: 3, label: 'MESH INIT', desc: 'SKU Optimization', icon: <Package className="w-4 h-4" /> },
                { id: 4, label: 'DEPLOY', desc: 'Final Calibration', icon: <Cpu className="w-4 h-4" /> }
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

          <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar bg-black/40">
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
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Establish primary node controller profile.</p>
                    </div>
                    <div className="grid gap-6">
                      <Input placeholder="FULL NAME" {...register('fullName')} className="cyber-input h-12" />
                      <Input placeholder="MOBILE NUMBER (+91)" {...register('mobile')} className="cyber-input h-12" />
                      <Input type="email" placeholder="EMAIL ADDRESS" {...register('email')} className="cyber-input h-12" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Input type="password" placeholder="NEURAL KEY" {...register('password')} className="cyber-input h-12" />
                          <Progress value={getPasswordStrength(formData.password || '')} className="h-1 mt-2" />
                        </div>
                        <Input type="password" placeholder="CONFIRM KEY" {...register('confirmPassword')} className="cyber-input h-12" />
                      </div>
                      {(errors.password || errors.confirmPassword) && (
                        <p className="text-[10px] font-mono text-destructive uppercase">
                          {errors.password?.message || errors.confirmPassword?.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Hub Coordinates</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Define physical parameters of the Dark Store node.</p>
                    </div>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="STORE HUB NAME" {...register('storeName')} className="cyber-input h-12" />
                        <Input placeholder="CITY" {...register('city')} className="cyber-input h-12" />
                      </div>
                      <Textarea placeholder="FULL HUB GEOLOCATION ADDRESS" {...register('address')} className="cyber-input min-h-[100px]" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="PIN CODE (6 DIGITS)" {...register('pinCode')} className="cyber-input h-12" />
                        <Input placeholder="GST NUMBER (15 CHARS)" {...register('gstNumber')} className="cyber-input h-12" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Mesh Initialization</h2>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Upload spreadsheet or manual enrollment.</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          accept=".csv" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleCsvUpload} 
                        />
                        <Button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-secondary/20 text-secondary border border-secondary/30 font-mono text-[9px] tracking-widest uppercase hover:bg-secondary/40"
                        >
                          <FileSpreadsheet className="w-3 h-3 mr-2" />
                          BULK UPLINK (.CSV)
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-white/5 border border-white/5 rounded-sm relative group">
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
                            <Input placeholder="SKU NAME" {...register(`inventory.${index}.name` as const)} className="cyber-input" />
                            <Input placeholder="SKU CODE (OPTIONAL)" {...register(`inventory.${index}.sku` as const)} className="cyber-input" />
                            <div className="grid grid-cols-2 gap-4">
                              <Input type="number" placeholder="STOCK" {...register(`inventory.${index}.currentStock` as const)} className="cyber-input" />
                              <Input type="number" placeholder="REORDER PT" {...register(`inventory.${index}.reorderPoint` as const)} className="cyber-input" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <Input type="number" placeholder="COST PRICE ₹" {...register(`inventory.${index}.costPrice` as const)} className="cyber-input" />
                              <Input type="number" placeholder="SELL PRICE ₹" {...register(`inventory.${index}.sellingPrice` as const)} className="cyber-input" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => append({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 5, sku: '' })}
                      className="w-full border-dashed border-primary/40 text-primary h-12 font-mono text-xs"
                    >
                      <Plus className="w-4 h-4 mr-2" /> ENROLL ADDITIONAL SKU
                    </Button>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-headline italic tracking-tighter uppercase text-white font-black">Operational Matrix</h2>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Review deployment parameters and confirm uplink.</p>
                    </div>

                    <div className="grid gap-6">
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
                      <div className="space-y-4">
                        <label className="text-[8px] font-mono uppercase text-muted-foreground tracking-widest">PLAN SELECTION</label>
                        <div className="flex gap-4">
                          {["Free", "Pro"].map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setValue('plan', p as any)}
                              className={cn(
                                "flex-1 p-4 tactical-panel transition-all before:hidden flex justify-between items-center",
                                formData.plan === p ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)]" : "bg-white/5 border-white/5"
                              )}
                            >
                              <span className="font-headline text-[10px] uppercase">{p} Node</span>
                              <span className="font-mono text-[9px] opacity-40">{p === 'Free' ? '0/MO' : '99/MO'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-white/5 border border-white/5 rounded-sm">
                        <Checkbox 
                          id="terms" 
                          checked={formData.terms} 
                          onCheckedChange={(v) => setValue('terms', v as boolean)} 
                          className="border-primary mt-1" 
                        />
                        <label htmlFor="terms" className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed tracking-wider">
                          I accept the Sovereign Node Operating Protocol and authorize operational telemetry management.
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
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button 
                      type="button"
                      onClick={handleNext} 
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-primary text-black glow-cyan"
                    >
                      Next Protocol <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      type="button"
                      onClick={handleSubmit(onSubmit, onInvalid)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-14 font-headline text-xs tracking-widest uppercase bg-secondary text-black shadow-[0_0_25px_rgba(0,255,136,0.3)]"
                    >
                      {loading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-[8px] font-mono mt-1">{uploadStatus || "DEPLOYING..."}</span>
                        </div>
                      ) : <><Zap className="w-5 h-5 mr-2" /> Deploy Node</>}
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