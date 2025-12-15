import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import LifebookDashboard from '@/components/lifebook/LifebookDashboard';
import LifebookSubcategoryView from '@/components/lifebook/LifebookSubcategoryView';
import LifebookChat from '@/components/lifebook/LifebookChat';

const LifebookPage: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route index element={<LifebookDashboard />} />
        <Route path=":subcategory" element={<LifebookSubcategoryView />} />
        <Route path=":subcategory/:section" element={<LifebookChat />} />
      </Routes>
    </Layout>
  );
};

export default LifebookPage;
