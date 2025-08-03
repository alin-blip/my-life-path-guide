
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { Dumbbell, Brain, Heart, Briefcase, Edit } from 'lucide-react';

interface MonthlyObjective {
  category: MissionCategory;
  measurableResult: string;
  endGoalValue: string;
}

export const MonthlyObjectives: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<MonthlyObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthlyObjectives();
  }, []);

  const loadMonthlyObjectives = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('game_journey_maps')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading monthly objectives:', error);
        return;
      }

      if (data) {
        const parsedObjectives: MonthlyObjective[] = [];
        
        data.forEach((item) => {
          if (item.monthly_goal) {
            try {
              const monthlyData = JSON.parse(item.monthly_goal);
              
              // Find the "Result" section and extract measurable result
              let measurableResult = '';
              let endGoalValue = '';
              
              // Look for the result questions in the answers
              Object.entries(monthlyData).forEach(([key, value]) => {
                if (typeof value === 'string') {
                  // If the answer contains result-like content
                  if (value.toLowerCase().includes('rezultat') || 
                      value.toLowerCase().includes('result') ||
                      value.toLowerCase().includes('măsurabil') ||
                      value.toLowerCase().includes('measurable')) {
                    measurableResult = value;
                  }
                  // If it's a simple objective, use it as the result
                  if (!measurableResult && value.trim().length > 0) {
                    measurableResult = value;
                  }
                }
              });

              if (measurableResult) {
                parsedObjectives.push({
                  category: item.category as MissionCategory,
                  measurableResult,
                  endGoalValue
                });
              }
            } catch (parseError) {
              // If it's a simple string, use it directly
              if (typeof item.monthly_goal === 'string' && item.monthly_goal.trim()) {
                parsedObjectives.push({
                  category: item.category as MissionCategory,
                  measurableResult: item.monthly_goal,
                  endGoalValue: ''
                });
              }
            }
          }
        });

        setObjectives(parsedObjectives);
      }
    } catch (error) {
      console.error('Error loading monthly objectives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: MissionCategory) => {
    switch(category) {
      case 'body': return <Dumbbell className="h-5 w-5 text-red-400" />;
      case 'being': return <Brain className="h-5 w-5 text-blue-400" />;
      case 'balance': return <Heart className="h-5 w-5 text-green-400" />;
      case 'business': return <Briefcase className="h-5 w-5 text-purple-400" />;
      default: return null;
    }
  };

  const getCategoryColor = (category: MissionCategory) => {
    switch(category) {
      case 'body': return 'border-red-500/30 bg-red-500/10';
      case 'being': return 'border-blue-500/30 bg-blue-500/10';
      case 'balance': return 'border-green-500/30 bg-green-500/10';
      case 'business': return 'border-purple-500/30 bg-purple-500/10';
      default: return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const getCategoryName = (category: MissionCategory) => {
    if (language === 'en') {
      switch(category) {
        case 'body': return 'Body';
        case 'being': return 'Spirituality';
        case 'balance': return 'Relationships';
        case 'business': return 'Business';
        default: return category;
      }
    } else {
      switch(category) {
        case 'body': return 'Corp';
        case 'being': return 'Spiritualitate';
        case 'balance': return 'Relații';
        case 'business': return 'Afaceri';
        default: return category;
      }
    }
  };

  const handleEditObjective = (category: MissionCategory) => {
    navigate('/game');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          {language === 'en' ? 'MONTHLY OBJECTIVES' : 'OBIECTIVE LUNARE'}
        </h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
            {language === 'en' ? 'MONTHLY OBJECTIVES' : 'OBIECTIVE LUNARE'}
          </h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/game')}
            className="bg-blue-600/20 border-blue-500/50 hover:bg-blue-700/30 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            {language === 'en' ? 'SET GOALS' : 'SETEAZĂ OBIECTIVE'}
          </Button>
        </div>
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#192231] border border-gray-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">
              {language === 'en' 
                ? 'No monthly objectives set yet. Start by setting your goals!' 
                : 'Nu există obiective lunare setate încă. Începe prin a-ți seta obiectivele!'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
          {language === 'en' ? 'MONTHLY OBJECTIVES' : 'OBIECTIVE LUNARE'}
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/game')}
          className="bg-blue-600/20 border-blue-500/50 hover:bg-blue-700/30 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          {language === 'en' ? 'EDIT' : 'EDITEAZĂ'}
        </Button>
      </div>
      
      <div className="space-y-3">
        {objectives.map((objective) => (
          <Card 
            key={objective.category} 
            className={`border rounded-md transition-all duration-200 hover:shadow-lg ${getCategoryColor(objective.category)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getCategoryIcon(objective.category)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">
                      {getCategoryName(objective.category)}:
                    </h4>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    - {objective.measurableResult}
                    {objective.endGoalValue && (
                      <span className="ml-2 text-blue-400">({objective.endGoalValue})</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
