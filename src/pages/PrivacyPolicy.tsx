import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Shield, Users, Cookie, Clock, Download, Mail, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const PrivacyPolicy = () => {
  const { language } = useLanguage();
  const lastUpdated = '2026-01-13';

  const sections = language === 'en' ? [
    {
      id: 'overview',
      title: '1. Overview',
      icon: Shield,
      content: `CEO Mind OS ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform.

This policy applies to all users of our services and complies with the General Data Protection Regulation (GDPR) and other applicable data protection laws.`
    },
    {
      id: 'data-collection',
      title: '2. Data We Collect',
      icon: Database,
      content: `We collect the following types of information:

**Account Information:**
• Email address
• Name (optional)
• Password (encrypted)

**Usage Data:**
• Goals and objectives you create
• Progress tracking data
• Habit completions
• Journal entries and notes

**Voice Recordings:**
• Audio recordings you choose to create
• Transcriptions of voice recordings

**Technical Data:**
• Device information
• Browser type
• IP address (for security purposes)
• Session information

**Payment Information:**
• Payment details are processed by Stripe and not stored on our servers
• We only receive confirmation of successful transactions`
    },
    {
      id: 'data-usage',
      title: '3. How We Use Your Data',
      icon: Users,
      content: `We use your information to:
• Provide and improve our services
• Personalize your experience
• Generate AI-powered insights and recommendations
• Process payments and manage subscriptions
• Send important service notifications
• Analyze usage patterns to improve the platform
• Ensure security and prevent fraud

We do NOT:
• Sell your personal data to third parties
• Use your data for advertising purposes
• Share your personal content with other users without consent`
    },
    {
      id: 'third-parties',
      title: '4. Third-Party Services',
      icon: Users,
      content: `We use the following third-party services to provide our platform:

**Stripe** - Payment processing
• Processes payment information securely
• Privacy Policy: https://stripe.com/privacy

**ElevenLabs** - Text-to-speech
• Converts text to audio for voice features
• Privacy Policy: https://elevenlabs.io/privacy

**Lovable Cloud (Supabase)** - Backend infrastructure
• Stores and processes your data securely
• Data is encrypted at rest and in transit

All third-party services are GDPR-compliant and bound by data processing agreements.`
    },
    {
      id: 'data-storage',
      title: '5. Data Storage and Security',
      icon: Lock,
      content: `Your data is stored securely with the following measures:
• Encryption in transit (TLS/SSL)
• Encryption at rest
• Regular security audits
• Access controls and authentication
• Secure data centers in the European Union

Voice recordings and personal content are stored in isolated, encrypted storage and are only accessible by you.`
    },
    {
      id: 'retention',
      title: '6. Data Retention',
      icon: Clock,
      content: `We retain your data as follows:
• Account data: Until you delete your account
• Usage data: Until you delete your account
• Voice recordings: Until you manually delete them
• Payment records: As required by law (typically 7 years)
• Security logs: 90 days

When you delete your account, we will delete or anonymize your personal data within 30 days, except where retention is required by law.`
    },
    {
      id: 'gdpr-rights',
      title: '7. Your GDPR Rights',
      icon: Shield,
      content: `Under GDPR, you have the following rights:

**Right of Access** - Request a copy of your personal data
**Right to Rectification** - Correct inaccurate personal data
**Right to Erasure** - Request deletion of your personal data
**Right to Restriction** - Limit how we process your data
**Right to Data Portability** - Receive your data in a portable format
**Right to Object** - Object to certain types of processing
**Right to Withdraw Consent** - Withdraw consent at any time

To exercise these rights, contact us at support@ceomindos.com`
    },
    {
      id: 'cookies',
      title: '8. Cookies and Tracking',
      icon: Cookie,
      content: `We use essential cookies for:
• Authentication and session management
• Security and fraud prevention
• Remembering your preferences

We do NOT use:
• Third-party advertising cookies
• Social media tracking pixels
• Cross-site tracking

You can manage cookies through your browser settings. Note that disabling essential cookies may affect platform functionality.`
    },
    {
      id: 'data-export',
      title: '9. Data Export',
      icon: Download,
      content: `You can export your data at any time through your account settings. Exported data includes:
• Your profile information
• Goals and objectives
• Progress data
• Notes and journal entries

Voice recordings can be downloaded individually from the platform.`
    },
    {
      id: 'contact',
      title: '10. Contact & Data Protection Officer',
      icon: Mail,
      content: `For privacy-related inquiries or to exercise your rights:

**Email:** support@ceomindos.com
**Support Page:** /support

We will respond to all privacy requests within 30 days as required by GDPR.

If you believe we have not adequately addressed your privacy concerns, you have the right to lodge a complaint with your local data protection authority.`
    }
  ] : [
    {
      id: 'overview',
      title: '1. Prezentare Generală',
      icon: Shield,
      content: `CEO Mind OS ("noi", "nouă", "nostru/noastră") se angajează să vă protejeze confidențialitatea. Această Politică de Confidențialitate explică cum colectăm, folosim, stocăm și protejăm informațiile dvs. personale când utilizați platforma noastră.

Această politică se aplică tuturor utilizatorilor serviciilor noastre și respectă Regulamentul General privind Protecția Datelor (GDPR) și alte legi aplicabile privind protecția datelor.`
    },
    {
      id: 'data-collection',
      title: '2. Datele pe Care le Colectăm',
      icon: Database,
      content: `Colectăm următoarele tipuri de informații:

**Informații despre Cont:**
• Adresa de email
• Numele (opțional)
• Parola (criptată)

**Date de Utilizare:**
• Obiectivele pe care le creezi
• Date de urmărire a progresului
• Completări de obiceiuri
• Înregistrări de jurnal și note

**Înregistrări Vocale:**
• Înregistrări audio pe care alegi să le creezi
• Transcrieri ale înregistrărilor vocale

**Date Tehnice:**
• Informații despre dispozitiv
• Tipul browserului
• Adresa IP (pentru securitate)
• Informații despre sesiune

**Informații de Plată:**
• Detaliile de plată sunt procesate de Stripe și nu sunt stocate pe serverele noastre
• Primim doar confirmarea tranzacțiilor reușite`
    },
    {
      id: 'data-usage',
      title: '3. Cum Folosim Datele Tale',
      icon: Users,
      content: `Folosim informațiile tale pentru:
• A furniza și îmbunătăți serviciile noastre
• A personaliza experiența ta
• A genera insight-uri și recomandări bazate pe AI
• A procesa plăți și gestiona abonamente
• A trimite notificări importante despre servicii
• A analiza pattern-uri de utilizare pentru îmbunătățirea platformei
• A asigura securitatea și a preveni frauda

NU facem următoarele:
• Vindem datele tale personale către terți
• Folosim datele tale în scopuri publicitare
• Partajăm conținutul tău personal cu alți utilizatori fără consimțământ`
    },
    {
      id: 'third-parties',
      title: '4. Servicii Terțe',
      icon: Users,
      content: `Folosim următoarele servicii terțe pentru a furniza platforma noastră:

**Stripe** - Procesare plăți
• Procesează informațiile de plată în mod securizat
• Politica de Confidențialitate: https://stripe.com/privacy

**ElevenLabs** - Text în vorbire
• Convertește textul în audio pentru funcțiile vocale
• Politica de Confidențialitate: https://elevenlabs.io/privacy

**Lovable Cloud (Supabase)** - Infrastructură backend
• Stochează și procesează datele tale în mod securizat
• Datele sunt criptate în repaus și în tranzit

Toate serviciile terțe sunt conforme cu GDPR și legate prin acorduri de procesare a datelor.`
    },
    {
      id: 'data-storage',
      title: '5. Stocare și Securitate a Datelor',
      icon: Lock,
      content: `Datele tale sunt stocate în siguranță cu următoarele măsuri:
• Criptare în tranzit (TLS/SSL)
• Criptare în repaus
• Audituri de securitate regulate
• Controale de acces și autentificare
• Centre de date securizate în Uniunea Europeană

Înregistrările vocale și conținutul personal sunt stocate în stocare izolată, criptată și sunt accesibile doar de către tine.`
    },
    {
      id: 'retention',
      title: '6. Retenția Datelor',
      icon: Clock,
      content: `Păstrăm datele tale astfel:
• Date de cont: Până când îți ștergi contul
• Date de utilizare: Până când îți ștergi contul
• Înregistrări vocale: Până când le ștergi manual
• Înregistrări de plată: Conform cerințelor legale (de obicei 7 ani)
• Jurnale de securitate: 90 de zile

Când îți ștergi contul, vom șterge sau anonimiza datele tale personale în termen de 30 de zile, cu excepția cazurilor în care retenția este cerută de lege.`
    },
    {
      id: 'gdpr-rights',
      title: '7. Drepturile Tale GDPR',
      icon: Shield,
      content: `Conform GDPR, ai următoarele drepturi:

**Dreptul de Acces** - Solicită o copie a datelor tale personale
**Dreptul la Rectificare** - Corectează datele personale inexacte
**Dreptul la Ștergere** - Solicită ștergerea datelor tale personale
**Dreptul la Restricție** - Limitează modul în care procesăm datele tale
**Dreptul la Portabilitatea Datelor** - Primește datele tale într-un format portabil
**Dreptul de Opoziție** - Opune-te anumitor tipuri de procesare
**Dreptul de Retragere a Consimțământului** - Retrage consimțământul în orice moment

Pentru a exercita aceste drepturi, contactează-ne la support@ceomindos.com`
    },
    {
      id: 'cookies',
      title: '8. Cookie-uri și Tracking',
      icon: Cookie,
      content: `Folosim cookie-uri esențiale pentru:
• Autentificare și gestionarea sesiunii
• Securitate și prevenirea fraudei
• Memorarea preferințelor tale

NU folosim:
• Cookie-uri de publicitate terță
• Pixeli de tracking pentru rețele sociale
• Tracking între site-uri

Poți gestiona cookie-urile prin setările browserului. Notă că dezactivarea cookie-urilor esențiale poate afecta funcționalitatea platformei.`
    },
    {
      id: 'data-export',
      title: '9. Export de Date',
      icon: Download,
      content: `Poți exporta datele tale în orice moment din setările contului. Datele exportate includ:
• Informațiile tale de profil
• Obiective
• Date de progres
• Note și înregistrări de jurnal

Înregistrările vocale pot fi descărcate individual din platformă.`
    },
    {
      id: 'contact',
      title: '10. Contact și Responsabil Protecția Datelor',
      icon: Mail,
      content: `Pentru întrebări legate de confidențialitate sau pentru a-ți exercita drepturile:

**Email:** support@ceomindos.com
**Pagina de Suport:** /support

Vom răspunde la toate solicitările de confidențialitate în termen de 30 de zile, conform cerințelor GDPR.

Dacă crezi că nu am abordat adecvat preocupările tale de confidențialitate, ai dreptul să depui o plângere la autoritatea locală pentru protecția datelor.`
    }
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Privacy Policy | CEO Mind OS' : 'Politica de Confidențialitate | CEO Mind OS'}</title>
        <meta name="description" content={language === 'en' ? 'Privacy Policy for CEO Mind OS - how we collect, use, and protect your personal data' : 'Politica de Confidențialitate pentru CEO Mind OS - cum colectăm, folosim și protejăm datele tale personale'} />
        <link rel="canonical" href={`https://ceomindos.com${typeof window !== 'undefined' ? window.location.pathname : '/privacy'}`} />
        <meta property="og:url" content={`https://ceomindos.com${typeof window !== 'undefined' ? window.location.pathname : '/privacy'}`} />
        <meta property="og:title" content={language === 'en' ? 'Privacy Policy | CEO Mind OS' : 'Politica de Confidențialitate | CEO Mind OS'} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Back to Home' : 'Înapoi la Acasă'}
            </Link>
            
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {language === 'en' ? 'Privacy Policy' : 'Politica de Confidențialitate'}
            </h1>
            
            <p className="text-muted-foreground">
              {language === 'en' ? `Last updated: ${lastUpdated}` : `Ultima actualizare: ${lastUpdated}`}
            </p>
          </div>

          {/* GDPR Badge */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-10 flex items-center gap-3">
            <Shield className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {language === 'en' ? 'GDPR Compliant' : 'Conform GDPR'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'We comply with the General Data Protection Regulation (EU) 2016/679'
                  : 'Respectăm Regulamentul General privind Protecția Datelor (UE) 2016/679'}
              </p>
            </div>
          </div>

          {/* Table of Contents */}
          <nav className="bg-muted/50 rounded-lg p-6 mb-10">
            <h2 className="font-semibold text-foreground mb-4">
              {language === 'en' ? 'Table of Contents' : 'Cuprins'}
            </h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a 
                    href={`#${section.id}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed pl-12 prose prose-sm dark:prose-invert max-w-none">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">
                {language === 'en' ? 'Terms of Service' : 'Termeni și Condiții'}
              </Link>
              <Link to="/support" className="hover:text-foreground transition-colors">
                {language === 'en' ? 'Contact Support' : 'Contact Suport'}
              </Link>
              <Link to="/" className="hover:text-foreground transition-colors">
                {language === 'en' ? 'Home' : 'Acasă'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
