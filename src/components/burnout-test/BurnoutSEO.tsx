import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BurnoutSEOProps {
  language: 'en' | 'ro';
}

export const BurnoutSEO: React.FC<BurnoutSEOProps> = ({ language }) => {
  const title = language === 'en'
    ? 'Free Burnout Test - 20 Questions | CEO Mind OS'
    : 'Test Burnout Gratuit - 20 Întrebări | CEO Mind OS';

  const description = language === 'en'
    ? 'Discover your burnout level in 5 minutes. 20 science-based questions across Body, Mind, Balance & Business. Free radar chart results.'
    : 'Descoperă nivelul tău de burnout în 5 minute. 20 întrebări pe Corp, Minte, Echilibru și Business. Rezultate gratuite cu grafic radar.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: title,
    description,
    educationalLevel: 'beginner',
    about: {
      '@type': 'Thing',
      name: 'Burnout Assessment',
    },
    provider: {
      '@type': 'Organization',
      name: 'CEO Mind OS',
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <link rel="canonical" href="https://my-life-path-guide.lovable.app/burnout-test" />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};
