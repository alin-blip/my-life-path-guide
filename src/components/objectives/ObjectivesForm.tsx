
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { MissionCategory } from '@/types/mission';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getQuestionStruct } from '../mission/utils/getQuestions';

type ObjectiveType = 'current' | 'monthly' | 'annual';

interface ObjectivesFormProps {
  category: MissionCategory;
  objectiveType: ObjectiveType;
  onBack: () => void;
}

export const ObjectivesForm: React.FC<ObjectivesFormProps> = ({
  category,
  objectiveType,
  onBack
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentRealityQuestions = (): { title: string; questions: string[] }[] => {
    const categoryLabels = {
      en: { body: 'your body', being: 'your spirituality', balance: 'your relationships', business: 'your business' },
      ro: { body: 'corpul tău', being: 'spiritualitatea ta', balance: 'relațiile tale', business: 'afacerea ta' }
    };

    const sectionTitles = {
      en: [
        'Things that are NOT working',
        'Things that ARE working',
        'Changes you want to make'
      ],
      ro: [
        'Lucruri care NU funcționează',
        'Lucruri care funcționează',
        'Schimbări pe care vrei să le faci'
      ]
    };

    const questionTemplates = {
      en: [
        'What are 4 things that are NOT working in {}?',
        'What are 4 things that ARE working well in {}?',
        'What are 4 changes you want to make in {}?'
      ],
      ro: [
        'Care sunt 4 lucruri care NU funcționează în {}?',
        'Care sunt 4 lucruri care funcționează bine în {}?',
        'Care sunt 4 schimbări pe care vrei să le faci în {}?'
      ]
    };

    const categoryLabel = categoryLabels[language][category];

    return sectionTitles[language].map((title, index) => ({
      title,
      questions: [questionTemplates[language][index].replace('{}', categoryLabel)]
    }));
  };

  const getComplexQuestions = (): { title: string; questions: string[] }[] => {
    const isImpossibleGame = objectiveType === 'annual';
    const questionStruct = getQuestionStruct(category, isImpossibleGame);
    
    const sections = [];
    
    if (questionStruct.round1) {
      sections.push({
        title: 'Round 1',
        questions: questionStruct.round1.map(q => q.label)
      });
    }
    
    if (questionStruct.round2) {
      sections.push({
        title: 'Round 2',
        questions: questionStruct.round2.map(q => q.label)
      });
    }
    
    if (questionStruct.round3) {
      sections.push({
        title: 'Round 3',
        questions: questionStruct.round3.map(q => q.label)
      });
    }
    
    if (questionStruct.revelation) {
      sections.push({
        title: 'Revelation',
        questions: questionStruct.revelation.map(q => q.label)
      });
    }
    
    if (questionStruct.lessons) {
      sections.push({
        title: 'Lessons',
        questions: questionStruct.lessons.map(q => q.label)
      });
    }
    
    if (questionStruct.missionParts) {
      sections.push({
        title: 'Mission Parts',
        questions: questionStruct.missionParts.map(q => q.label)
      });
    }
    
    if (questionStruct.result) {
      sections.push({
        title: 'Result',
        questions: questionStruct.result.map(q => q.label)
      });
    }

    return sections;
  };

  const getQuestionSections = (): { title: string; questions: string[] }[] => {
    if (objectiveType === 'current') {
      return getCurrentRealityQuestions();
    } else {
      return getComplexQuestions();
    }
  };

  const getCategoryName = (category: MissionCategory) => {
    const names = {
      en: { body: 'Body', being: 'Spirituality', balance: 'Relationships', business: 'Business' },
      ro: { body: 'Corp', being: 'Spiritualitate', balance: 'Relații', business: 'Business' }
    };
    return names[language][category];
  };

  const getObjectiveTitle = (type: ObjectiveType) => {
    const titles = {
      en: { current: 'Current Reality', monthly: 'Monthly Mission', annual: 'Annual Goals' },
      ro: { current: 'Realitatea Actuală', monthly: 'Misiunea Lunară', annual: 'Obiectivele Anuale' }
    };
    return titles[language][type];
  };

  // Load existing data
  useEffect(() => {
    if (user) {
      loadExistingData();
    }
  }, [category, objectiveType, user]);

  const loadExistingData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_journey_maps')
        .select('*')
        .eq('category', category)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading data:', error);
        return;
      }

      if (data) {
        const field = objectiveType === 'current' ? 'current_reality' : 
                     objectiveType === 'monthly' ? 'monthly_goal' : 'annual_goal';
        
        if (data[field]) {
          try {
            const parsedAnswers = JSON.parse(data[field]);
            setAnswers(parsedAnswers);
          } catch {
            // If it's a string, convert to answer format
            setAnswers({ 0: data[field] });
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'You must be logged in to save.' : 'Trebuie să fii autentificat pentru a salva.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const field = objectiveType === 'current' ? 'current_reality' : 
                   objectiveType === 'monthly' ? 'monthly_goal' : 'annual_goal';
      
      const dataToSave = JSON.stringify(answers);

      const { error } = await supabase
        .from('game_journey_maps')
        .upsert({
          user_id: user.id,
          category,
          [field]: dataToSave,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,category'
        });

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Saved Successfully' : 'Salvat cu Succes',
        description: language === 'en' ? 'Your objectives have been saved.' : 'Obiectivele tale au fost salvate.',
      });

      onBack();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save your objectives.' : 'Nu s-au putut salva obiectivele.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const questionSections = getQuestionSections();
  let questionIndex = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Back' : 'Înapoi'}
          </Button>
          <h1 className="text-2xl font-bold">
            {getCategoryName(category)} - {getObjectiveTitle(objectiveType)}
          </h1>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center">
              {getObjectiveTitle(objectiveType)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {questionSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-600 pb-2">
                  {section.title}
                </h3>
                {section.questions.map((question, questionIndexInSection) => {
                  const currentQuestionIndex = questionIndex++;
                  return (
                    <div key={currentQuestionIndex} className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        {question}
                      </label>
                      <Textarea
                        placeholder={language === 'en' ? 'Your answer...' : 'Răspunsul tău...'}
                        className="min-h-[100px] bg-gray-800/30 border-gray-600 focus:border-gray-500"
                        value={answers[currentQuestionIndex] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: e.target.value }))}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
            
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full mt-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading 
                ? (language === 'en' ? 'Saving...' : 'Se salvează...') 
                : (language === 'en' ? 'Save Objectives' : 'Salvează Obiectivele')
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
