
import React from 'react';
import { Layout } from '@/components/Layout';
import { CoreContent } from '@/components/CoreContent';

const CorePage = () => {
  return (
    <Layout>
      <div className="container mx-auto pb-8">
        <CoreContent />
      </div>
    </Layout>
  );
};

export default CorePage;
