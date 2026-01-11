import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollText, ArrowRight, Crown, Calendar, Dumbbell, Sparkles, Heart, Briefcase, HandHeart } from 'lucide-react';
import { addYears, format } from 'date-fns';

interface VisionData {
  vision_body?: string;
  vision_spirit?: string;
  vision_relationships?: string;
  vision_business?: string;
  vision_declaration?: string;
  target_date?: string;
  what_i_will_give?: string;
}

interface Day1VisionDeclarationProps {
  visionData: VisionData;
  onVisionChange: (data: VisionData) => void;
  onComplete: (finalData: VisionData) => void;
  userName?: string;
}

const AREAS = [
  {
    key: 'vision_body',
    labelRo: 'CORP',
    labelEn: 'BODY',
    icon: Dumbbell,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
    placeholderRo: 'Ex: Voi avea 75kg, voi alerga 10km ușor, voi avea energie toată ziua...',
    placeholderEn: 'Ex: I will weigh 75kg, run 10km easily, have energy all day...'
  },
  {
    key: 'vision_spirit',
    labelRo: 'SPIRIT',
    labelEn: 'BEING',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    placeholderRo: 'Ex: Voi medita 20 min zilnic, voi fi calm și prezent, voi avea pace interioară...',
    placeholderEn: 'Ex: I will meditate 20 min daily, be calm and present, have inner peace...'
  },
  {
    key: 'vision_relationships',
    labelRo: 'RELAȚII',
    labelEn: 'RELATIONSHIPS',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    placeholderRo: 'Ex: Voi petrece timp de calitate cu familia, voi avea o relație puternică...',
    placeholderEn: 'Ex: I will spend quality time with family, have a strong relationship...'
  },
  {
    key: 'vision_business',
    labelRo: 'BUSINESS',
    labelEn: 'BUSINESS',
    icon: Briefcase,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    placeholderRo: 'Ex: Voi câștiga 10.000€/lună, voi avea afacerea mea, voi fi promovat...',
    placeholderEn: 'Ex: I will earn 10,000€/month, have my own business, get promoted...'
  },
  {
    key: 'what_i_will_give',
    labelRo: 'CE VOI OFERI ÎN SCHIMB',
    labelEn: 'WHAT I WILL GIVE IN RETURN',
    icon: HandHeart,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    placeholderRo: 'Ex: Voi oferi 8 ore de muncă focalizată zilnic, voi servi 100 de clienți cu excelență...',
    placeholderEn: 'Ex: I will offer 8 hours of focused work daily, serve 100 clients with excellence...'
  }
];

export const Day1VisionDeclaration: React.FC<Day1VisionDeclarationProps> = ({
  visionData,
  onVisionChange,
  onComplete,
  userName = ''
}) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  
  const defaultDate = format(addYears(new Date(), 1), 'yyyy-MM-dd');
  
  const handleFieldChange = (key: string, value: string) => {
    onVisionChange({ ...visionData, [key]: value });
  };
  
  const normalizedTargetDate = visionData.target_date || defaultDate;

  const allFieldsFilled = AREAS.every(area => 
    (visionData[area.key as keyof VisionData] || '').trim().length >= 10
  ) && normalizedTargetDate.length > 0;
  
  // Generate the full declaration - Napoleon Hill's 6 Steps to Riches style
  const generateDeclaration = () => {
    const date = visionData.target_date || defaultDate;
    const formattedDate = format(new Date(date), 'dd MMMM yyyy');
    const today = format(new Date(), 'dd MMMM yyyy');
    
    if (isRo) {
      return `DECLARAȚIA MEA DE VIZIUNE
(În stilul celor 6 Pași Napoleon Hill)

Eu, ${userName || '[Numele tău]'}, am un SCOP DEFINIT:

Până la data de ${formattedDate}, voi fi transformat complet:

📌 CORP: ${visionData.vision_body || '___'}

📌 SPIRIT: ${visionData.vision_spirit || '___'}

📌 RELAȚII: ${visionData.vision_relationships || '___'}

📌 BUSINESS: ${visionData.vision_business || '___'}

💎 ÎN SCHIMB, EU OFER: ${visionData.what_i_will_give || '___'}

📋 PLANUL MEU DE ACȚIUNE:
- Voi urma Champion Routine zilnic
- Voi executa cele 4 arii Core fără excepție
- Voi citi această declarație în fiecare dimineață și seară

Această declarație este sigilată cu credință absolută.
Voi acționa CA ȘI CUM este deja realizată.

Data: ${today}
Semnătura mentală: ${userName || '[Numele tău]'}`;
    } else {
      return `MY VISION DECLARATION
(In the style of Napoleon Hill's 6 Steps)

I, ${userName || '[Your Name]'}, have a DEFINITE PURPOSE:

By ${formattedDate}, I will be completely transformed:

📌 BODY: ${visionData.vision_body || '___'}

📌 BEING: ${visionData.vision_spirit || '___'}

📌 RELATIONSHIPS: ${visionData.vision_relationships || '___'}

📌 BUSINESS: ${visionData.vision_business || '___'}

💎 IN RETURN, I WILL GIVE: ${visionData.what_i_will_give || '___'}

📋 MY ACTION PLAN:
- I will follow the Champion Routine daily
- I will execute all 4 Core areas without exception
- I will read this declaration every morning and evening

This declaration is sealed with absolute faith.
I will act AS IF it is already accomplished.

Date: ${today}
Mental Signature: ${userName || '[Your Name]'}`;
    }
  };
  
  return (
    <Card className="p-6 bg-card border-primary/20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 mx-auto mb-4">
          <ScrollText className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isRo ? 'PASUL 2: DECLARAȚIA VIZIUNII' : 'STEP 2: VISION DECLARATION'}
        </h2>
        <p className="text-muted-foreground">
          {isRo 
            ? 'În stilul Napoleon Hill, scrie declarația ta de viziune pentru următorul an' 
            : 'In Napoleon Hill style, write your vision declaration for the next year'}
        </p>
      </div>
      
      {/* Target Date */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-primary" />
          <Label className="font-medium">
            {isRo ? 'Data țintă (1 an de acum)' : 'Target date (1 year from now)'}
          </Label>
        </div>
        <Input
          type="date"
          value={visionData.target_date || defaultDate}
          onChange={(e) => handleFieldChange('target_date', e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {/* Vision Areas */}
      <div className="space-y-4 mb-6">
        {AREAS.map((area) => {
          const Icon = area.icon;
          const value = visionData[area.key as keyof VisionData] || '';
          
          return (
            <div key={area.key} className={`p-4 rounded-lg border ${area.bgColor}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-5 w-5 ${area.color}`} />
                <Label className="font-semibold text-foreground">
                  {isRo ? area.labelRo : area.labelEn}
                </Label>
              </div>
              <Textarea
                value={value}
                onChange={(e) => handleFieldChange(area.key, e.target.value)}
                placeholder={isRo ? area.placeholderRo : area.placeholderEn}
                className="min-h-[80px] resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {value.length} {isRo ? 'caractere' : 'characters'}
                {value.trim().length < 10 && (
                  <span className="text-amber-500"> ({isRo ? 'minim 10' : 'min 10'})</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Generated Declaration Preview */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-amber-500" />
          <Label className="font-medium">
            {isRo ? 'Previzualizare Declarație' : 'Declaration Preview'}
          </Label>
        </div>
        <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4 rounded-lg border border-amber-500/20">
          <p className="whitespace-pre-line text-sm text-foreground font-serif italic leading-relaxed">
            {generateDeclaration()}
          </p>
        </div>
      </div>
      
      {/* Complete Button */}
      <Button
        onClick={() => {
          const declaration = generateDeclaration();
          const normalizedData: VisionData = {
            ...visionData,
            target_date: normalizedTargetDate,
            vision_declaration: declaration,
          };

          // Update both the declaration and notify parent with complete data
          onVisionChange(normalizedData);
          onComplete(normalizedData);
        }}
        disabled={!allFieldsFilled}
        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
      >
        {isRo ? 'Salvează Declarația și Continuă' : 'Save Declaration and Continue'}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </Card>
  );
};
