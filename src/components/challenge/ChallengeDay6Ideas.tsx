import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, ArrowRight, Brain, Zap, Clock, Users, Trash2, 
  CheckCircle2, AlertTriangle, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';

export const ChallengeDay6Ideas: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleOpenIdeas = () => {
    navigate('/door?tab=weekly');
  };

  const quadrants = [
    {
      id: 'q1',
      icon: Zap,
      labelRo: 'Q1: REACTOR',
      labelEn: 'Q1: REACTOR',
      descRo: 'Important + Urgent → Fă ACUM',
      descEn: 'Important + Urgent → Do NOW',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'q2',
      icon: Target,
      labelRo: 'Q2: CREATOR ✨',
      labelEn: 'Q2: CREATOR ✨',
      descRo: 'Important + NU Urgent → PLANIFICĂ',
      descEn: 'Important + NOT Urgent → SCHEDULE',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      recommended: true
    },
    {
      id: 'q3',
      icon: Users,
      labelRo: 'Q3: DELEGATOR',
      labelEn: 'Q3: DELEGATOR',
      descRo: 'NU Important + Urgent → DELEGĂ',
      descEn: 'NOT Important + Urgent → DELEGATE',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      id: 'q4',
      icon: Trash2,
      labelRo: 'Q4: ELIMINATOR',
      labelEn: 'Q4: ELIMINATOR',
      descRo: 'NU Important + NU Urgent → ȘTERGE',
      descEn: 'NOT Important + NOT Urgent → DELETE',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <Card className="p-6 border-primary/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-7 w-7 text-white" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <Badge className="mb-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
                {language === 'ro' ? '💡 FILTRU STRATEGIC' : '💡 STRATEGIC FILTER'}
              </Badge>
              <h3 className="text-xl font-bold text-foreground">
                {language === 'ro' 
                  ? 'Idea List - Controlul Impulsului' 
                  : 'Idea List - Impulse Control'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {language === 'ro'
                  ? 'Această secțiune NU este pentru execuție. Este pentru a parca ideile în siguranță ca să nu distrugă momentum-ul construit în Ziua 3.'
                  : 'This section is NOT for execution. It\'s for parking ideas safely so they don\'t destroy the momentum you built on Day 3.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Why It's Important */}
      <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-400" />
          <h4 className="font-bold text-foreground">
            {language === 'ro' ? 'De Ce Este Important' : 'Why It\'s Important'}
          </h4>
        </div>
        
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            {language === 'ro'
              ? '🧠 Creierul tău generează constant idei noi. Fără un sistem de "parcare", aceste idei vor distruge momentum-ul pe care l-ai construit.'
              : '🧠 Your brain constantly generates new ideas. Without a "parking" system, these ideas will destroy the momentum you\'ve been building.'}
          </p>
          <p>
            {language === 'ro'
              ? '⚠️ Cele mai periculoase distrageri sunt ideile BUNE. Ele par urgente, dar de fapt te abat de la planul tău.'
              : '⚠️ The most dangerous distractions are GOOD ideas. They seem urgent, but actually divert you from your plan.'}
          </p>
          <p>
            {language === 'ro'
              ? '✅ Soluția: Scrie ideile în Idea List și clasifică-le cu Matricea Eisenhower.'
              : '✅ The solution: Write ideas in Idea List and classify them with the Eisenhower Matrix.'}
          </p>
        </div>
      </Card>

      {/* Eisenhower Matrix */}
      <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          {language === 'ro' ? 'Matricea Eisenhower - 4 Cadrane' : 'Eisenhower Matrix - 4 Quadrants'}
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          {quadrants.map((q) => {
            const Icon = q.icon;
            return (
              <div 
                key={q.id}
                className={`p-3 rounded-lg border ${q.bgColor} ${q.borderColor} ${q.recommended ? 'ring-2 ring-green-500/50' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${q.color}`} />
                  <span className={`text-sm font-bold ${q.color}`}>
                    {language === 'ro' ? q.labelRo : q.labelEn}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ro' ? q.descRo : q.descEn}
                </p>
                {q.recommended && (
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    {language === 'ro' ? '⭐ Cel mai bun cadran' : '⭐ Best quadrant'}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Key Message */}
      <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
        <div className="text-center space-y-4">
          <div className="text-4xl">💡</div>
          <blockquote className="text-lg font-medium text-foreground italic">
            {language === 'ro' 
              ? '"Ideile nu construiesc libertatea. Execuția în timp construiește."'
              : '"Ideas don\'t build freedom. Execution over time does."'}
          </blockquote>
          <p className="text-sm text-muted-foreground">
            {language === 'ro'
              ? 'Planifică în Q2 Creator, nu reacționa în Q1 Reactor.'
              : 'Plan in Q2 Creator, don\'t react in Q1 Reactor.'}
          </p>
        </div>
      </Card>

      {/* CTA */}
      <Button
        onClick={handleOpenIdeas}
        size="lg"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 py-6"
      >
        <Lightbulb className="h-5 w-5 mr-2" />
        {language === 'ro' ? 'Deschide Idea List' : 'Open Idea List'}
        <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
};

export default ChallengeDay6Ideas;
