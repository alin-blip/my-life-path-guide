
import React from 'react';
import { Layout } from '@/components/Layout';
import { AuthForm } from '@/components/AuthForm';
import SeoHead from '@/components/seo/SeoHead';
import { useLanguage } from '@/context/LanguageContext';

const Auth = () => {
  const { language } = useLanguage();
  const title = language === 'en'
    ? 'Sign in — CEO Mind OS'
    : 'Autentificare — CEO Mind OS';
  const description = language === 'en'
    ? 'Sign in or create your CEO Mind OS account to access your Founder Operating System, daily routine and AI coaches.'
    : 'Intră în cont sau creează-ți contul CEO Mind OS pentru a-ți accesa Sistemul de Operare al Fondatorului, rutina zilnică și AI Coaches.';

  return (
    <Layout>
      <SeoHead title={title} description={description} locale={language === 'en' ? 'en' : 'ro'} noindex />
      <div className="min-h-screen bg-gradient-to-b from-[#0c1023] to-[#1a2242] flex items-center justify-center p-6">
        <AuthForm />
      </div>
    </Layout>
  );
};

export default Auth;
