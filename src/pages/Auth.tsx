
import React from 'react';
import { Layout } from '@/components/Layout';
import { AuthForm } from '@/components/AuthForm';

const Auth = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center p-6">
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
