import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FactMapsContent } from '@/components/FactMapsContent';
import { Layout } from '@/components/Layout';

const FactMaps = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') as 'foundation' | 'monthly' | 'impossible' | null;
  const highlightId = searchParams.get('highlight') || undefined;

  return (
    <Layout>
      <FactMapsContent 
        initialCategory={category || 'foundation'} 
        highlightId={highlightId} 
      />
    </Layout>
  );
};

export default FactMaps;
