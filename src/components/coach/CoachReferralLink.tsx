import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2, Check, QrCode } from 'lucide-react';

interface CoachReferralLinkProps {
  referralLink: string;
  referralCode: string;
  onCopy: () => void;
}

export const CoachReferralLink: React.FC<CoachReferralLinkProps> = ({
  referralLink,
  referralCode,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Napoleon Hill Academy',
          text: 'Become the best version of yourself with Napoleon Hill Academy!',
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Your Referral Link
        </CardTitle>
        <CardDescription>
          Share this link with potential clients. You earn 50% commission on every payment they make!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="font-mono text-sm bg-background"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {navigator.share && (
            <Button
              variant="default"
              size="icon"
              onClick={handleShare}
              className="shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-sm">
            <span className="text-muted-foreground">Your code: </span>
            <span className="font-mono font-semibold text-primary">{referralCode}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            50% recurring commission
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
