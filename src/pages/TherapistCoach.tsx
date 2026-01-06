import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import { TherapistCoachChat } from '@/components/ai/TherapistCoachChat';

const TherapistCoach = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-teal-500/30 bg-gradient-to-br from-teal-950/20 to-background">
          <CardHeader className="border-b border-teal-500/20">
            <CardTitle className="flex items-center gap-3 text-teal-100">
              <div className="p-2 rounded-lg bg-teal-500/20">
                <Brain className="h-6 w-6 text-teal-400" />
              </div>
              Therapist Coach
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Gestionează stresul, anxietatea și îmbunătățește-ți bunăstarea emoțională
            </p>
          </CardHeader>
          <CardContent className="p-0 h-[70vh]">
            <TherapistCoachChat />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TherapistCoach;
