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
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Zap, Package, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name required"),
  currentStock: z.coerce.number().min(0, "Stock cannot be negative"),
  costPrice: z.coerce.number().min(0.01, "Cost required"),
  sellingPrice: z.coerce.number().min(0.01, "Price required"),
  reorderPoint: z.coerce.number().min(1, "ROP required"),
});

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
  gstNumber: z.string().max(15).optional().or(z.literal('')),
  expectedOrders: z.coerce.number().min(1, "Daily orders required"),
  outletsCount: z.coerce.number().min(1, "Outlets count required"),
  initialInventory: z.array(inventoryItemSchema).min(1, "Add at least one SKU"),
  plan: z.enum(["Free", "Pro"]),
  terms: z.boolean().refine(val => val === true, "Must accept terms")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, control } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { 
      plan: 'Free', 
      terms: false,
      expectedOrders: 0,
      outletsCount: 1,
      initialInventory: [{ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 10 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "initialInventory"
  });

  const formData = watch();

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
    if (step === 2) fieldsToValidate = ['storeName', 'city', 'address', 'pinCode', 'expectedOrders', 'outletsCount'];
    if (step === 3) fieldsToValidate = ['initialInventory'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    } else {
      toast({
        variant: "destructive",
        title: "Deployment Gap Detected",
        description: "Complete all tactical parameters before proceeding.",
      });
    }
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
        roleIds: ['darkstore'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create Store Profile
      setDocumentNonBlocking(doc(db, 'users', user.uid), userData, { merge: true });
      
      // Initialize Inventory Mesh
      data.initialInventory.forEach(item => {
        addDocumentNonBlocking(collection(db, 'users', user.uid, 'inventory'), {
          ...item,
          category: 'General',
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      });
      
      toast({ title: "Node Initialized", description: "Your dark store is now live on the Sovereign Mesh." });
      router.push('/darkstore/inventory');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Uplink Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden relative">
      <div className="w-full max-w-5xl cyber-panel border-none shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row min-h-[700px]">
          {/* Sidebar */}
          <div className="w-full md:w-1/4 bg-black/40 p-8 border-r border-white/5 space-y-12">
            <div className="flex items-center gap-4">
              <Shield className="text-primary w-8 h-8" />
              <div>
                <h1 className="font-headline text-lg tracking-tighter">NEURO·FAST</h1>
                <p className="text-[10px] font-mono text-primary/60 uppercase">Apex v9.0 Deploy</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { id: 1, label: 'IDENTITY', desc: 'Node Operator' },
                { id: 2, label: 'HUB', desc: 'Geo-Coordinates' },
                { id: 3, label: 'INVENTORY', desc: 'SKU Brain' },
                { id: 4, label: 'AUTHORIZE', desc: 'Sovereign Key' }
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs border transition-all",
                    step === s.id ? "bg-primary border-primary text-black glow-cyan" : 
                    step > s.id ? "bg-secondary border-secondary text-black" : "border-white/10 text-muted-foreground"
                  )}>
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <div className="hidden lg:block">
                    <p className={cn("text-xs font-headline tracking-widest", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</p>
                    <p className="text-[8px] font-mono text-muted-foreground/40">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh]">
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
                    <h2 className="text-2xl font-headline italic tracking-tighter uppercase">Operator Identity</h2>
                    <div className="grid gap-4">
                      <Input placeholder="FULL NAME" {...register('fullName')} className="cyber-input" />
                      <Input placeholder="MOBILE NUMBER" {...register('mobile')} className="cyber-input" />
                      <Input type="email" placeholder="EMAIL ADDRESS" {...register('email')} className="cyber-input" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="password" placeholder="NEURAL KEY" {...register('password')} className="cyber-input" />
                        <Input type="password" placeholder="CONFIRM KEY" {...register('confirmPassword')} className="cyber-input" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline italic tracking-tighter uppercase">Hub Coordinates</h2>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="STORE NAME" {...register('storeName')} className="cyber-input" />
                        <Input placeholder="CITY" {...register('city')} className="cyber-input" />
                      </div>
                      <Textarea placeholder="FULL HUB ADDRESS" {...register('address')} className="cyber-input min-h-[80px]" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="PIN CODE" {...register('pinCode')} className="cyber-input" />
                        <Input placeholder="GST NUMBER (OPTIONAL)" {...register('gstNumber')} className="cyber-input" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" placeholder="EXPECTED DAILY ORDERS" {...register('expectedOrders')} className="cyber-input" />
                        <Input type="number" placeholder="OUTLETS" {...register('outletsCount')} className="cyber-input" />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-headline italic tracking-tighter uppercase">Initial Inventory</h2>
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', currentStock: 0, costPrice: 0, sellingPrice: 0, reorderPoint: 10 })} className="font-mono text-[10px]">
                        <Plus className="w-3 h-3 mr-1" /> ADD SKU
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border border-white/5 bg-white/5 space-y-4 relative group">
                          {fields.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Input placeholder="SKU NAME" {...register(`initialInventory.${index}.name`)} className="cyber-input" />
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Stock</label>
                              <Input type="number" {...register(`initialInventory.${index}.currentStock`)} className="cyber-input h-8" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Cost (₹)</label>
                              <Input type="number" step="0.01" {...register(`initialInventory.${index}.costPrice`)} className="cyber-input h-8" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">Price (₹)</label>
                              <Input type="number" step="0.01" {...register(`initialInventory.${index}.sellingPrice`)} className="cyber-input h-8" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-mono text-muted-foreground uppercase">ROP</label>
                              <Input type="number" {...register(`initialInventory.${index}.reorderPoint`)} className="cyber-input h-8" />
                            </div>
                          </div>
                        </div>
                      ))}
                      {errors.initialInventory && <p className="text-[10px] text-destructive font-mono">{errors.initialInventory.message}</p>}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-headline italic tracking-tighter uppercase">Deployment Protocol</h2>
                    <Card className="bg-white/5 border-white/5 p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-mono uppercase">
                        <div><p className="text-muted-foreground">Manager</p><p className="text-primary">{formData.fullName}</p></div>
                        <div><p className="text-muted-foreground">Hub</p><p className="text-primary">{formData.storeName}</p></div>
                        <div><p className="text-muted-foreground">Inventory</p><p className="text-primary">{formData.initialInventory.length} SKUs READY</p></div>
                        <div><p className="text-muted-foreground">Status</p><p className="text-secondary">READY FOR UPLINK</p></div>
                      </div>
                    </Card>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" checked={formData.terms} onCheckedChange={(v) => setValue('terms', v as boolean)} />
                      <label htmlFor="terms" className="text-[10px] font-mono text-muted-foreground uppercase cursor-pointer">
                        Accept Sovereign Node Operating Terms
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 h-12 font-headline text-[10px] tracking-widest uppercase">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Revert
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button onClick={handleNext} className="flex-[2] h-12 font-headline text-[10px] tracking-widest uppercase bg-primary text-black hover:bg-primary/80">
                      Synchronize <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit(onSubmit)} 
                      disabled={loading || !formData.terms}
                      className="flex-[2] h-12 font-headline text-[10px] tracking-widest uppercase bg-secondary text-black hover:bg-secondary/80"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-2" /> Deploy Hub Node</>}
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
