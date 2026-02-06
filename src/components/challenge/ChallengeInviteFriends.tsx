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
          ro: `Tocmai am început un challenge anti-burnout și am o invitație exclusivă gratuită pentru tine.

Uite ce se întâmplă în 7 zile:
• Ziua 1: Oprești deriva — Viziune & Claritate
• Ziua 2: Reconstruiești fundația — Corp, Spirit & Relații
• Ziua 3: Treci la execuție — Business & Domino Door
• Ziua 4: Automatizezi momentum-ul — Rutina Zilnică
• Ziua 5: Spargi procrastinarea — Accountability & Mindset
• Ziua 6: Controlezi impulsurile — Filtru Strategic
• Ziua 7: Blochezi momentum-ul — Permanent

Vrei să ieșim din burnout împreună?

Alătură-te aici 👇
${link}`,
          en: `I just started an anti-burnout challenge and I have an exclusive free invite for you.

Here's what happens in 7 days:
• Day 1: Stop drifting — Vision & Clarity
• Day 2: Rebuild the foundation — Body, Spirit & Relationships
• Day 3: Start executing — Business & Domino Door
• Day 4: Automate momentum — Daily Routine
• Day 5: Break procrastination — Accountability & Mindset
• Day 6: Control impulses — Strategic Filter
• Day 7: Lock in momentum — Permanently

Want to escape burnout together?

Join here 👇
${link}`
        };
      
      case 2:
        return {
          ro: `Hei! Am început challenge-ul anti-burnout și sunt în Ziua 2! 💪

Ieri (Ziua 1) am spart ceața:
✅ Am descoperit DE CE-ul meu real
✅ Am scris declarația anti-burnout
✅ Am intrat în comunitate

Astăzi reconstruiesc fundația — Corp, Spirit și Relații.

Următoarele zile:
• Ziua 3: Business + Sistem Execuție fără epuizare
• Ziua 4: Rutină Zilnică + Meditație AI
• Ziua 5-7: Accountability + Control + Momentum Permanent

Am o invitație exclusivă gratuită pentru tine!

Alătură-te aici 👇
${link}`,
          en: `Hey! I started the anti-burnout challenge and I'm on Day 2! 💪

Yesterday (Day 1) I cut through the fog:
✅ Discovered my real WHY
✅ Wrote my anti-burnout declaration
✅ Joined the community

Today I'm rebuilding the foundation — Body, Spirit, and Relationships.

Upcoming days:
• Day 3: Business + Execution System without exhaustion
• Day 4: Daily Routine + AI Meditation
• Days 5-7: Accountability + Control + Permanent Momentum

I have an exclusive free invite for you!

Join here 👇
${link}`
        };
      
      case 3:
        return {
          ro: `Sunt în Ziua 3 din Challenge-ul Anti-Burnout! 🎯

Ce am construit până acum:
✅ Claritate totală — viziune + declarație
✅ Fundație reconstruită — Corp, Spirit & Relații

Astăzi trec la execuție:
→ Plan business fără epuizare
→ Domino Door — sistem săptămânal de momentum
→ 4 chei care mișcă totul înainte

Urmează Rutina Anti-Burnout, Mind Coach, și Control Impulsuri.

Am invitație gratuită exclusivă pentru tine!

Alătură-te aici 👇
${link}`,
          en: `I'm on Day 3 of the Anti-Burnout Challenge! 🎯

What I've built so far:
✅ Total clarity — vision + declaration
✅ Foundation rebuilt — Body, Spirit & Relationships

Today I move to execution:
→ Business plan without exhaustion
→ Domino Door — weekly momentum system
→ 4 keys that move everything forward

Next up: Anti-Burnout Routine, Mind Coach, and Impulse Control.

I have an exclusive free invite for you!

Join here 👇
${link}`
        };
      
      case 4:
        return {
          ro: `Ziua 4 în Challenge-ul Anti-Burnout! ⚡

Am construit deja:
✅ Claritate + Viziune anti-burnout
✅ Fundație reconstruită (Corp, Spirit, Relații)
✅ Sistem de execuție fără epuizare (Domino Door)

Astăzi automatizez momentum-ul:
→ Vision Board AI (imagini pentru obiective)
→ Rutina Zilnică Anti-Burnout
→ Meditație personalizată pe obiectivele MELE

Mai am 3 zile: Accountability, Control Impulsuri, Momentum Permanent.

Vrei să ieși din burnout? Am invitație exclusivă!

Alătură-te aici 👇
${link}`,
          en: `Day 4 in the Anti-Burnout Challenge! ⚡

Already built:
✅ Anti-burnout clarity + Vision
✅ Foundation rebuilt (Body, Spirit, Relationships)
✅ Execution system without exhaustion (Domino Door)

Today I'm automating momentum:
→ Vision Board AI (images for goals)
→ Daily Anti-Burnout Routine
→ Personalized meditation based on MY goals

3 more days: Accountability, Impulse Control, Permanent Momentum.

Want to escape burnout? I have an exclusive invite!

Join here 👇
${link}`
        };
      
      case 5:
        return {
          ro: `Ziua 5 - Sparg bucla procrastinării! 🧠

Ce am construit până acum:
✅ Claritate + Plan anti-burnout complet
✅ Rutina zilnică care nu epuizează
✅ Vision Board AI + Meditație personalizată

Astăzi lucrez la:
→ Accountability Coach (știe tot ce am de făcut)
→ Mind Coach (transformă burnout-ul în momentum)

Mai am 2 zile: Control Impulsuri + Momentum Permanent.

Încă am invitații exclusive gratuite!

Alătură-te aici 👇
${link}`,
          en: `Day 5 - Breaking the procrastination loop! 🧠

What I've built so far:
✅ Complete anti-burnout clarity + Plan
✅ Daily routine that doesn't exhaust
✅ Vision Board AI + Personalized Meditation

Today I'm working on:
→ Accountability Coach (knows everything I need to do)
→ Mind Coach (transforms burnout into momentum)

2 more days: Impulse Control + Permanent Momentum.

I still have exclusive free invites!

Join here 👇
${link}`
        };
      
      case 6:
        return {
          ro: `Ziua 6 - Control Impulsuri! 💡

Am construit:
✅ Plan anti-burnout complet
✅ Rutină zilnică + Accountability setup
✅ Mind Coach — procrastinarea devine acțiune

Astăzi învăț să nu las ideile noi să distrugă momentum-ul:
→ Idea List (Parking Lot strategic)
→ Matricea Eisenhower
→ Protejez execuția de sindromul obiectului strălucitor

Mâine blochez momentum-ul permanent!

Ultimele invitații exclusive gratuite!

Alătură-te aici 👇
${link}`,
          en: `Day 6 - Impulse Control! 💡

Built so far:
✅ Complete anti-burnout plan
✅ Daily routine + Accountability setup
✅ Mind Coach — procrastination becomes action

Today I'm learning to protect momentum from new ideas:
→ Idea List (Strategic Parking Lot)
→ Eisenhower Matrix
→ Protecting execution from shiny object syndrome

Tomorrow I lock in momentum permanently!

Last exclusive free invites!

Join here 👇
${link}`
        };
      
      case 7:
      default:
        return {
          ro: `Tocmai am terminat challenge-ul anti-burnout! 🏆

În 7 zile am spart ciclul procrastinării și am construit momentum real.

Acum am:
✅ Claritate totală asupra direcției
✅ Plan anti-burnout pe 4 arii (Corp, Spirit, Relații, Business)
✅ Sistem execuție săptămânală (Domino Door)
✅ Rutină zilnică care nu epuizează
✅ Control asupra impulsurilor

Am o invitație exclusivă gratuită pentru tine.

Alătură-te aici 👇
${link}`,
          en: `I just finished the anti-burnout challenge! 🏆

In 7 days I broke the procrastination cycle and built real momentum.

Now I have:
✅ Total clarity on my direction
✅ Anti-burnout plan across 4 areas (Body, Spirit, Relationships, Business)
✅ Weekly execution system (Domino Door)
✅ Daily routine that doesn't exhaust
✅ Control over impulses

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
        ? '🎁 Distribuie Momentum-ul' 
        : '🎁 Share the Momentum';
    }
    return language === 'ro' 
      ? '🎁 Invită 1-3 Prieteni' 
      : '🎁 Invite 1-3 Friends';
  };

  const getSubtitleText = () => {
    if (dayNumber === 7) {
      return language === 'ro'
        ? 'Ai spart ciclul burnout-ului! Invită prietenii să construiască același momentum.'
        : 'You broke the burnout cycle! Invite friends to build the same momentum.';
    }
    if (dayNumber === 1) {
      return language === 'ro'
        ? 'Ai o invitație exclusivă gratuită. Trimite-o prietenilor care vor să iasă din burnout alături de tine.'
        : 'You have an exclusive free invite. Send it to friends who want to escape burnout alongside you.';
    }
    return language === 'ro'
      ? 'Împarte experiența cu prietenii care vor să iasă din burnout. Ai invitații exclusive gratuite!'
      : 'Share the experience with friends who want to escape burnout. You have exclusive free invites!';
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
