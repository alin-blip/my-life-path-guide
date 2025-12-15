import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { Dumbbell, Brain, Heart, Briefcase, Edit, ChevronLeft, ChevronRight, Target, CheckCircle2, Circle, RefreshCw, Key } from 'lucide-react';
import { objectivesService } from '@/services/objectivesService';
import { useObjectivesWeek } from '@/hooks/useObjectivesWeek';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Json } from '@/integrations/supabase/types';

interface WeeklyObjectiveData {
  category: MissionCategory;
  actions: string[];
}

interface DoorKeyPoint {
  id: string;
  title: string;
  completed: boolean;
  isContinued?: boolean;
}

export const WeeklyObjectives: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<WeeklyObjectiveData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyPoints, setKeyPoints] = useState<DoorKeyPoint[]>([]);
  const [dominoTitle, setDominoTitle] = useState<string | null>(null);
  const {
    currentDateRange,
    currentWeekKey,
    handlePreviousWeek,
    handleNextWeek,
    isCurrentWeek
  } = useObjectivesWeek();

  useEffect(() => {
    loadWeeklyObjectives();
    loadDoorKeyPoints();
  }, [currentWeekKey]);

  const loadDoorKeyPoints = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('weekly_planning')
        .select('domino_title, key_points')
        .eq('user_id', session.user.id)
        .eq('week_key', currentWeekKey)
        .maybeSingle();

      if (error) {
        console.error('Error loading door key points:', error);
        return;
      }

      if (data) {
        setDominoTitle(data.domino_title);
        const points = (data.key_points as unknown as DoorKeyPoint[]) || [];
        setKeyPoints(points);
      } else {
        setDominoTitle(null);
        setKeyPoints([]);
      }
    } catch (error) {
      console.error('Error loading door data:', error);
    }
  };

  const loadWeeklyObjectives = async () => {
    setIsLoading(true);
    try {
      const data = await objectivesService.getWeeklyObjectivesForDashboard(currentWeekKey);
      
      const categories: MissionCategory[] = ['body', 'being', 'balance', 'business'];
      const formattedObjectives: WeeklyObjectiveData[] = categories
        .map(category => ({
          category,
          actions: data[category] || []
        }))
        .filter(obj => obj.actions.length > 0);
      
      setObjectives(formattedObjectives);
    } catch (error) {
      console.error('Error loading weekly objectives:', error);
      setObjectives([]);
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

  const completedKeys = keyPoints.filter(kp => kp.completed).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
          {language === 'en' ? 'WEEKLY OBJECTIVES' : 'OBIECTIVE SĂPTĂMÂNALE'}
        </h3>
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
          {language === 'en' ? 'WEEKLY OBJECTIVES' : 'OBIECTIVE SĂPTĂMÂNALE'}
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/game')}
          className="bg-purple-600/20 border-purple-500/50 hover:bg-purple-700/30 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          {language === 'en' ? 'EDIT' : 'EDITEAZĂ'}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousWeek}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-300 font-medium min-w-[140px] text-center">
          {currentDateRange}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextWeek}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Door Key Points Section */}
      {keyPoints.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-400" />
                <h4 className="font-semibold text-amber-300">
                  {language === 'en' ? 'Weekly Keys' : 'Cheile Săptămânii'}
                </h4>
              </div>
              <span className="text-xs text-amber-400/70">
                {completedKeys}/{keyPoints.length}
              </span>
            </div>
            
            {dominoTitle && (
              <p className="text-sm text-amber-200/80 mb-3 italic">
                "{dominoTitle}"
              </p>
            )}
            
            <div className="space-y-2">
              {keyPoints.map((keyPoint, index) => (
                <div 
                  key={keyPoint.id} 
                  className={`flex items-start gap-2 p-2 rounded-md transition-colors ${
                    keyPoint.completed 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-amber-500/5 border border-amber-500/10'
                  }`}
                >
                  {keyPoint.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-amber-400/50 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm ${keyPoint.completed ? 'text-green-300 line-through' : 'text-gray-200'}`}>
                        {keyPoint.title}
                      </span>
                      {keyPoint.isContinued && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/20 border-orange-400/30 text-orange-300"
                        >
                          <RefreshCw className="h-2.5 w-2.5 mr-1" />
                          {language === 'en' ? 'Cont.' : 'Cont.'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/door')}
              className="w-full mt-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            >
              {language === 'en' ? 'Open Door →' : 'Deschide Door →'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Objectives by Category */}
      {objectives.length === 0 && keyPoints.length === 0 ? (
        <Card className="bg-gradient-to-br from-[#1A1F2C] to-[#192231] border border-gray-500/20">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">
              {language === 'en' 
                ? 'No weekly objectives set yet. Start by setting your weekly goals!' 
                : 'Nu există obiective săptămânale setate încă. Începe prin a-ți seta obiectivele săptămânale!'}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/game')}
              className="mt-4 bg-purple-600/20 border-purple-500/50 hover:bg-purple-700/30 text-white"
            >
              <Edit className="h-4 w-4 mr-2" />
              {language === 'en' ? 'SET GOALS' : 'SETEAZĂ OBIECTIVE'}
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">
                        {getCategoryName(objective.category)}:
                      </h4>
                    </div>
                    <div className="space-y-1">
                      {objective.actions.map((action, index) => (
                        <p key={index} className="text-sm text-gray-300 leading-relaxed">
                          - {action}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
