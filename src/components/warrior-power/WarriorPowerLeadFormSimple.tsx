import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Users, Sparkles, Shield, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { z } from 'zod';
import { toast } from 'sonner';

const leadFormSchema = z.object({
  name: z.string()
    .min(2, 'Numele trebuie să aibă cel puțin 2 caractere')
    .max(100, 'Numele nu poate depăși 100 caractere')
    .regex(/^[a-zA-ZăâîșțĂÂÎȘȚ\s\-']+$/, 'Numele conține caractere invalide'),
  email: z.string()
    .email('Email invalid')
    .max(254, 'Email-ul nu poate depăși 254 caractere')
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Format email invalid'),
  gender: z.enum(['male', 'female'], { required_error: 'Selectează genul' }),
});

export type SimpleLeadFormData = z.infer<typeof leadFormSchema>;

interface WarriorPowerLeadFormSimpleProps {
  onSubmit: (data: SimpleLeadFormData) => void;
  isLoading?: boolean;
}

export function WarriorPowerLeadFormSimple({ onSubmit, isLoading }: WarriorPowerLeadFormSimpleProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '' as 'male' | 'female' | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = leadFormSchema.parse(formData);
      setErrors({});
      onSubmit(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Corectează erorile din formular');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm sm:max-w-md mx-auto px-4 sm:px-0"
    >
      <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl">
        {/* Hormozi-style Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Gratuit & Instant
            </span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Primește Rezultatele pe Email
          </h2>
          <p className="text-sm text-muted-foreground">
            Introdu datele pentru a primi <strong className="text-foreground">planul tău personalizat</strong> de transformare
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              Nume *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.slice(0, 100) }))}
              placeholder="Prenumele tău"
              maxLength={100}
              className={`h-11 sm:h-12 text-base ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value.slice(0, 254) }))}
              placeholder="email@exemplu.com"
              maxLength={254}
              className={`h-11 sm:h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              Gen *
            </Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value: 'male' | 'female') => 
                setFormData(prev => ({ ...prev, gender: value }))
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                <Label htmlFor="female" className="cursor-pointer text-sm py-2">Femeie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                <Label htmlFor="male" className="cursor-pointer text-sm py-2">Bărbat</Label>
              </div>
            </RadioGroup>
            {errors.gender && (
              <p className="text-xs text-destructive">{errors.gender}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-h-[48px]"
          >
            {isLoading ? 'Se procesează...' : 'Vezi Rezultatele →'}
          </Button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>100% Gratuit</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>~3 minute</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/70">
            Nu trimitem spam. Poți te dezabona oricând.
          </p>
        </form>
      </div>
    </motion.div>
  );
}
