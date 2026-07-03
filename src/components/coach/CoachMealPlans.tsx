import React, { useState, useEffect } from 'react';
import { useCoachMealPlans, MealPlan, MealPlanDay, Meal } from '@/hooks/useCoachMealPlans';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CoachApplyDialog } from './CoachApplyDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalFooter } from '@/components/ui/responsive-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, UtensilsCrossed, Send, ChevronLeft, Apple } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES_RO = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică'];

const MEAL_TYPES = [
  { value: 'breakfast', labelEn: 'Breakfast', labelRo: 'Mic dejun' },
  { value: 'snack1', labelEn: 'Morning Snack', labelRo: 'Gustare dimineață' },
  { value: 'lunch', labelEn: 'Lunch', labelRo: 'Prânz' },
  { value: 'snack2', labelEn: 'Afternoon Snack', labelRo: 'Gustare după-amiază' },
  { value: 'dinner', labelEn: 'Dinner', labelRo: 'Cină' },
];

interface Props {
  coachProfileId: string;
  userId: string;
}

export const CoachMealPlans: React.FC<Props> = ({ coachProfileId, userId }) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const {
    plans,
    loading,
    createPlan,
    deletePlan,
    fetchPlanDetails,
    updateDayMeals,
    applyPlanToTribe,
    applyPlanToMember,
  } = useCoachMealPlans(coachProfileId);

  const [applyTarget, setApplyTarget] = useState<MealPlan | null>(null);

  const [tribes, setTribes] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [editingDays, setEditingDays] = useState<MealPlanDay[]>([]);
  const [activeDay, setActiveDay] = useState('0');

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTribeId, setFormTribeId] = useState<string>('none');
  const [formCalories, setFormCalories] = useState('');
  const [formProtein, setFormProtein] = useState('');
  const [formCarbs, setFormCarbs] = useState('');
  const [formFats, setFormFats] = useState('');

  const dayNames = language === 'ro' ? DAY_NAMES_RO : DAY_NAMES_EN;

  useEffect(() => {
    const fetchTribes = async () => {
      const { data } = await supabase
        .from('tribes')
        .select('id, name')
        .eq('coach_id', coachProfileId);
      setTribes(data || []);
    };
    fetchTribes();
  }, [coachProfileId]);

  const handleCreate = async () => {
    if (!formName.trim()) return;
    const plan = await createPlan({
      name: formName,
      description: formDesc || undefined,
      tribe_id: formTribeId === 'none' ? null : formTribeId,
      calorie_target: formCalories ? parseInt(formCalories) : undefined,
      protein_target: formProtein ? parseInt(formProtein) : undefined,
      carbs_target: formCarbs ? parseInt(formCarbs) : undefined,
      fats_target: formFats ? parseInt(formFats) : undefined,
    });
    if (plan) {
      setShowCreate(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormTribeId('none');
    setFormCalories('');
    setFormProtein('');
    setFormCarbs('');
    setFormFats('');
  };

  const openEditor = async (plan: MealPlan) => {
    const details = await fetchPlanDetails(plan.id);
    if (details) {
      setEditingPlan(details);
      setEditingDays(details.days || []);
      setActiveDay('0');
    }
  };

  const addMealToDay = (dayIndex: number) => {
    const updated = [...editingDays];
    const day = updated[dayIndex];
    if (!day) return;
    const newMeal: Meal = { type: 'breakfast', name: '', calories: 0, protein: 0, carbs: 0, fats: 0 };
    day.meals = [...day.meals, newMeal];
    setEditingDays(updated);
  };

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: string | number) => {
    const updated = [...editingDays];
    const day = updated[dayIndex];
    if (!day) return;
    const meals = [...day.meals];
    meals[mealIndex] = { ...meals[mealIndex], [field]: value };
    day.meals = meals;
    setEditingDays(updated);
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    const updated = [...editingDays];
    const day = updated[dayIndex];
    if (!day) return;
    day.meals = day.meals.filter((_, i) => i !== mealIndex);
    setEditingDays(updated);
  };

  const saveDayMeals = async (dayIndex: number) => {
    const day = editingDays[dayIndex];
    if (!day) return;
    await updateDayMeals(day.id, day.meals);
    toast({ title: 'Saved', description: `${dayNames[dayIndex]} meals saved!` });
  };

  const getDayTotals = (dayIndex: number) => {
    const day = editingDays[dayIndex];
    if (!day || !day.meals.length) return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    return day.meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (Number(m.calories) || 0),
        protein: acc.protein + (Number(m.protein) || 0),
        carbs: acc.carbs + (Number(m.carbs) || 0),
        fats: acc.fats + (Number(m.fats) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  if (editingPlan) {
    const activeDayNum = parseInt(activeDay);
    const totals = getDayTotals(activeDayNum);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setEditingPlan(null)}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {language === 'ro' ? 'Înapoi' : 'Back'}
          </Button>
          <h2 className="text-xl font-bold">{editingPlan.name}</h2>
        </div>

        {/* Macro targets */}
        {(editingPlan.calorie_target || editingPlan.protein_target) && (
          <div className="flex gap-4 text-sm">
            {editingPlan.calorie_target && (
              <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full">
                🔥 {editingPlan.calorie_target} kcal
              </span>
            )}
            {editingPlan.protein_target && (
              <span className="bg-red-500/10 text-red-600 px-3 py-1 rounded-full">
                🥩 {editingPlan.protein_target}g P
              </span>
            )}
            {editingPlan.carbs_target && (
              <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full">
                🌾 {editingPlan.carbs_target}g C
              </span>
            )}
            {editingPlan.fats_target && (
              <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full">
                🥑 {editingPlan.fats_target}g F
              </span>
            )}
          </div>
        )}

        <Tabs value={activeDay} onValueChange={setActiveDay}>
          <TabsList className="grid grid-cols-7 w-full">
            {dayNames.map((name, i) => (
              <TabsTrigger key={i} value={String(i)} className="text-xs">
                {name.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {editingDays.map((day, dayIdx) => (
            <TabsContent key={day.id} value={String(dayIdx)} className="space-y-3">
              {/* Day totals */}
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                <span className="font-medium">{language === 'ro' ? 'Total zi:' : 'Day total:'}</span>
                <span>🔥 {totals.calories} kcal</span>
                <span>P: {totals.protein}g</span>
                <span>C: {totals.carbs}g</span>
                <span>F: {totals.fats}g</span>
              </div>

              {day.meals.map((meal, mealIdx) => (
                <Card key={mealIdx} className="border border-border">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={meal.type}
                        onValueChange={(v) => updateMeal(dayIdx, mealIdx, 'type', v)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_TYPES.map((mt) => (
                            <SelectItem key={mt.value} value={mt.value}>
                              {language === 'ro' ? mt.labelRo : mt.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMeal(dayIdx, mealIdx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      placeholder={language === 'ro' ? 'Denumire masă (ex: Omletă cu legume)' : 'Meal name (e.g., Veggie Omelette)'}
                      value={meal.name}
                      onChange={(e) => updateMeal(dayIdx, mealIdx, 'name', e.target.value)}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Kcal</Label>
                        <Input
                          type="number"
                          value={meal.calories || ''}
                          onChange={(e) => updateMeal(dayIdx, mealIdx, 'calories', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Protein (g)</Label>
                        <Input
                          type="number"
                          value={meal.protein || ''}
                          onChange={(e) => updateMeal(dayIdx, mealIdx, 'protein', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Carbs (g)</Label>
                        <Input
                          type="number"
                          value={meal.carbs || ''}
                          onChange={(e) => updateMeal(dayIdx, mealIdx, 'carbs', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Fats (g)</Label>
                        <Input
                          type="number"
                          value={meal.fats || ''}
                          onChange={(e) => updateMeal(dayIdx, mealIdx, 'fats', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => addMealToDay(dayIdx)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ro' ? 'Adaugă masă' : 'Add meal'}
                </Button>
                <Button onClick={() => saveDayMeals(dayIdx)}>
                  {language === 'ro' ? 'Salvează ziua' : 'Save day'}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {language === 'ro' ? 'Planuri de Mese' : 'Meal Plans'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'ro'
              ? 'Creează planuri nutriționale pentru membrii tăi'
              : 'Create nutrition plans for your members'}
          </p>
        </div>
        <ResponsiveModal open={showCreate} onOpenChange={setShowCreate} className="max-w-md">
          
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Plan Nou' : 'New Plan'}
            </Button>
          
          
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>
                {language === 'ro' ? 'Plan de Mese Nou' : 'New Meal Plan'}
              </ResponsiveModalTitle>
            </ResponsiveModalHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === 'ro' ? 'Nume' : 'Name'}</Label>
                <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g., Cutting Plan 2000kcal" />
              </div>
              <div>
                <Label>{language === 'ro' ? 'Descriere' : 'Description'}</Label>
                <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} />
              </div>
              <div>
                <Label>{language === 'ro' ? 'Grup asociat' : 'Associated group'}</Label>
                <Select value={formTribeId} onValueChange={setFormTribeId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{language === 'ro' ? 'Niciunul' : 'None'}</SelectItem>
                    {tribes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kcal target</Label>
                  <Input type="number" value={formCalories} onChange={(e) => setFormCalories(e.target.value)} />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input type="number" value={formProtein} onChange={(e) => setFormProtein(e.target.value)} />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input type="number" value={formCarbs} onChange={(e) => setFormCarbs(e.target.value)} />
                </div>
                <div>
                  <Label>Fats (g)</Label>
                  <Input type="number" value={formFats} onChange={(e) => setFormFats(e.target.value)} />
                </div>
              </div>
            </div>
            <ResponsiveModalFooter>
              <Button onClick={handleCreate} disabled={!formName.trim()}>
                {language === 'ro' ? 'Creează' : 'Create'}
              </Button>
            </ResponsiveModalFooter>
          
        </ResponsiveModal>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <Apple className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {language === 'ro'
                ? 'Niciun plan de mese creat. Creează primul plan nutrițional!'
                : 'No meal plans yet. Create your first nutrition plan!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const tribe = tribes.find((t) => t.id === plan.tribe_id);
            return (
              <Card key={plan.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => openEditor(plan)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    {plan.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plan.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {plan.calorie_target && (
                      <span className="bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">
                        🔥 {plan.calorie_target} kcal
                      </span>
                    )}
                    {plan.protein_target && (
                      <span className="bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                        P: {plan.protein_target}g
                      </span>
                    )}
                  </div>
                  {tribe && (
                    <p className="text-xs text-muted-foreground">
                      👥 {tribe.name}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    {(plan.tribe_id || tribes.length > 0) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setApplyTarget(plan)}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {language === 'ro' ? 'Trimite' : 'Send'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => deletePlan(plan.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      {/* Apply Dialog */}
      <CoachApplyDialog
        open={!!applyTarget}
        onOpenChange={(open) => { if (!open) setApplyTarget(null); }}
        tribes={tribes}
        defaultTribeId={applyTarget?.tribe_id}
        onApplyToTribe={async (tribeId) => { if (applyTarget) await applyPlanToTribe(applyTarget.id, tribeId); }}
        onApplyToMember={async (userId) => { if (applyTarget) await applyPlanToMember(applyTarget.id, userId); }}
      />
    </div>
  );
};
