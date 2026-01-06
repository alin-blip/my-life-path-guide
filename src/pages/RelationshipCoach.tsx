import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { RelationshipCoachChat } from '@/components/ai/RelationshipCoachChat';

const RelationshipCoach = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-pink-500/30 bg-gradient-to-br from-pink-950/20 to-background">
          <CardHeader className="border-b border-pink-500/20">
            <CardTitle className="flex items-center gap-3 text-pink-100">
              <div className="p-2 rounded-lg bg-pink-500/20">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              Relationship Coach
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Îmbunătățește-ți relațiile cu cei dragi prin comunicare eficientă și înțelegere
            </p>
          </CardHeader>
          <CardContent className="p-0 h-[70vh]">
            <RelationshipCoachChat />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RelationshipCoach;
