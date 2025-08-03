import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send, ChevronsRight, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { MonthlyMission } from '@/types/mission';
import { Textarea } from '@/components/ui/textarea';
import { annualBodyQuestions } from '@/components/mission/questions/annualBodyQuestions';
import { annualBeingQuestions } from '@/components/mission/questions/annualBeingQuestions';
import { annualBalanceQuestions } from '@/components/mission/questions/annualBalanceQuestions';
import { annualBusinessQuestions } from '@/components/mission/questions/annualBusinessQuestions';
import { MissionCategory } from '@/types/mission';
import { getQuestionStruct } from './utils/getQuestions';
import { MissionModal } from './modals/MissionModal';
import { MissionDateEditor } from './MissionDateEditor';
import { MissionSummary } from './MissionSummary';

interface ThreeStepSystemProps {
  category: 'body' | 'being' | 'balance' | 'business';
}

// Simple questions for annual goals - no longer importing from unlock-stack
function getAnnualGoalQuestions(language: string) {
  const questions = language === 'ro' ? [
    "Care sunt faptele despre corpul meu?",
    "Care sunt faptele despre ființa mea?", 
    "Care sunt faptele despre echilibrul meu?",
    "Care sunt faptele despre afacerea mea?"
  ] : [
    "What are the facts about my body?",
    "What are the facts about my being?",
    "What are the facts about my balance?", 
    "What are the facts about my business?"
  ];
  
  return questions;
}

function getQuestionStructOld(category: string) {
  switch (category) {
    case 'body': return annualBodyQuestions;
    case 'being': return annualBeingQuestions;
    case 'balance': return annualBalanceQuestions;
    case 'business': return annualBusinessQuestions;
    default: return annualBodyQuestions;
  }
}

function getAnnualGoalAnswersKey(category: string, language: string): string {
  return `annualGoalAnswers__${category}__${language}`;
}
function loadAnnualGoalAnswers(category: string, language: string) {
  try {
    return JSON.parse(localStorage.getItem(getAnnualGoalAnswersKey(category, language)) || '{}');
  } catch {
    return {};
  }
}
function saveAnnualGoalAnswers(category: string, language: string, answers: Record<number, string>) {
  localStorage.setItem(getAnnualGoalAnswersKey(category, language), JSON.stringify(answers));
}

function getMonthlyMissionAnswersKey(category: string, language: string): string {
  return `monthlyMissionAnswers__${category}__${language}`;
}
function loadMonthlyMissionAnswers(category: string, language: string) {
  try {
    return JSON.parse(localStorage.getItem(getMonthlyMissionAnswersKey(category, language)) || '{}');
  } catch {
    return {};
  }
}
function saveMonthlyMissionAnswers(category: string, language: string, answers: Record<number, string>) {
  localStorage.setItem(getMonthlyMissionAnswersKey(category, language), JSON.stringify(answers));
}

function getMissionQuestionsList(category: string) {
  const struct = getQuestionStruct(category as MissionCategory, false);
  return [
    ...(struct.round1 || []),
    ...(struct.round2 || []),
    ...(struct.round3 || []),
    ...(struct.revelation || []),
    ...(struct.lessons || []),
    ...(struct.missionParts || []),
    ...(struct.result || []),
  ].map(q => q.label);
}

export const ThreeStepSystem: React.FC<ThreeStepSystemProps> = ({ category }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [missions, setMissions] = useState<MonthlyMission[]>([]);
  const [currentReality, setCurrentReality] = useState<string | null>(null);
  const [monthlyMission, setMonthlyMission] = useState<MonthlyMission | null>(null);
  const [annualGoal, setAnnualGoal] = useState<MonthlyMission | null>(null);

  const [showAnnualGoalFlow, setShowAnnualGoalFlow] = useState(false);
  const annualGoalQuestions = getAnnualGoalQuestions(language);
  const [annualGoalAnswers, setAnnualGoalAnswers] = useState<Record<number, string>>(() => loadAnnualGoalAnswers(category, language));
  const [annualGoalComplete, setAnnualGoalComplete] = useState(false);

  const [editMonthlyDates, setEditMonthlyDates] = useState(false);
  const [monthlyStartDate, setMonthlyStartDate] = useState<string | null>(null);
  const [monthlyEndDate, setMonthlyEndDate] = useState<string | null>(null);
  const [monthlyMissionUpdatedAt, setMonthlyMissionUpdatedAt] = useState<string | null>(null);

  const [showMonthlyMissionFlow, setShowMonthlyMissionFlow] = useState(false);
  const monthlyMissionQuestionsStruct = getQuestionStruct(category);
  const monthlyMissionQuestions = [
    ...(monthlyMissionQuestionsStruct.round1 || []),
    ...(monthlyMissionQuestionsStruct.round2 || []),
    ...(monthlyMissionQuestionsStruct.round3 || []),
    ...(monthlyMissionQuestionsStruct.revelation || []),
    ...(monthlyMissionQuestionsStruct.lessons || []),
    ...(monthlyMissionQuestionsStruct.missionParts || []),
    ...(monthlyMissionQuestionsStruct.result || []),
  ].map(q => q.label);
  const [monthlyMissionAnswers, setMonthlyMissionAnswers] = useState<Record<number, string>>(() => loadMonthlyMissionAnswers(category, language));
  const [monthlyMissionComplete, setMonthlyMissionComplete] = useState(false);

  const categoryLabels: Record<string, Record<string, string>> = {
    'en': {
      'body': 'Body',
      'being': 'Being',
      'balance': 'Balance',
      'business': 'Business'
    },
    'ro': {
      'body': 'Corp',
      'being': 'Ființă',
      'balance': 'Echilibru',
      'business': 'Afacere'
    }
  };

  useEffect(() => {
    try {
      const storedMissions = JSON.parse(localStorage.getItem('monthlyMissions') || '[]');
      setMissions(storedMissions);
      const currentMonthlyMission = storedMissions.find(
        (m: MonthlyMission) => m.category === category && !m.isImpossibleGame
      );
      const currentAnnualGoal = storedMissions.find(
        (m: MonthlyMission) => m.category === category && m.isImpossibleGame === true
      );
      setMonthlyMission(currentMonthlyMission || null);
      setAnnualGoal(currentAnnualGoal || null);

      if (currentMonthlyMission) {
        setMonthlyStartDate(currentMonthlyMission.startDate || null);
        setMonthlyEndDate(currentMonthlyMission.endDate || null);
        setMonthlyMissionUpdatedAt(currentMonthlyMission.createdAt || null);
      } else {
        setMonthlyStartDate(null);
        setMonthlyEndDate(null);
        setMonthlyMissionUpdatedAt(null);
      }

      const factMaps = JSON.parse(localStorage.getItem('factMaps') || '[]');
      const foundationMap = factMaps.find((map: any) => map.category === 'foundation');
      if (foundationMap) {
        const categoryItem = foundationMap.items.find((item: any) => 
          item.name.toLowerCase() === category.toLowerCase() || 
          item.name === categoryLabels['en'][category] || 
          item.name === categoryLabels['ro'][category]
        );
        if (categoryItem && categoryItem.answers) {
          const answerKeys = Object.keys(categoryItem.answers);
          if (answerKeys.length > 0) {
            for (let key of answerKeys) {
              const answer = categoryItem.answers[key];
              if (answer && answer.trim()) {
                setCurrentReality(answer.slice(0, 200) + (answer.length > 200 ? '...' : ''));
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [category]);

  const handleMonthlyDatesSave = () => {
    if (!monthlyMission) return;
    const updatedMission = {
      ...monthlyMission,
      startDate: monthlyStartDate || "",
      endDate: monthlyEndDate || "",
      createdAt: monthlyMission.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const allMissions = [...missions];
    const idx = allMissions.findIndex((m: MonthlyMission) => m.id === monthlyMission.id);
    if (idx !== -1) {
      allMissions[idx] = updatedMission;
      localStorage.setItem('monthlyMissions', JSON.stringify(allMissions));
      setMissions(allMissions);
      setMonthlyMission(updatedMission);
      setEditMonthlyDates(false);
      setMonthlyMissionUpdatedAt(updatedMission.updatedAt);
    }
  };

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  const handleAnnualGoalEditAll = () => setShowAnnualGoalFlow(true);
  
  const handleAnnualGoalFormChange = (idx: number, value: string) => {
    setAnnualGoalAnswers(prev => {
      const updated = { ...prev, [idx]: value };
      saveAnnualGoalAnswers(category, language, updated);
      return updated;
    });
  };
  const handleAnnualGoalFormSave = () => {
    setAnnualGoalComplete(true);
    setShowAnnualGoalFlow(false);
  };

  const getAnnualGoalSummary = () => {
    if (!annualGoalAnswers || Object.keys(annualGoalAnswers).length === 0) return null;
    let summary = [];
    for (let i = 0; i < Math.min(3, annualGoalQuestions.length); i++) {
      if (annualGoalAnswers[i] && annualGoalAnswers[i].trim()) {
        summary.push(`${annualGoalQuestions[i]}: ${annualGoalAnswers[i]}`);
      }
    }
    return summary.join(' | ');
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'body': return 'from-red-900/60 to-red-700/40';
      case 'being': return 'from-blue-900/60 to-blue-700/40';
      case 'balance': return 'from-green-900/60 to-green-700/40';
      case 'business': return 'from-purple-900/60 to-purple-700/40';
      default: return 'from-gray-900/60 to-gray-700/40';
    }
  };
  const getCategoryText = () => {
    return language === 'en' 
      ? categoryLabels['en'][category]
      : categoryLabels['ro'][category];
  };

  const shouldShowMonthlyQuestions = Boolean(monthlyMission && monthlyMission.startDate && monthlyMission.endDate);

  const handleMonthlyMissionEditAll = () => setShowMonthlyMissionFlow(true);
  const handleMonthlyMissionFormChange = (idx: number, value: string) => {
    setMonthlyMissionAnswers(prev => {
      const updated = { ...prev, [idx]: value };
      saveMonthlyMissionAnswers(category, language, updated);
      return updated;
    });
  };
  const handleMonthlyMissionFormSave = () => {
    setMonthlyMissionComplete(true);
    setShowMonthlyMissionFlow(false);
  };

  const getMonthlyMissionSummary = () => {
    if (!monthlyMissionAnswers || Object.keys(monthlyMissionAnswers).length === 0) return null;
    let summary = [];
    for (let i = 0; i < Math.min(3, monthlyMissionQuestions.length); i++) {
      if (monthlyMissionAnswers[i] && monthlyMissionAnswers[i].trim()) {
        summary.push(`${monthlyMissionQuestions[i]}: ${monthlyMissionAnswers[i]}`);
      }
    }
    return summary.join(' | ');
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 bg-gradient-to-r ${getCategoryColor()} rounded-lg`}>
        <h2 className="text-2xl font-bold text-white">{getCategoryText()}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors cursor-pointer"
          onClick={() => navigate(`/fact-maps?fromMission=true&category=foundation`)}
        >
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              <span>{language === 'en' ? 'Where We Are Today' : 'Unde Suntem Astăzi'}</span>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">1</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                {currentReality || (language === 'en' 
                  ? 'No current reality defined. Click to complete your assessment.'
                  : 'Realitatea actuală nu este definită. Click pentru a completa evaluarea.'
                )}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-gray-700 text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/fact-maps?fromMission=true&category=foundation`);
                }}
              >
                {language === 'en' ? 'View Details' : 'Vezi Detalii'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors cursor-pointer"
          onClick={() => {
            if (shouldShowMonthlyQuestions) {
              handleMonthlyMissionEditAll();
            } else {
              navigate(`/fact-maps?fromMission=true&category=monthly`);
            }
          }}
        >
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              <span>{language === 'en' ? 'Monthly Mission' : 'Misiunea Lunară'}</span>
              <span className="text-xs bg-blue-700 px-2 py-1 rounded-full">2</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyMission ? (
                <>
                  {editMonthlyDates ? (
                    <MissionDateEditor
                      startDate={monthlyStartDate}
                      endDate={monthlyEndDate}
                      onStartDateChange={setMonthlyStartDate}
                      onEndDateChange={setMonthlyEndDate}
                      onSave={handleMonthlyDatesSave}
                      onCancel={() => setEditMonthlyDates(false)}
                    />
                  ) : (
                    <MissionSummary
                      mission={monthlyMission}
                      summary={getMonthlyMissionSummary()}
                      formattedStartDate={formatShortDate(monthlyMission.startDate)}
                      formattedEndDate={formatShortDate(monthlyMission.endDate)}
                      onEditDates={() => setEditMonthlyDates(true)}
                      onViewDetails={handleMonthlyMissionEditAll}
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-300">
                  {language === 'en' 
                    ? 'No monthly mission set. Create your mission to reach your annual goal.'
                    : 'Nu există o misiune lunară. Creează misiunea pentru a atinge obiectivul anual.'
                  }
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full ${monthlyMission ? 'border-blue-700 text-blue-300' : 'border-gray-700 text-gray-300'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  monthlyMission 
                    ? handleMonthlyMissionEditAll()
                    : navigate('/monthly-mission');
                }}
              >
                {monthlyMission
                  ? (language === 'en' ? 'View/Edit Mission' : 'Vezi/Editează Misiunea')
                  : (language === 'en' ? 'Create Mission' : 'Creează Misiune')
                }
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/80 transition-colors cursor-pointer"
              onClick={() => handleAnnualGoalEditAll()}>
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              <span>{language === 'en' ? 'Annual Goal' : 'Obiectivul Anual'}</span>
              <span className="text-xs bg-yellow-600 px-2 py-1 rounded-full">3</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getAnnualGoalSummary() ? (
                <div>
                  <h3 className="text-yellow-300 font-medium mb-2">{language === 'en' ? 'Your Annual Goal:' : 'Obiectivul Anual:'}</h3>
                  <p className="text-gray-300">
                    {getAnnualGoalSummary()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-300">
                  {language === 'en' 
                    ? 'No annual goal set. Click here to answer the questions and create your Impossible Game.'
                    : 'Nu există un obiectiv anual. Apasă aici pentru a răspunde la întrebări și a crea Jocul Imposibil.'
                  }
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className={`w-full ${getAnnualGoalSummary() ? 'border-yellow-600 text-yellow-300' : 'border-gray-700 text-gray-300'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnnualGoalEditAll();
                }}
              >
                {getAnnualGoalSummary()
                  ? (language === 'en' ? 'Review or Edit Goal' : 'Revizuiește sau editează Obiectivul')
                  : (language === 'en' ? 'Create Goal' : 'Creează Obiectiv')
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showMonthlyMissionFlow && (
        <MissionModal
          title={language === 'en' ? 'Monthly Mission Setup' : 'Setează Misiunea Lunară'}
          questions={monthlyMissionQuestions}
          answers={monthlyMissionAnswers}
          onAnswerChange={handleMonthlyMissionFormChange}
          onSave={handleMonthlyMissionFormSave}
          onClose={() => setShowMonthlyMissionFlow(false)}
        />
      )}

      {showAnnualGoalFlow && (
        <MissionModal
          title={language === 'en' ? 'Annual Goal Setup' : 'Setează Obiectivul Anual'}
          questions={annualGoalQuestions}
          answers={annualGoalAnswers}
          onAnswerChange={handleAnnualGoalFormChange}
          onSave={handleAnnualGoalFormSave}
          onClose={() => setShowAnnualGoalFlow(false)}
          isImpossibleGame={true}
        />
      )}

      <div className="flex justify-center items-center my-8">
        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-white">1</span>
        </div>
        <div className="h-1 w-20 bg-gray-600 relative">
          <ArrowRight className="text-gray-500 absolute -top-3 right-0" />
        </div>
        <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center">
          <span className="text-white">2</span>
        </div>
        <div className="h-1 w-20 bg-gray-600 relative">
          <ArrowRight className="text-gray-500 absolute -top-3 right-0" />
        </div>
        <div className="w-16 h-16 rounded-full bg-yellow-600 flex items-center justify-center">
          <span className="text-white">3</span>
        </div>
      </div>
    </div>
  );
};
