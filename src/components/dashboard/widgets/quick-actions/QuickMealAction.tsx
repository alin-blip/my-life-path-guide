import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Utensils } from 'lucide-react';
import { useChampionRoutine, Meal } from '@/hooks/useChampionRoutine';
import { useToast } from '@/hooks/use-toast';

interface QuickMealActionProps {
  onUpdate?: () => void;
}

export function QuickMealAction({ onUpdate }: QuickMealActionProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });
  const { todayLog, updateMeals } = useChampionRoutine();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!formData.name || !formData.calories) {
      toast({
        title: "Eroare",
        description: "Te rog introdu numele și caloriile.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const existingMeals = (todayLog?.meals_logged as Meal[]) || [];
      
      const newMeal: Meal = {
        id: Date.now().toString(),
        name: formData.name,
        calories: parseInt(formData.calories) || 0,
        protein: parseInt(formData.protein) || 0,
        carbs: parseInt(formData.carbs) || 0,
        fats: parseInt(formData.fats) || 0,
        time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedMeals = [...existingMeals, newMeal];
      const totalCalories = updatedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const totalProtein = updatedMeals.reduce((sum, m) => sum + (m.protein || 0), 0);

      await updateMeals(updatedMeals, totalCalories, totalProtein);

      toast({
        title: "Salvat!",
        description: `${formData.name} a fost adăugat.`
      });

      setFormData({ name: '', calories: '', protein: '', carbs: '', fats: '' });
      setOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva masa.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const quickMeals = [
    { name: 'Mic dejun', calories: 400, protein: 20, carbs: 50, fats: 15 },
    { name: 'Prânz', calories: 600, protein: 40, carbs: 60, fats: 20 },
    { name: 'Cină', calories: 500, protein: 35, carbs: 40, fats: 20 },
    { name: 'Gustare', calories: 200, protein: 10, carbs: 25, fats: 8 },
  ];

  const handleQuickMeal = (meal: typeof quickMeals[0]) => {
    setFormData({
      name: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString()
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Adaugă
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-500" />
            Adaugă Mâncare Rapidă
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick meal buttons */}
          <div className="space-y-2">
            <Label>Selecție rapidă</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickMeals.map(meal => (
                <Button
                  key={meal.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMeal(meal)}
                  className="justify-start h-auto py-2"
                >
                  <div className="text-left">
                    <div className="font-medium text-xs">{meal.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {meal.calories}kcal • {meal.protein}g P
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="meal-name">Nume *</Label>
            <Input
              id="meal-name"
              placeholder="ex: Piept de pui cu orez"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="calories">Calorii *</Label>
              <Input
                id="calories"
                type="number"
                placeholder="ex: 500"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Proteine (g)</Label>
              <Input
                id="protein"
                type="number"
                placeholder="ex: 40"
                value={formData.protein}
                onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbohidrați (g)</Label>
              <Input
                id="carbs"
                type="number"
                placeholder="ex: 60"
                value={formData.carbs}
                onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fats">Grăsimi (g)</Label>
              <Input
                id="fats"
                type="number"
                placeholder="ex: 15"
                value={formData.fats}
                onChange={(e) => setFormData(prev => ({ ...prev, fats: e.target.value }))}
                min="0"
              />
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? 'Se salvează...' : 'Adaugă Masă'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
