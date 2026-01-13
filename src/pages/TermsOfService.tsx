import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, CreditCard, AlertTriangle, Scale, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const TermsOfService = () => {
  const { language } = useLanguage();
  const lastUpdated = '2026-01-13';

  const sections = language === 'en' ? [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: FileText,
      content: `By accessing or using Jump to Freedom ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant that you are at least 18 years of age.`
    },
    {
      id: 'services',
      title: '2. Description of Services',
      icon: Shield,
      content: `Jump to Freedom is a personal development and productivity platform that provides:
• Goal setting and tracking tools
• Morning routine and habit tracking
• AI-powered coaching and insights
• Vision board creation
• Voice recording and transcription features
• Progress analytics and reporting

We reserve the right to modify, suspend, or discontinue any part of the Platform at any time without prior notice.`
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      icon: Shield,
      content: `When you create an account, you agree to:
• Provide accurate and complete information
• Maintain the security of your password
• Notify us immediately of any unauthorized access
• Accept responsibility for all activities under your account

We may suspend or terminate accounts that violate these terms or engage in fraudulent, illegal, or harmful activities.`
    },
    {
      id: 'payments',
      title: '4. Payments and Subscriptions',
      icon: CreditCard,
      content: `Payments are processed securely through Stripe. By subscribing to paid features:
• You authorize recurring charges to your payment method
• Subscription renewals are automatic unless cancelled
• Refunds are handled on a case-by-case basis
• Prices may change with 30 days notice to existing subscribers

You can cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period.`
    },
    {
      id: 'content',
      title: '5. User Content',
      icon: FileText,
      content: `You retain ownership of content you create on the Platform (goals, notes, recordings). By using the Platform, you grant us a limited license to store and process your content solely to provide the services.

Voice recordings are stored securely and can be deleted at any time through your account settings. We do not share your personal content with third parties except as necessary to provide the services.`
    },
    {
      id: 'ai',
      title: '6. AI-Generated Content',
      icon: AlertTriangle,
      content: `The Platform uses artificial intelligence to provide coaching suggestions, insights, and generated content. This AI-generated content:
• Is provided for informational purposes only
• Should not replace professional medical, psychological, or financial advice
• May contain errors or inaccuracies
• Is not a substitute for human judgment

You acknowledge that AI features are tools to assist your personal development, not authoritative guidance.`
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      icon: Scale,
      content: `To the maximum extent permitted by law:
• The Platform is provided "as is" without warranties
• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to the amount paid for the services in the past 12 months
• We are not responsible for decisions made based on Platform content

The Platform is a tool for personal development and does not guarantee specific results.`
    },
    {
      id: 'termination',
      title: '8. Termination',
      icon: AlertTriangle,
      content: `We reserve the right to suspend or terminate your account if you:
• Violate these Terms of Service
• Engage in fraudulent or illegal activities
• Abuse the Platform or other users
• Attempt to circumvent security measures

Upon termination, you may request export of your data within 30 days. After this period, your data may be permanently deleted.`
    },
    {
      id: 'changes',
      title: '9. Changes to Terms',
      icon: FileText,
      content: `We may update these Terms of Service from time to time. We will notify you of material changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the new terms.`
    },
    {
      id: 'contact',
      title: '10. Contact Information',
      icon: Mail,
      content: `For questions about these Terms of Service, please contact us at:
• Email: support@jumptofreedom.ro
• Support Page: /support

We aim to respond to all inquiries within 48 hours.`
    }
  ] : [
    {
      id: 'acceptance',
      title: '1. Acceptarea Termenilor',
      icon: FileText,
      content: `Prin accesarea sau utilizarea Jump to Freedom ("Platforma"), ești de acord să respecți acești Termeni și Condiții. Dacă nu ești de acord cu acești termeni, te rugăm să nu folosești serviciile noastre.

Trebuie să ai cel puțin 18 ani pentru a utiliza această Platformă. Prin utilizarea Platformei, declari și garantezi că ai cel puțin 18 ani.`
    },
    {
      id: 'services',
      title: '2. Descrierea Serviciilor',
      icon: Shield,
      content: `Jump to Freedom este o platformă de dezvoltare personală și productivitate care oferă:
• Instrumente de stabilire și urmărire a obiectivelor
• Rutină de dimineață și urmărire a obiceiurilor
• Coaching și insight-uri bazate pe AI
• Creare de vision board
• Înregistrare vocală și transcriere
• Analiză și raportare a progresului

Ne rezervăm dreptul de a modifica, suspenda sau întrerupe orice parte a Platformei în orice moment fără notificare prealabilă.`
    },
    {
      id: 'accounts',
      title: '3. Conturile Utilizatorilor',
      icon: Shield,
      content: `Când îți creezi un cont, ești de acord să:
• Oferi informații corecte și complete
• Menții securitatea parolei tale
• Ne notifici imediat despre orice acces neautorizat
• Accepți responsabilitatea pentru toate activitățile din contul tău

Putem suspenda sau înceta conturile care încalcă acești termeni sau se angajează în activități frauduloase, ilegale sau dăunătoare.`
    },
    {
      id: 'payments',
      title: '4. Plăți și Abonamente',
      icon: CreditCard,
      content: `Plățile sunt procesate securizat prin Stripe. Prin abonarea la funcțiile plătite:
• Autorizezi taxe recurente pe metoda ta de plată
• Reînnoirile abonamentelor sunt automate dacă nu sunt anulate
• Rambursările sunt gestionate de la caz la caz
• Prețurile se pot modifica cu 30 de zile notificare pentru abonații existenți

Poți anula abonamentul în orice moment din setările contului. Anularea intră în vigoare la sfârșitul perioadei curente de facturare.`
    },
    {
      id: 'content',
      title: '5. Conținutul Utilizatorului',
      icon: FileText,
      content: `Păstrezi proprietatea asupra conținutului pe care îl creezi pe Platformă (obiective, note, înregistrări). Prin utilizarea Platformei, ne acorzi o licență limitată pentru a stoca și procesa conținutul tău exclusiv pentru a furniza serviciile.

Înregistrările vocale sunt stocate securizat și pot fi șterse în orice moment din setările contului. Nu partajăm conținutul tău personal cu terți, cu excepția cazurilor necesare pentru furnizarea serviciilor.`
    },
    {
      id: 'ai',
      title: '6. Conținut Generat de AI',
      icon: AlertTriangle,
      content: `Platforma utilizează inteligență artificială pentru a oferi sugestii de coaching, insight-uri și conținut generat. Acest conținut generat de AI:
• Este furnizat doar în scop informativ
• Nu ar trebui să înlocuiască sfatul medical, psihologic sau financiar profesional
• Poate conține erori sau inexactități
• Nu este un substitut pentru judecata umană

Recunoști că funcțiile AI sunt instrumente care îți asistă dezvoltarea personală, nu îndrumare autoritară.`
    },
    {
      id: 'liability',
      title: '7. Limitarea Răspunderii',
      icon: Scale,
      content: `În măsura maximă permisă de lege:
• Platforma este furnizată "așa cum este" fără garanții
• Nu suntem răspunzători pentru daune indirecte, incidentale sau consecvente
• Răspunderea noastră totală este limitată la suma plătită pentru servicii în ultimele 12 luni
• Nu suntem responsabili pentru deciziile luate pe baza conținutului Platformei

Platforma este un instrument pentru dezvoltare personală și nu garantează rezultate specifice.`
    },
    {
      id: 'termination',
      title: '8. Încetarea',
      icon: AlertTriangle,
      content: `Ne rezervăm dreptul de a suspenda sau înceta contul tău dacă:
• Încalci acești Termeni și Condiții
• Te angajezi în activități frauduloase sau ilegale
• Abuzezi de Platformă sau de alți utilizatori
• Încerci să ocolești măsurile de securitate

La încetare, poți solicita exportul datelor tale în termen de 30 de zile. După această perioadă, datele tale pot fi șterse permanent.`
    },
    {
      id: 'changes',
      title: '9. Modificări ale Termenilor',
      icon: FileText,
      content: `Putem actualiza acești Termeni și Condiții din când în când. Te vom notifica despre modificări materiale prin email sau prin Platformă. Utilizarea continuă a Platformei după modificări constituie acceptarea noilor termeni.`
    },
    {
      id: 'contact',
      title: '10. Informații de Contact',
      icon: Mail,
      content: `Pentru întrebări despre acești Termeni și Condiții, te rugăm să ne contactezi la:
• Email: support@jumptofreedom.ro
• Pagina de Suport: /support

Ne propunem să răspundem la toate solicitările în termen de 48 de ore.`
    }
  ];

  return (
    <>
      <Helmet>
        <title>{language === 'en' ? 'Terms of Service | Jump to Freedom' : 'Termeni și Condiții | Jump to Freedom'}</title>
        <meta name="description" content={language === 'en' ? 'Terms of Service for Jump to Freedom personal development platform' : 'Termeni și Condiții pentru platforma de dezvoltare personală Jump to Freedom'} />
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
              {language === 'en' ? 'Terms of Service' : 'Termeni și Condiții'}
            </h1>
            
            <p className="text-muted-foreground">
              {language === 'en' ? `Last updated: ${lastUpdated}` : `Ultima actualizare: ${lastUpdated}`}
            </p>
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
                <div className="text-muted-foreground whitespace-pre-line leading-relaxed pl-12">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-6 justify-center text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                {language === 'en' ? 'Privacy Policy' : 'Politica de Confidențialitate'}
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

export default TermsOfService;
