
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FitnessHub } from '@/components/fitness/FitnessHub';
import { useLanguage } from '@/context/LanguageContext';

const Fitness = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold">{t('fitness')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('fitnessDescription')}
          </p>
        </header>
        
        <FitnessHub />
      </div>
    </Layout>
  );
};

export default Fitness;
