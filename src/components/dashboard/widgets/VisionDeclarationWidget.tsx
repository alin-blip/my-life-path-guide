import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, ArrowRight, Edit3, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VisionData {
  vision_body?: string | null;
  vision_spirit?: string | null;
  vision_relationships?: string | null;
  vision_business?: string | null;
  vision_declaration?: string | null;
  target_date?: string | null;
  what_i_will_give?: string | null;
}

export const VisionDeclarationWidget: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const [visionData, setVisionData] = useState<VisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDeclaration, setShowFullDeclaration] = useState(false);

  useEffect(() => {
    const fetchVisionData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('challenge_day1_responses')
          .select('vision_body, vision_spirit, vision_relationships, vision_business, vision_declaration, target_date, what_i_will_give')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setVisionData(data);
        }
      } catch (error) {
        console.error('Error fetching vision data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisionData();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasVision = visionData?.vision_declaration || 
    (visionData?.vision_body && visionData?.vision_spirit && 
     visionData?.vision_relationships && visionData?.vision_business);

  // If no vision exists, show CTA
  if (!hasVision) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shrink-0">
              <ScrollText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {isRo ? 'Declarația de Viziune Napoleon Hill' : 'Napoleon Hill Vision Declaration'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRo 
                    ? 'Nu ai încă o declarație de viziune. Creează-ți viziunea pentru anul următor în stilul celor 6 Pași către Bogăție.' 
                    : "You don't have a vision declaration yet. Create your vision for the next year in the style of the 6 Steps to Riches."}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/challenge/1')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {isRo ? 'Completează Declarația' : 'Complete Declaration'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format target date
  const formattedDate = visionData.target_date 
    ? format(new Date(visionData.target_date), 'dd MMMM yyyy')
    : null;

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20 hover:border-amber-500/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
              <ScrollText className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-base font-semibold">
              {isRo ? 'Declarația Mea de Viziune' : 'My Vision Declaration'}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/challenge/1')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {formattedDate && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {isRo ? 'Până la:' : 'By:'}
            </span> {formattedDate}
          </p>
        )}
        
        {/* Vision areas summary */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'vision_body', icon: '🏋️', label: isRo ? 'Corp' : 'Body', color: 'text-green-500' },
            { key: 'vision_spirit', icon: '🧘', label: isRo ? 'Spirit' : 'Being', color: 'text-purple-500' },
            { key: 'vision_relationships', icon: '💕', label: isRo ? 'Relații' : 'Relationships', color: 'text-pink-500' },
            { key: 'vision_business', icon: '💼', label: 'Business', color: 'text-blue-500' },
          ].map(({ key, icon, label, color }) => (
            <div 
              key={key} 
              className="p-2 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{icon}</span>
                <span className={`text-xs font-medium ${color}`}>{label}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {(visionData[key as keyof VisionData] as string)?.substring(0, 60) || '—'}
                {((visionData[key as keyof VisionData] as string)?.length || 0) > 60 ? '...' : ''}
              </p>
            </div>
          ))}
        </div>

        {/* What I will give (Napoleon Hill element) */}
        {visionData.what_i_will_give && (
          <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {isRo ? 'Ce ofer în schimb' : 'What I give in return'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {visionData.what_i_will_give.substring(0, 80)}
              {visionData.what_i_will_give.length > 80 ? '...' : ''}
            </p>
          </div>
        )}

        {/* Read full declaration button */}
        <Dialog open={showFullDeclaration} onOpenChange={setShowFullDeclaration}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-amber-500/30 hover:bg-amber-500/10"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {isRo ? 'Citește Declarația Completă' : 'Read Full Declaration'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-amber-500" />
                {isRo ? 'Declarația Mea de Viziune' : 'My Vision Declaration'}
              </DialogTitle>
            </DialogHeader>
            <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-6 rounded-lg border border-amber-500/20">
              <p className="whitespace-pre-line text-sm text-foreground font-serif italic leading-relaxed">
                {visionData.vision_declaration}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isRo 
                ? 'Napoleon Hill: "Citește această declarație cu voce tare, dimineața și seara"' 
                : 'Napoleon Hill: "Read this declaration aloud, morning and evening"'}
            </p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
