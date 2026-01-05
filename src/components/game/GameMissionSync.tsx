
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MonthlyMission, MissionCategory } from '@/types/mission';

export const GameMissionSync: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<MonthlyMission[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load missions from localStorage
    try {
      setLoading(true);
      const storedMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
      
      // Get only active missions (not completed and not expired)
      const now = new Date();
      const activeMissions = storedMissions.filter((mission: MonthlyMission) => {
        const endDate = new Date(mission.endDate);
        return endDate >= now && !mission.isImpossibleGame;
      });
      
      setMissions(activeMissions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading missions:', error);
      setLoading(false);
    }
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const calculateProgress = (mission: MonthlyMission): number => {
    // Simplified progress calculation - could be enhanced with real tracking
    if (!mission.parts || mission.parts.length === 0) return 0;
    
    // Count parts that have content as "completed"
    const completedParts = mission.parts.filter(part => 
      part && part.content && part.content.trim().length > 0
    ).length;
    
    return Math.round((completedParts / mission.parts.length) * 100);
  };
  
  const getCategoryColor = (category?: MissionCategory): string => {
    switch(category) {
      case 'body': return 'bg-red-900 text-red-200';
      case 'being': return 'bg-blue-900 text-blue-200';
      case 'balance': return 'bg-green-900 text-green-200';
      case 'business': return 'bg-purple-900 text-purple-200';
      default: return 'bg-gray-700 text-gray-200';
    }
  };
  
  const getCategoryLabel = (category?: MissionCategory): string => {
    if (!category) return '';
    
    if (language === 'en') {
      return String(category).charAt(0).toUpperCase() + String(category).slice(1);
    } else {
      switch(category) {
        case 'body': return 'Corp';
        case 'being': return 'Spiritualitate';
        case 'balance': return 'Relații';
        case 'business': return 'Afaceri';
        default: return String(category).charAt(0).toUpperCase() + String(category).slice(1);
      }
    }
  };
  
  const handleMissionClick = (mission: MonthlyMission) => {
    navigate(`/fact-maps?category=monthly&highlight=${mission.id}`);
  };
  
  const createNewMission = () => {
    navigate('/monthly-mission');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warrior-accent"></div>
      </div>
    );
  }
  
  if (missions.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-warrior-muted/20 rounded-lg">
        <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">
          {language === 'en' ? 'No active missions' : 'Nicio misiune activă'}
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {language === 'en' 
            ? 'Create your first monthly mission to start tracking your progress toward your goals.'
            : 'Creează prima ta misiune lunară pentru a începe să îți urmărești progresul către obiectivele tale.'}
        </p>
        <Button 
          onClick={createNewMission}
          className="bg-warrior-accent hover:bg-warrior-accent/80"
        >
          {language === 'en' ? 'Create New Mission' : 'Creează Misiune Nouă'}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {missions.map((mission) => {
        const progress = calculateProgress(mission);
        
        return (
          <Card 
            key={mission.id}
            className="bg-warrior-muted/10 border-warrior-muted/30 hover:bg-warrior-muted/20 transition-all cursor-pointer"
            onClick={() => handleMissionClick(mission)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <Badge className={`${getCategoryColor(mission.category)} mt-1`}>
                    {getCategoryLabel(mission.category)}
                  </Badge>
                  <div>
                    <h3 className="text-lg font-medium text-white">{mission.name}</h3>
                    <p className="text-sm text-gray-400">
                      {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mt-2 md:mt-0">
                  {progress === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <span className="text-sm font-medium text-gray-300 mr-2">{progress}%</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              <Progress 
                value={progress} 
                className="h-2 bg-warrior-muted/30" 
                indicatorClassName={progress === 100 ? 'bg-green-500' : 'bg-warrior-accent'}
              />
              
              {mission.parts && mission.parts[0]?.content && (
                <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                  {mission.parts[0].content}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
      
      <div className="text-center mt-4">
        <Button 
          variant="outline" 
          onClick={createNewMission}
          className="border-dashed border-gray-600 text-gray-400 hover:bg-warrior-muted/20"
        >
          {language === 'en' ? '+ Add Another Mission' : '+ Adaugă Altă Misiune'}
        </Button>
      </div>
    </div>
  );
};
