import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Dumbbell, Brain, Heart, Briefcase, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { GoalCategory } from '@/types/goalWizard';

interface CategoryMultiSelectorProps {
  categoryScores: Record<string, number>;
  weakestCategory: string;
  onStartPlanning: (categories: GoalCategory[]) => void;
  language: 'en' | 'ro';
}

const CATEGORIES: { id: GoalCategory; icon: React.ElementType; en: string; ro: string; color: string; gradient: string }[] = [
  { id: 'business', icon: Briefcase, en: 'Business', ro: 'Business', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'body', icon: Dumbbell, en: 'Body', ro: 'Corp', color: '#22c55e', gradient: 'from-green-500 to-emerald-500' },
  { id: 'being', icon: Brain, en: 'Spirituality', ro: 'Spiritualitate', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-500' },
  { id: 'balance', icon: Heart, en: 'Relationships', ro: 'Relații', color: '#ec4899', gradient: 'from-pink-500 to-rose-500' },
];

const CATEGORY_MAP: Record<string, GoalCategory> = {
  'body': 'body',
  'being': 'being', 
  'balance': 'balance',
  'business': 'business'
};

export const CategoryMultiSelector: React.FC<CategoryMultiSelectorProps> = ({
  categoryScores,
  weakestCategory,
  onStartPlanning,
  language,
}) => {
  const mappedWeakestCategory = CATEGORY_MAP[weakestCategory] || 'business';
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);

  const handleStartPlanning = () => {
    onStartPlanning([selectedCategory || mappedWeakestCategory]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full border border-violet-500/30">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-violet-400 text-sm font-medium">
            {language === 'en' ? 'Choose Your Focus' : 'Alege Aria de Focus'}
          </span>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {language === 'en' ? 'Which area needs attention?' : 'Ce arie vrei să îmbunătățești?'}
        </h2>
        
        <p className="text-white/60 max-w-lg mx-auto text-sm">
          {language === 'en'
            ? 'Select one area to create your complete strategy with AI coaching.'
            : 'Selectează o arie pentru a crea strategia completă cu AI coaching.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((category, index) => {
          const isWeakest = category.id === mappedWeakestCategory;
          const isSelected = selectedCategory === category.id;
          const score = categoryScores[category.id] || 0;
          const CategoryIcon = category.icon;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "relative cursor-pointer p-4 transition-all duration-300 bg-white/5 backdrop-blur-sm border-2",
                  isSelected ? "bg-white/10" : "border-white/10 hover:border-white/30"
                )}
                style={{ borderColor: isSelected ? category.color : undefined }}
              >
                {isWeakest && (
                  <Badge className="absolute -top-2 -right-2 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                    {language === 'en' ? 'RECOMMENDED' : 'RECOMANDAT'}
                  </Badge>
                )}

                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                    isSelected ? "bg-white border-white" : "border-white/30"
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-black" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-gradient-to-br", category.gradient)}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">
                      {language === 'en' ? category.en : category.ro}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(score / 4) * 100}%`, backgroundColor: category.color }} />
                      </div>
                      <span className="text-xs text-white/50">{score}/4</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={handleStartPlanning}
        size="lg"
        className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl shadow-lg"
      >
        {selectedCategory 
          ? (language === 'en' ? 'Start AI Planning' : 'Începe Planificarea AI')
          : (language === 'en' 
              ? `Start with ${CATEGORIES.find(c => c.id === mappedWeakestCategory)?.en}`
              : `Începe cu ${CATEGORIES.find(c => c.id === mappedWeakestCategory)?.ro}`)}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};
