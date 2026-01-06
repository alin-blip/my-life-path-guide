import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { PerformanceCoachChat } from '@/components/ai/PerformanceCoachChat';

const PerformanceCoach = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-background">
          <CardHeader className="border-b border-blue-500/20">
            <CardTitle className="flex items-center gap-3 text-blue-100">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Dumbbell className="h-6 w-6 text-blue-400" />
              </div>
              Performance Coach
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Optimizează-ți performanța fizică și mentală cu ghidare personalizată
            </p>
          </CardHeader>
          <CardContent className="p-0 h-[70vh]">
            <PerformanceCoachChat />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PerformanceCoach;
