import React from 'react';
import { Layout } from '@/components/Layout';
import { WorkoutStep } from '@/components/daily-flow/WorkoutStep';
import { useNavigate } from 'react-router-dom';

const Workout = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <WorkoutStep onComplete={handleComplete} />
      </div>
    </Layout>
  );
};

export default Workout;
