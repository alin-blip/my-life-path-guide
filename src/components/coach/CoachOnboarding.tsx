import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Users, DollarSign, TrendingUp, MessageSquare, Loader2 } from 'lucide-react';

interface CoachOnboardingProps {
  onCreateProfile: (displayName: string, bio?: string) => Promise<any>;
}

export const CoachOnboarding: React.FC<CoachOnboardingProps> = ({ onCreateProfile }) => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsLoading(true);
    await onCreateProfile(displayName.trim(), bio.trim() || undefined);
    setIsLoading(false);
  };

  const benefits = [
    {
      icon: DollarSign,
      title: '50% Recurring Commission',
      description: 'Earn 50% of every payment from clients you refer - for life!',
    },
    {
      icon: Users,
      title: 'Client Progress Tracking',
      description: 'Monitor your clients\' progress, streaks, and achievements.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Message your clients directly through the platform.',
    },
    {
      icon: TrendingUp,
      title: 'Automatic Payouts',
      description: 'Get paid automatically via Stripe Connect every week.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Become a Partner Coach
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join our coach network and earn 50% recurring commission on every client you bring to the platform.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Registration Form */}
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create Your Coach Profile</CardTitle>
          <CardDescription>
            Fill in your details to get started. You can update these anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your name or brand"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This is how clients will see you.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell potential clients about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!displayName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Create Coach Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
