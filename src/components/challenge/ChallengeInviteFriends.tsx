import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Users, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAffiliateLink } from '@/hooks/useAffiliateLink';

interface ChallengeInviteFriendsProps {
  dayNumber: number;  // 1-7
}

export const ChallengeInviteFriends: React.FC<ChallengeInviteFriendsProps> = ({ dayNumber }) => {
  const { language } = useLanguage();
  const { referralLink, shareWithMessage, isLoading } = useAffiliateLink();
  const [copied, setCopied] = useState(false);

  const getInviteMessage = (day: number): { ro: string; en: string } => {
    const link = referralLink || '{REFERRAL_LINK}';
    
    switch (day) {
      case 1:
        return {
          ro: `Tocmai am început acest challenge și am o invitație exclusivă gratuită pentru tine.

Uite ce se întâmplă în următoarele 7 zile:
• Ziua 1: Viziune & Claritate
• Ziua 2: Corp, Spirit & Relații
• Ziua 3: Business & Execuție
• Ziua 4: Rutina Zilnică de Execuție
• Ziua 5: Accountability & Mindset
• Ziua 6: Gândire Strategică & Idei
• Ziua 7: Continuitate & Creștere

Vrei să faci acest challenge împreună cu mine?

Alătură-te aici 👇
${link}`,
          en: `I just started this challenge and I have an exclusive free invite for you.

Here's what happens in the next 7 days:
• Day 1: Vision & Clarity
• Day 2: Body, Spirit & Relationships
• Day 3: Business & Execution
• Day 4: Daily Execution Routine
• Day 5: Accountability & Mindset
• Day 6: Strategic Thinking & Ideas
• Day 7: Continuity & Growth

Do you want to take this challenge with me?

Join here 👇
${link}`
        };
      
      case 2:
        return {
          ro: `Hei! Am început challenge-ul și sunt în Ziua 2! 💪

Ieri (Ziua 1) mi-am setat:
✅ Viziunea pentru 2026 în toate cele 4 zone
✅ Declarația personală Napoleon Hill
✅ M-am alăturat comunității

Astăzi lucrez la obiective pentru Corp, Spirit și Relații.

Următoarele zile:
• Ziua 3: Business + Sistem Execuție
• Ziua 4: Rutină Zilnică + Meditație AI
• Ziua 5-7: Accountability + Control + Continuitate

Am o invitație exclusivă gratuită pentru tine!

Alătură-te aici 👇
${link}`,
          en: `Hey! I started the challenge and I'm on Day 2! 💪

Yesterday (Day 1) I set:
✅ My 2026 vision for all 4 life areas
✅ My personal Napoleon Hill declaration
✅ Joined the community

Today I'm working on Body, Spirit, and Relationship goals.

Upcoming days:
• Day 3: Business + Execution System
• Day 4: Daily Routine + AI Meditation
• Days 5-7: Accountability + Control + Continuity

I have an exclusive free invite for you!

Join here 👇
${link}`
        };
      
      case 3:
        return {
          ro: `Sunt în Ziua 3 din Challenge! 🎯

Ce am realizat până acum:
✅ Viziune clară pentru 2026
✅ Obiective Corp, Spirit & Relații (an/90 zile/30 zile)

Astăzi e ziua magică - setez Business + Domino Door:
→ Viziune business 1 an
→ Ținte 90 zile
→ Milestone prima lună
→ Plan săptămânal cu 4 chei

Urmează Warrior Routine, Mind Coach, și Control Idei.

Am invitație gratuită exclusivă pentru tine!

Alătură-te aici 👇
${link}`,
          en: `I'm on Day 3 of the Challenge! 🎯

What I've accomplished so far:
✅ Clear 2026 vision
✅ Body, Spirit & Relationship goals (year/90 days/30 days)

Today is the magic day - setting Business + Domino Door:
→ 1 year business vision
→ 90 day targets
→ First month milestone
→ Weekly plan with 4 keys

Next up: Warrior Routine, Mind Coach, and Idea Control.

I have an exclusive free invite for you!

Join here 👇
${link}`
        };
      
      case 4:
        return {
          ro: `Ziua 4 în Challenge! ⚡

Am realizat deja:
✅ Viziune 2026 completă
✅ Obiective toate ariile (an/90/30 zile)
✅ Business Plan + Domino Door săptămânal

Astăzi configurez:
→ Vision Board AI (imagini pentru obiective)
→ Warrior Routine (rutină zilnică)
→ Meditație personalizată pe obiectivele MELE

Mai am 3 zile: Accountability, Control Idei, Continuitate.

Vrei să te alături? Am invitație exclusivă!

Alătură-te aici 👇
${link}`,
          en: `Day 4 in the Challenge! ⚡

Already accomplished:
✅ Complete 2026 vision
✅ Goals for all areas (year/90/30 days)
✅ Business Plan + Weekly Domino Door

Today I'm configuring:
→ Vision Board AI (images for goals)
→ Warrior Routine (daily routine)
→ Personalized meditation based on MY goals

3 more days: Accountability, Idea Control, Continuity.

Want to join? I have an exclusive invite!

Join here 👇
${link}`
        };
      
      case 5:
        return {
          ro: `Ziua 5 - Accountability & Mind Coach! 🧠

Ce am până acum:
✅ Viziune + Plan complet (an/90/30/săptămână)
✅ Warrior Routine configurată
✅ Vision Board AI + Meditație personalizată

Astăzi lucrez la:
→ Accountability Coach (știe tot ce am de făcut)
→ Mind Coach (transformă frici/anxietăți în putere)

Mai am 2 zile: Control Idei + Finalizare.

Încă am invitații exclusive gratuite!

Alătură-te aici 👇
${link}`,
          en: `Day 5 - Accountability & Mind Coach! 🧠

What I have so far:
✅ Complete Vision + Plan (year/90/30/week)
✅ Warrior Routine configured
✅ Vision Board AI + Personalized Meditation

Today I'm working on:
→ Accountability Coach (knows everything I need to do)
→ Mind Coach (transforms fears/anxiety into power)

2 more days: Idea Control + Finalization.

I still have exclusive free invites!

Join here 👇
${link}`
        };
      
      case 6:
        return {
          ro: `Ziua 6 - Control Mental! 💡

Am realizat:
✅ Viziune + Plan complet
✅ Rutină zilnică funcțională
✅ Accountability + Mind Coach setup

Astăzi învăț să controlez impulsul ideilor noi:
→ Idea List (Parking Lot pentru idei)
→ Matricea Eisenhower
→ Să nu las ideile să distrugă execuția

Mâine finalizez și fac recap complet!

Ultimele invitații exclusive gratuite!

Alătură-te aici 👇
${link}`,
          en: `Day 6 - Mental Control! 💡

Accomplished:
✅ Complete Vision + Plan
✅ Functional daily routine
✅ Accountability + Mind Coach setup

Today I'm learning to control the impulse of new ideas:
→ Idea List (Parking Lot for ideas)
→ Eisenhower Matrix
→ Not letting ideas destroy execution

Tomorrow I finalize and do a complete recap!

Last exclusive free invites!

Join here 👇
${link}`
        };
      
      case 7:
      default:
        return {
          ro: `Tocmai am terminat acest challenge! 🏆

În 7 zile am obținut mai multă claritate decât în ani.

Acum am:
✅ Viziune clară pentru 2026
✅ Plan anual + 90 zile + 30 zile
✅ Sistem execuție săptămânală (Domino Door)
✅ Rutină zilnică automatizată
✅ Control asupra ideilor

Am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
${link}`,
          en: `I just finished this challenge! 🏆

In 7 days I gained more clarity than in years.

Now I have:
✅ Clear 2026 vision
✅ Annual + 90 day + 30 day plan
✅ Weekly execution system (Domino Door)
✅ Automated daily routine
✅ Control over ideas

I have an exclusive free invite for you.

Join here 👇
${link}`
        };
    }
  };

  const messages = getInviteMessage(dayNumber);
  const inviteMessage = language === 'ro' ? messages.ro : messages.en;

  const handleShare = () => {
    shareWithMessage(inviteMessage);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getHeaderText = () => {
    if (dayNumber === 7) {
      return language === 'ro' 
        ? '🎁 Distribuie Succesul' 
        : '🎁 Share Your Success';
    }
    return language === 'ro' 
      ? '🎁 Invită 1-3 Prieteni' 
      : '🎁 Invite 1-3 Friends';
  };

  const getSubtitleText = () => {
    if (dayNumber === 7) {
      return language === 'ro'
        ? 'Ai terminat challenge-ul! Invită prietenii să experimenteze aceeași transformare.'
        : 'You finished the challenge! Invite friends to experience the same transformation.';
    }
    if (dayNumber === 1) {
      return language === 'ro'
        ? 'Ai o invitație exclusivă gratuită. Trimite-o prietenilor care vor să-și transforme viața alături de tine.'
        : 'You have an exclusive free invite. Send it to friends who want to transform their life alongside you.';
    }
    return language === 'ro'
      ? 'Împarte experiența cu prietenii care vor să se transforme. Ai invitații exclusive gratuite!'
      : 'Share the experience with friends who want to transform. You have exclusive free invites!';
  };

  return (
    <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          <Gift className="h-6 w-6 text-white" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {getHeaderText()}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getSubtitleText()}
            </p>
          </div>

          <div className="bg-background/50 rounded-lg p-3 border border-amber-500/20">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {language === 'ro' ? 'Mesajul care va fi trimis:' : 'Message that will be sent:'}
            </p>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">
              {inviteMessage}
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleShare}
              disabled={isLoading || !referralLink}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Trimite Invitația' : 'Send Invite'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!referralLink}
              className="border-amber-500/30"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {language === 'ro' ? 'Copiat!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  {language === 'ro' ? 'Copiază' : 'Copy'}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {language === 'ro' 
                ? 'Prietenii tăi primesc acces gratuit la zilele 1-2'
                : 'Your friends get free access to days 1-2'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChallengeInviteFriends;
