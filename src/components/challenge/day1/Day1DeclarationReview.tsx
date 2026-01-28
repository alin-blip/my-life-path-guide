import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Crown, MessageCircle, Edit3, Check } from 'lucide-react';

interface Day1DeclarationReviewProps {
  declaration: string;
  onPostToComments?: (declaration: string) => Promise<void>;
  onEdit?: () => void;
  hasPosted?: boolean;
}

export const Day1DeclarationReview: React.FC<Day1DeclarationReviewProps> = ({
  declaration,
  onPostToComments,
  onEdit,
  hasPosted = false
}) => {
  const { language } = useLanguage();
  const isRo = language === 'ro';
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(hasPosted);

  const handlePost = async () => {
    if (!onPostToComments || posted) return;
    setIsPosting(true);
    try {
      await onPostToComments(declaration);
      setPosted(true);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="p-6 bg-card border-primary/20 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isRo ? 'DECLARAȚIA TA DE VIZIUNE' : 'YOUR VISION DECLARATION'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRo ? 'Creată în stilul Napoleon Hill' : 'Created in Napoleon Hill style'}
          </p>
        </div>
      </div>

      {/* Declaration Content */}
      <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5 rounded-xl border border-amber-500/20 mb-4">
        <p className="whitespace-pre-line text-sm text-foreground font-serif italic leading-relaxed">
          {declaration}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Share Button */}
        {onPostToComments && !posted && (
          <Button
            onClick={handlePost}
            disabled={isPosting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {isPosting
              ? (isRo ? 'Se postează...' : 'Posting...')
              : (isRo ? 'Distribuie declarația în comunitate' : 'Share declaration to community')}
          </Button>
        )}

        {/* Posted confirmation */}
        {posted && (
          <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              {isRo ? 'Declarația ta a fost distribuită în comunitate!' : 'Your declaration has been shared!'}
            </span>
          </div>
        )}

        {/* Edit Button */}
        {onEdit && (
          <Button
            variant="outline"
            onClick={onEdit}
            className="w-full"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isRo ? 'Editează Declarația' : 'Edit Declaration'}
          </Button>
        )}
      </div>

      {/* Encouragement message */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs text-muted-foreground text-center">
          {isRo
            ? '💡 Citește această declarație în fiecare dimineață și seară pentru a-ți întări viziunea!'
            : '💡 Read this declaration every morning and evening to strengthen your vision!'}
        </p>
      </div>
    </Card>
  );
};
