
import React from 'react';
import { Layout } from '@/components/Layout';
import { SecureAdminPanel } from '@/components/SecureAdminPanel';

const AdminPage = () => {
  return (
    <Layout>
      <SecureAdminPanel />
    </Layout>
  );
};

export default AdminPage;
