import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { ScrollText, ArrowRight, Crown, Calendar, Dumbbell, Sparkles, Heart, Briefcase, HandHeart, MessageCircle } from 'lucide-react';
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
  onPostToComments?: (declaration: string) => Promise<void>;
  declarationSaved?: boolean;
}

const AREAS = [
  {
    key: 'vision_body',
    labelRo: 'CORP',
    labelEn: 'BODY',
    icon: Dumbbell,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/20',
    placeholderRo: 'Am un corp sănătos și plin de energie. Cântăresc greutatea ideală, fac sport de 4 ori pe săptămână, dorm 7-8 ore și am energie toată ziua. Mă trezesc dimineața motivat și pregătit de acțiune.',
    placeholderEn: 'I have a healthy, energized body. I weigh my ideal weight, exercise 4 times a week, sleep 7-8 hours and have energy all day. I wake up every morning motivated and ready for action.',
    templateRo: 'Am un corp sănătos și plin de energie. Cântăresc ___ kg, fac sport de 4 ori pe săptămână, dorm 7-8 ore și am energie toată ziua.',
    templateEn: 'I have a healthy, energized body. I weigh ___ kg, exercise 4 times a week, sleep 7-8 hours and have energy all day.'
  },
  {
    key: 'vision_spirit',
    labelRo: 'SPIRIT',
    labelEn: 'BEING',
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    placeholderRo: 'Am pace interioară și claritate mentală. Meditez 20 minute zilnic, citesc 30 minute pe zi și am o mentalitate de creștere. Sunt calm, prezent și recunoscător pentru fiecare zi.',
    placeholderEn: 'I have inner peace and mental clarity. I meditate 20 minutes daily, read 30 minutes per day and have a growth mindset. I am calm, present and grateful for each day.',
    templateRo: 'Am pace interioară și claritate mentală. Meditez zilnic, citesc constant și am o mentalitate de creștere.',
    templateEn: 'I have inner peace and mental clarity. I meditate daily, read consistently and have a growth mindset.'
  },
  {
    key: 'vision_relationships',
    labelRo: 'RELAȚII',
    labelEn: 'RELATIONSHIPS',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 border-pink-500/20',
    placeholderRo: 'Am relații puternice și pline de dragoste. Petrec timp de calitate cu familia în fiecare zi, am prieteni care mă inspiră și mă susțin. Comunic deschis și cu empatie.',
    placeholderEn: 'I have strong, loving relationships. I spend quality time with family every day, have friends who inspire and support me. I communicate openly and with empathy.',
    templateRo: 'Am relații puternice și pline de dragoste. Petrec timp de calitate cu familia și am prieteni care mă inspiră.',
    templateEn: 'I have strong, loving relationships. I spend quality time with family and have friends who inspire me.'
  },
  {
    key: 'vision_business',
    labelRo: 'BUSINESS',
    labelEn: 'BUSINESS',
    icon: Briefcase,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    placeholderRo: 'Am un business profitabil care crește constant. Câștig ___€/lună, am sisteme care funcționează fără mine și ajut sute de oameni. Lucrez focalizat 4-6 ore pe zi pe lucrurile care contează.',
    placeholderEn: 'I have a profitable, growing business. I earn ___€/month, have systems that run without me and help hundreds of people. I work focused 4-6 hours per day on what matters.',
    templateRo: 'Am un business profitabil care crește constant. Câștig ___€/lună și am sisteme care funcționează.',
    templateEn: 'I have a profitable, growing business. I earn ___€/month and have systems that run efficiently.'
  },
  {
    key: 'what_i_will_give',
    labelRo: 'CE VOI OFERI ÎN SCHIMB',
    labelEn: 'WHAT I WILL GIVE IN RETURN',
    icon: HandHeart,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    placeholderRo: 'Voi oferi 6 ore de muncă focalizată zilnic, voi servi clienții cu excelență, voi fi prezent 100% pentru familie și voi investi constant în dezvoltarea mea personală.',
    placeholderEn: 'I will offer 6 hours of focused work daily, serve clients with excellence, be 100% present for family and consistently invest in my personal development.',
    templateRo: 'Voi oferi muncă focalizată zilnic, voi servi cu excelență și voi investi constant în dezvoltarea mea.',
    templateEn: 'I will offer focused work daily, serve with excellence and consistently invest in my development.'
  }
];

export const Day1VisionDeclaration: React.FC<Day1VisionDeclarationProps> = ({
  visionData,
  onVisionChange,
  onComplete,
  userName = '',
  onPostToComments,
  declarationSaved = false
}) => {
  const [isPosting, setIsPosting] = React.useState(false);
  const [posted, setPosted] = React.useState(false);
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
      
      {/* Share to Comments Button - appears after saving */}
      {declarationSaved && visionData.vision_declaration && onPostToComments && !posted && (
        <Button
          variant="outline"
          onClick={async () => {
            if (!visionData.vision_declaration) return;
            setIsPosting(true);
            try {
              await onPostToComments(visionData.vision_declaration);
              setPosted(true);
            } finally {
              setIsPosting(false);
            }
          }}
          disabled={isPosting}
          className="w-full mt-3 border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          {isPosting 
            ? (isRo ? 'Se postează...' : 'Posting...')
            : (isRo ? 'Distribuie declarația în comunitate' : 'Share declaration to community')}
        </Button>
      )}
      
      {posted && (
        <p className="text-center text-sm text-green-600 mt-2">
          {isRo ? '✓ Declarația ta a fost distribuită în comunitate!' : '✓ Your declaration has been shared!'}
        </p>
      )}
    </Card>
  );
};
