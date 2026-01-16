import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Users } from 'lucide-react';
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
  phone: z.string()
    .min(10, 'Număr de telefon invalid')
    .max(20, 'Numărul de telefon nu poate depăși 20 caractere')
    .regex(/^[+]?[0-9\s\-()]+$/, 'Număr de telefon invalid'),
  gender: z.enum(['male', 'female'], { required_error: 'Selectează genul' })
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

interface WarriorPowerLeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  isLoading?: boolean;
}

export function WarriorPowerLeadForm({ onSubmit, isLoading }: WarriorPowerLeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '' as 'male' | 'female' | ''
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
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl">
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1.5 sm:mb-2">
            Completează cu atenție detaliile
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Vei primi rezultatele pe email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Name Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4" />
              Nume Warrior Power *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.slice(0, 100) }))}
              placeholder="Numele tău complet"
              maxLength={100}
              className={`h-11 sm:h-12 text-base ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-xs sm:text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm sm:text-base">
              <Mail className="h-4 w-4" />
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
              <p className="text-xs sm:text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm sm:text-base">
              <Phone className="h-4 w-4" />
              Telefon *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9+\-\s()]/g, '').slice(0, 20) }))}
              placeholder="+40 7XX XXX XXX"
              maxLength={20}
              className={`h-11 sm:h-12 text-base ${errors.phone ? 'border-destructive' : ''}`}
            />
            {errors.phone && (
              <p className="text-xs sm:text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Gender Field */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4" />
              Gender *
            </Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value: 'male' | 'female') => 
                setFormData(prev => ({ ...prev, gender: value }))
              }
              className="flex gap-4 sm:gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                <Label htmlFor="female" className="cursor-pointer text-sm sm:text-base py-2">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                <Label htmlFor="male" className="cursor-pointer text-sm sm:text-base py-2">Male</Label>
              </div>
            </RadioGroup>
            {errors.gender && (
              <p className="text-xs sm:text-sm text-destructive">{errors.gender}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-h-[48px]"
          >
            {isLoading ? 'Se procesează...' : 'Începe Evaluarea →'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
