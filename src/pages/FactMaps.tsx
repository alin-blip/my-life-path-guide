import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { RealityMapQuiz, RealityMapDashboard } from '@/components/reality-map';
import { getRealityMapScores, saveRealityMapScores } from '@/services/realityMapService';
import { WarriorPowerScores } from '@/data/warriorPowerQuestions';
import { Loader2 } from 'lucide-react';

const FactMaps = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<WarriorPowerScores | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    setIsLoading(true);
    try {
      const existingScores = await getRealityMapScores();
      if (existingScores && hasValidScores(existingScores)) {
        setScores(existingScores);
        setShowQuiz(false);
      } else {
        setShowQuiz(true);
      }
    } catch (error) {
      console.error('Error loading scores:', error);
      setShowQuiz(true);
    } finally {
      setIsLoading(false);
    }
  };

  const hasValidScores = (scores: WarriorPowerScores): boolean => {
    // Check if at least one score exists and is greater than 0
    return Object.values(scores).some(score => typeof score === 'number' && score > 0);
  };

  const handleQuizComplete = async (newScores: WarriorPowerScores) => {
    setScores(newScores);
    setShowQuiz(false);
    await saveRealityMapScores(newScores);
  };

  const handleReevaluate = (dimension?: string) => {
    // For now, restart the full quiz
    // In future, could filter to specific dimension
    setShowQuiz(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Se încarcă Harta Realității...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {showQuiz ? (
        <RealityMapQuiz 
          onComplete={handleQuizComplete}
          existingScores={scores || undefined}
        />
      ) : scores ? (
        <RealityMapDashboard 
          scores={scores}
          onReevaluate={handleReevaluate}
        />
      ) : (
        <RealityMapQuiz 
          onComplete={handleQuizComplete}
        />
      )}
    </Layout>
  );
};

export default FactMaps;
