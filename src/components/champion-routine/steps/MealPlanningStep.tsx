import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UtensilsCrossed, Plus, ArrowRight, Flame, Beef, Trash2, Search, X } from 'lucide-react';
import { foods, foodCategories, searchFoods, FoodItem } from '@/services/fitness/data/foodDatabase';

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein: number;
}

interface MealPlanningStepProps {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  onChange: (meals: Meal[], calories: number, protein: number) => void;
  onNext: () => void;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Mic Dejun', emoji: '🍳' },
  { value: 'lunch', label: 'Prânz', emoji: '🥗' },
  { value: 'dinner', label: 'Cină', emoji: '🍽️' },
  { value: 'snack', label: 'Gustare', emoji: '🍎' },
] as const;

export function MealPlanningStep({ 
  meals: initialMeals, 
  totalCalories: initialCalories, 
  totalProtein: initialProtein,
  onChange, 
  onNext 
}: MealPlanningStepProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals || []);
  const [selectedType, setSelectedType] = useState<Meal['type']>('breakfast');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const totalCaloriesComputed = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinComputed = meals.reduce((acc, m) => acc + m.protein, 0);

  useEffect(() => {
    onChange(meals, totalCaloriesComputed, totalProteinComputed);
  }, [meals]);

  const handleAddMeal = () => {
    if (!description.trim()) return;

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: selectedType,
      description: description.trim(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
    };

    setMeals([...meals, newMeal]);
    setDescription('');
    setCalories('');
    setProtein('');
    setShowForm(false);
  };

  const handleSelectFood = (food: FoodItem) => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      type: selectedType,
      description: `${food.name}${food.servingSize ? ` (${food.servingSize})` : ''}`,
      calories: food.calories,
      protein: food.protein,
    };

    setMeals([...meals, newMeal]);
    setShowFoodPicker(false);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleRemoveMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const getMealTypeInfo = (type: Meal['type']) => {
    return MEAL_TYPES.find(t => t.value === type) || MEAL_TYPES[0];
  };

  const filteredFoods = searchFoods(searchQuery, selectedCategory);

  // Targets (can be made configurable later)
  const calorieTarget = 2000;
  const proteinTarget = 150;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-green-500/20">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
            <UtensilsCrossed className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Meal Planning</h1>
          <p className="text-muted-foreground text-lg">
            Ce mănânci astăzi? Selectează din baza de date sau adaugă manual.
          </p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Calorii</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{totalCaloriesComputed}</span>
              <span className="text-muted-foreground">/ {calorieTarget}</span>
            </div>
            <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${Math.min((totalCaloriesComputed / calorieTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Beef className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Proteine</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{totalProteinComputed}g</span>
              <span className="text-muted-foreground">/ {proteinTarget}g</span>
            </div>
            <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all"
                style={{ width: `${Math.min((totalProteinComputed / proteinTarget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meals list */}
        {meals.length > 0 && (
          <div className="space-y-2">
            {meals.map((meal) => {
              const typeInfo = getMealTypeInfo(meal.type);
              return (
                <div 
                  key={meal.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo.emoji}</span>
                    <div>
                      <p className="font-medium">{meal.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeInfo.label} • {meal.calories} kcal • {meal.protein}g proteine
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveMeal(meal.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Meal Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.value)}
              className="flex-col h-auto py-2"
            >
              <span className="text-lg">{type.emoji}</span>
              <span className="text-xs">{type.label}</span>
            </Button>
          ))}
        </div>

        {/* Add options */}
        <div className="grid grid-cols-2 gap-2">
          <Dialog open={showFoodPicker} onOpenChange={setShowFoodPicker}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/10">
                <Search className="h-4 w-4" />
                Selectează din Baza de Date
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Selectează Aliment - {getMealTypeInfo(selectedType).label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Caută aliment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Category filter */}
                <div className="flex flex-wrap gap-2">
                  {foodCategories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={selectedCategory === cat.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>

                {/* Food list */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {filteredFoods.map((food, index) => (
                      <button
                        key={`${food.name}-${index}`}
                        onClick={() => handleSelectFood(food)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {food.servingSize && `${food.servingSize} • `}
                            {food.calories} kcal • {food.protein}g proteine
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <span className="text-orange-500">{food.calories}</span>
                          <span className="text-muted-foreground"> kcal</span>
                        </div>
                      </button>
                    ))}
                    {filteredFoods.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Niciun aliment găsit
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => setShowForm(!showForm)}
            className="gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Adaugă Manual
          </Button>
        </div>

        {/* Manual add form */}
        {showForm && (
          <div className="space-y-4 p-4 rounded-lg border bg-background/50">
            <Textarea
              placeholder="Ce mănânci? (ex: Omletă cu legume și pâine integrală)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Calorii (kcal)</label>
                <Input
                  type="number"
                  placeholder="350"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Proteine (g)</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Anulează
              </Button>
              <Button onClick={handleAddMeal} className="flex-1" disabled={!description.trim()}>
                Adaugă Masă
              </Button>
            </div>
          </div>
        )}

        {/* Continue button */}
        <Button 
          onClick={onNext} 
          size="lg" 
          className="w-full gap-2"
        >
          Continuă
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Card>
    </div>
  );
}
