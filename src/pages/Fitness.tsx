
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FitnessHub } from '@/components/fitness/FitnessHub';
import { useLanguage } from '@/context/LanguageContext';

const Fitness = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="space-y-3 sm:space-y-6 px-2 sm:px-4">
        <header>
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold">{t('fitness')}</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            {t('fitnessDescription')}
          </p>
        </header>
        
        <FitnessHub />
      </div>
    </Layout>
  );
};

export default Fitness;
