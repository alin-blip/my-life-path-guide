
import React from 'react';
import { Layout } from '@/components/Layout';
import { DailyFourContent } from '@/components/DailyFourContent';

const DailyFourPage = () => {
  return (
    <Layout>
      <div className="container mx-auto pb-8">
        <DailyFourContent />
      </div>
    </Layout>
  );
};

export default DailyFourPage;
