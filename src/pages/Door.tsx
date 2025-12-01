
import React from 'react';
import { DoorContent } from '@/components/DoorContent';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';

const DoorPage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <DoorContent />
        <Toaster />
      </div>
    </Layout>
  );
};

export default DoorPage;
