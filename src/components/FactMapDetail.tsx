
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useLanguage } from '@/context/LanguageContext';
import { getFactMapById, saveFactMapGoalAnswers } from '@/services/factMapService';
import { FactMapGoal, FactMapItem } from '@/types/factMaps';

export const FactMapDetail: React.FC = () => {
  const { mapId, goalId } = useParams<{ mapId: string; goalId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [factMap, setFactMap] = useState<FactMapItem | null>(null);
  const [goal, setGoal] = useState<FactMapGoal | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchData = async () => {
      if (!mapId || !goalId) {
        console.error('Missing mapId or goalId in URL parameters');
        toast({
          title: "Error",
          description: "Could not find the requested map or goal.",
          variant: "destructive"
        });
        navigate('/fact-maps');
        return;
      }
      
      try {
        console.log(`Fetching map ${mapId} and goal ${goalId}`);
        const map = await getFactMapById(mapId);
        
        if (!map) {
          console.error('Map not found:', mapId);
          toast({
            title: "Error",
            description: "The requested map could not be found.",
            variant: "destructive"
          });
          navigate('/fact-maps');
          return;
        }
        
        const foundGoal = map.items.find(item => item.id === goalId);
        
        if (!foundGoal) {
          console.error('Goal not found:', goalId);
          toast({
            title: "Error",
            description: "The requested goal could not be found.",
            variant: "destructive"
          });
          navigate('/fact-maps');
          return;
        }
        
        setFactMap(map);
        setGoal(foundGoal);
        
        // Load saved answers if they exist
        const savedAnswers = localStorage.getItem(`factMap-${mapId}-${goalId}-answers`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        } else if (foundGoal.answers) {
          setAnswers(foundGoal.answers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "An error occurred while loading the map data.",
          variant: "destructive"
        });
        navigate('/fact-maps');
      }
    };
    
    fetchData();
  }, [mapId, goalId, navigate]);
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSave = async () => {
    if (!mapId || !goalId || !goal) return;
    
    try {
      await saveFactMapGoalAnswers(mapId, goalId, answers);
      
      toast({
        title: "Success",
        description: "Your answers have been saved successfully."
      });
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving your answers.",
        variant: "destructive"
      });
    }
  };
  
  const getCategoryColor = () => {
    if (!goal) return 'border-gray-500';
    
    const name = goal.name.toLowerCase();
    if (name.includes('body')) return 'border-red-500';
    if (name.includes('being')) return 'border-blue-500';
    if (name.includes('balance')) return 'border-green-500';
    if (name.includes('business')) return 'border-purple-500';
    
    return 'border-gray-500';
  };
  
  const getButtonColor = () => {
    if (!goal) return 'bg-gray-500';
    
    const name = goal.name.toLowerCase();
    if (name.includes('body')) return 'bg-red-500 hover:bg-red-600';
    if (name.includes('being')) return 'bg-blue-500 hover:bg-blue-600';
    if (name.includes('balance')) return 'bg-green-500 hover:bg-green-600';
    if (name.includes('business')) return 'bg-purple-500 hover:bg-purple-600';
    
    return 'bg-gray-500 hover:bg-gray-600';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!factMap || !goal) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl mb-4 text-red-500">
          {language === 'en' ? 'Map or Goal Not Found' : 'Hartă sau Obiectiv Negăsit'}
        </h2>
        <Button onClick={() => navigate('/fact-maps')}>
          {language === 'en' ? 'Go Back to Maps' : 'Înapoi la Hărți'}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242]">
      <Button 
        variant="outline" 
        onClick={() => navigate('/fact-maps')}
        className="mb-6 text-gray-300 border-gray-700"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === 'en' ? 'Back to Maps' : 'Înapoi la Hărți'}
      </Button>
      
      <Card className={`p-6 bg-[#1A2234] border-l-4 ${getCategoryColor()} mb-8`}>
        <h1 className="text-2xl font-bold text-white mb-2">{goal.name}</h1>
        <p className="text-gray-400 mb-4">{goal.description}</p>
        
        <div className="space-y-6 mt-8">
          {/* Questions for Body Core Assessment */}
          {goal.name.toLowerCase() === 'body' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Current Reality Assessment' : 'Evaluarea Realității Actuale'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'How would you describe your current fitness level?' : 'Cum ți-ai descrie nivelul actual de fitness?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "Describe your current fitness level..." : "Descrie nivelul tău actual de fitness..."}
                      value={answers.q1 || ''}
                      onChange={(e) => handleAnswerChange('q1', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'What are your current physical challenges?' : 'Care sunt provocările tale fizice actuale?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "Describe any limitations or challenges..." : "Descrie limitările sau provocările..."}
                      value={answers.q2 || ''}
                      onChange={(e) => handleAnswerChange('q2', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'What physical activities do you currently engage in?' : 'Ce activități fizice practici în prezent?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "List your regular physical activities..." : "Enumeră activitățile fizice regulate..."}
                      value={answers.q3 || ''}
                      onChange={(e) => handleAnswerChange('q3', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'How would you describe your current nutrition habits?' : 'Cum ți-ai descrie obiceiurile alimentare actuale?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "Describe your eating habits..." : "Descrie obiceiurile tale alimentare..."}
                      value={answers.q4 || ''}
                      onChange={(e) => handleAnswerChange('q4', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'How is your sleep quality and routine?' : 'Cum este calitatea și rutina somnului tău?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "Describe your sleep patterns..." : "Descrie tiparele tale de somn..."}
                      value={answers.q5 || ''}
                      onChange={(e) => handleAnswerChange('q5', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {language === 'en' ? 'What is your current energy level throughout the day?' : 'Care este nivelul tău de energie pe parcursul zilei?'}
                    </label>
                    <Textarea
                      className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                      placeholder={language === 'en' ? "Describe your daily energy patterns..." : "Descrie tiparele tale de energie zilnică..."}
                      value={answers.q6 || ''}
                      onChange={(e) => handleAnswerChange('q6', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Retrospective Analysis' : 'Analiză Retrospectivă'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What has been working well for your physical health?' : 'Ce a funcționat bine pentru sănătatea ta fizică?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "List what's working well..." : "Enumeră ce funcționează bine..."}
                    value={answers.working || ''}
                    onChange={(e) => handleAnswerChange('working', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What has not been working for your physical health?' : 'Ce nu a funcționat pentru sănătatea ta fizică?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "List what's not working..." : "Enumeră ce nu funcționează..."}
                    value={answers['not-working'] || ''}
                    onChange={(e) => handleAnswerChange('not-working', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What adjustments could you make to improve your physical health?' : 'Ce ajustări ai putea face pentru a-ți îmbunătăți sănătatea fizică?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe potential adjustments..." : "Descrie ajustările potențiale..."}
                    value={answers.adjustments || ''}
                    onChange={(e) => handleAnswerChange('adjustments', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What missions or objectives would you like to accomplish?' : 'Ce misiuni sau obiective ai dori să realizezi?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "List your physical health objectives..." : "Enumeră obiectivele tale de sănătate fizică..."}
                    value={answers.missions || ''}
                    onChange={(e) => handleAnswerChange('missions', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Questions for Being Core Assessment */}
          {goal.name.toLowerCase() === 'being' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Spiritual Assessment' : 'Evaluare Spirituală'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'How would you describe your current spiritual practice?' : 'Cum ți-ai descrie practica spirituală actuală?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your spiritual practices..." : "Descrie practicile tale spirituale..."}
                    value={answers['being-q1'] || ''}
                    onChange={(e) => handleAnswerChange('being-q1', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'How often do you meditate or connect with your higher purpose?' : 'Cât de des meditezi sau te conectezi cu scopul tău superior?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your meditation habits..." : "Descrie obiceiurile tale de meditație..."}
                    value={answers['being-q2'] || ''}
                    onChange={(e) => handleAnswerChange('being-q2', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What are your current spiritual challenges?' : 'Care sunt provocările tale spirituale actuale?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your spiritual challenges..." : "Descrie provocările tale spirituale..."}
                    value={answers['being-q3'] || ''}
                    onChange={(e) => handleAnswerChange('being-q3', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Retrospective Analysis' : 'Analiză Retrospectivă'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What has been working well for your spiritual health?' : 'Ce a funcționat bine pentru sănătatea ta spirituală?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "List what's working well..." : "Enumeră ce funcționează bine..."}
                    value={answers['being-working'] || ''}
                    onChange={(e) => handleAnswerChange('being-working', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What has not been working for your spiritual health?' : 'Ce nu a funcționat pentru sănătatea ta spirituală?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "List what's not working..." : "Enumeră ce nu funcționează..."}
                    value={answers['being-not-working'] || ''}
                    onChange={(e) => handleAnswerChange('being-not-working', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Questions for Balance Core Assessment */}
          {goal.name.toLowerCase() === 'balance' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Relationship Assessment' : 'Evaluarea Relațiilor'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'How would you describe your current relationships?' : 'Cum ți-ai descrie relațiile actuale?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your current relationships..." : "Descrie relațiile tale actuale..."}
                    value={answers['balance-q1'] || ''}
                    onChange={(e) => handleAnswerChange('balance-q1', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What are your current relationship challenges?' : 'Care sunt provocările tale relaționale actuale?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your relationship challenges..." : "Descrie provocările tale relaționale..."}
                    value={answers['balance-q2'] || ''}
                    onChange={(e) => handleAnswerChange('balance-q2', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Questions for Business Core Assessment */}
          {goal.name.toLowerCase() === 'business' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  {language === 'en' ? 'Business Assessment' : 'Evaluarea Afacerii'}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'How would you describe your current financial situation?' : 'Cum ți-ai descrie situația financiară actuală?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your financial situation..." : "Descrie situația ta financiară..."}
                    value={answers['business-q1'] || ''}
                    onChange={(e) => handleAnswerChange('business-q1', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {language === 'en' ? 'What are your current business or career challenges?' : 'Care sunt provocările tale actuale în afaceri sau carieră?'}
                  </label>
                  <Textarea
                    className="bg-[#1E2638] border-gray-700 text-white min-h-[100px]"
                    placeholder={language === 'en' ? "Describe your business challenges..." : "Descrie provocările tale în afaceri..."}
                    value={answers['business-q2'] || ''}
                    onChange={(e) => handleAnswerChange('business-q2', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
          
          {/* Save button */}
          <Button 
            className={`w-full mt-6 ${getButtonColor()} flex items-center justify-center gap-2`}
            onClick={handleSave}
          >
            <Save className="h-5 w-5" />
            {language === 'en' ? 'Save Answers' : 'Salvează Răspunsurile'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
