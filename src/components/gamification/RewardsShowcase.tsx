import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, Check, Palette, User, Frame, Sparkles, Crown, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  name: { en: string; ro: string };
  description: { en: string; ro: string };
  type: 'theme' | 'avatar' | 'frame';
  unlockLevel: number;
  preview: string;
  color?: string;
}

const REWARDS: Reward[] = [
  // Themes
  { id: 'theme_midnight', name: { en: 'Midnight Mode', ro: 'Mod Miezul Nopții' }, description: { en: 'Deep dark theme with purple accents', ro: 'Temă întunecată cu accente violet' }, type: 'theme', unlockLevel: 5, preview: '🌙', color: 'from-indigo-900 to-purple-900' },
  { id: 'theme_forest', name: { en: 'Forest Serenity', ro: 'Serenitate Forestieră' }, description: { en: 'Calming green nature theme', ro: 'Temă verde calmantă de natură' }, type: 'theme', unlockLevel: 10, preview: '🌲', color: 'from-green-800 to-emerald-900' },
  { id: 'theme_sunset', name: { en: 'Sunset Warrior', ro: 'Războinic Apus' }, description: { en: 'Warm orange and red gradients', ro: 'Gradiente calde portocalii și roșii' }, type: 'theme', unlockLevel: 15, preview: '🌅', color: 'from-orange-600 to-red-700' },
  { id: 'theme_ocean', name: { en: 'Ocean Depths', ro: 'Adâncuri Oceanice' }, description: { en: 'Deep blue tranquil theme', ro: 'Temă albastră liniștită' }, type: 'theme', unlockLevel: 20, preview: '🌊', color: 'from-blue-700 to-cyan-800' },
  { id: 'theme_gold', name: { en: 'Golden Champion', ro: 'Campion Auriu' }, description: { en: 'Luxurious gold and black theme', ro: 'Temă luxoasă aurie și neagră' }, type: 'theme', unlockLevel: 30, preview: '✨', color: 'from-yellow-600 to-amber-700' },
  
  // Avatars
  { id: 'avatar_warrior', name: { en: 'Warrior Spirit', ro: 'Spirit de Războinic' }, description: { en: 'Show your fighting spirit', ro: 'Arată-ți spiritul de luptător' }, type: 'avatar', unlockLevel: 3, preview: '⚔️' },
  { id: 'avatar_phoenix', name: { en: 'Rising Phoenix', ro: 'Fenix în Ascensiune' }, description: { en: 'Rise from the ashes', ro: 'Ridică-te din cenușă' }, type: 'avatar', unlockLevel: 8, preview: '🔥' },
  { id: 'avatar_lion', name: { en: 'Lion Heart', ro: 'Inimă de Leu' }, description: { en: 'Courage personified', ro: 'Curajul personificat' }, type: 'avatar', unlockLevel: 12, preview: '🦁' },
  { id: 'avatar_dragon', name: { en: 'Dragon Master', ro: 'Maestru Dragon' }, description: { en: 'Unleash your inner dragon', ro: 'Eliberează-ți dragonul interior' }, type: 'avatar', unlockLevel: 18, preview: '🐉' },
  { id: 'avatar_crown', name: { en: 'Royal Legend', ro: 'Legendă Regală' }, description: { en: 'For true champions only', ro: 'Doar pentru adevărații campioni' }, type: 'avatar', unlockLevel: 25, preview: '👑' },
  { id: 'avatar_galaxy', name: { en: 'Galaxy Mind', ro: 'Minte Galaxie' }, description: { en: 'Infinite potential', ro: 'Potențial infinit' }, type: 'avatar', unlockLevel: 40, preview: '🌌' },
  
  // Frames
  { id: 'frame_bronze', name: { en: 'Bronze Frame', ro: 'Cadru Bronz' }, description: { en: 'Starter achievement frame', ro: 'Cadru pentru începători' }, type: 'frame', unlockLevel: 5, preview: '🥉' },
  { id: 'frame_silver', name: { en: 'Silver Frame', ro: 'Cadru Argint' }, description: { en: 'Intermediate achiever frame', ro: 'Cadru pentru nivel intermediar' }, type: 'frame', unlockLevel: 15, preview: '🥈' },
  { id: 'frame_gold', name: { en: 'Gold Frame', ro: 'Cadru Aur' }, description: { en: 'Advanced warrior frame', ro: 'Cadru pentru războinici avansați' }, type: 'frame', unlockLevel: 25, preview: '🥇' },
  { id: 'frame_diamond', name: { en: 'Diamond Frame', ro: 'Cadru Diamant' }, description: { en: 'Elite status frame', ro: 'Cadru pentru statut de elită' }, type: 'frame', unlockLevel: 35, preview: '💎' },
  { id: 'frame_legendary', name: { en: 'Legendary Frame', ro: 'Cadru Legendar' }, description: { en: 'For legends only', ro: 'Doar pentru legende' }, type: 'frame', unlockLevel: 50, preview: '⭐' }
];

interface RewardsShowcaseProps {
  currentLevel: number;
  onEquip?: (rewardId: string) => void;
  equippedRewards?: { theme?: string; avatar?: string; frame?: string };
}

export const RewardsShowcase: React.FC<RewardsShowcaseProps> = ({
  currentLevel,
  onEquip,
  equippedRewards = {}
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'theme' | 'avatar' | 'frame'>('theme');

  const filteredRewards = REWARDS.filter(r => r.type === activeTab);
  const unlockedCount = REWARDS.filter(r => r.unlockLevel <= currentLevel).length;

  return (
    <Card className="p-4 bg-card border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {language === 'en' ? 'Rewards & Collectibles' : 'Recompense & Colecții'}
        </h3>
        <div className="text-xs text-muted-foreground">
          {unlockedCount}/{REWARDS.length} {language === 'en' ? 'unlocked' : 'deblocate'}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="theme" className="gap-1">
            <Palette className="h-3 w-3" />
            {language === 'en' ? 'Themes' : 'Teme'}
          </TabsTrigger>
          <TabsTrigger value="avatar" className="gap-1">
            <User className="h-3 w-3" />
            {language === 'en' ? 'Avatars' : 'Avatare'}
          </TabsTrigger>
          <TabsTrigger value="frame" className="gap-1">
            <Frame className="h-3 w-3" />
            {language === 'en' ? 'Frames' : 'Cadre'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-2 gap-3">
            {filteredRewards.map(reward => {
              const isUnlocked = currentLevel >= reward.unlockLevel;
              const isEquipped = equippedRewards[reward.type] === reward.id;
              
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "relative p-3 rounded-lg border-2 transition-all",
                    isUnlocked 
                      ? isEquipped 
                        ? "border-primary bg-primary/10" 
                        : "border-border/50 bg-muted/30 hover:border-primary/50 cursor-pointer"
                      : "border-border/30 bg-muted/10 opacity-60"
                  )}
                  onClick={() => isUnlocked && !isEquipped && onEquip?.(reward.id)}
                >
                  {/* Lock overlay */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                      <div className="text-center">
                        <Lock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Lv.{reward.unlockLevel}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Equipped badge */}
                  {isEquipped && (
                    <div className="absolute top-1 right-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  {/* Preview */}
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center text-2xl mx-auto mb-2",
                    reward.color ? `bg-gradient-to-br ${reward.color}` : "bg-muted"
                  )}>
                    {reward.preview}
                  </div>
                  
                  {/* Name */}
                  <h4 className="text-xs font-medium text-center truncate">
                    {reward.name[language]}
                  </h4>
                  
                  {/* Description on hover - simplified for mobile */}
                  {isUnlocked && !isEquipped && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full h-6 text-xs mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEquip?.(reward.id);
                      }}
                    >
                      {language === 'en' ? 'Equip' : 'Echipează'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Next unlock preview */}
      {(() => {
        const nextReward = REWARDS.filter(r => r.unlockLevel > currentLevel)
          .sort((a, b) => a.unlockLevel - b.unlockLevel)[0];
        
        if (!nextReward) return null;
        
        return (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{nextReward.preview}</div>
              <div className="flex-1">
                <p className="text-xs font-medium">{language === 'en' ? 'Next unlock:' : 'Următoarea deblocare:'}</p>
                <p className="text-sm font-bold">{nextReward.name[language]}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary">
                  <Zap className="h-3 w-3" />
                  <span className="text-xs font-bold">Lv.{nextReward.unlockLevel}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Card>
  );
};

export default RewardsShowcase;
