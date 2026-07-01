import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, CheckCircle2, XCircle, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
import { parentingService, getAgeContext, ParentingChild, EvidenceSource, AgeContext } from '@/services/parentingService';
import { useParentingProfile } from '@/hooks/useParenting';

// Content per age band — bilingual, evidence-based only
const AGE_BAND_CONTENT: Record<AgeContext['ageBand'], {
  works: { ro: string; en: string; source?: string }[];
  harms: { ro: string; en: string; source?: string }[];
  actions: { ro: string; en: string }[];
}> = {
  '0-2': {
    works: [
      { ro: 'Serve-and-return: răspunzi consistent la sunete, priviri, gesturi. Construiește arhitectura creierului.', en: 'Serve-and-return: consistent response to sounds, gaze, gestures. Builds brain architecture.', source: 'harvard-serve-return' },
      { ro: 'Rutine predictibile (mâncare, somn) → încredere = fundamentul întregii vieți emoționale.', en: 'Predictable routines (feeding, sleep) → trust = foundation of all future emotional life.', source: 'erikson-1963' },
      { ro: 'Narezi ce faci ("te iau în brațe acum") — pornește semantica.', en: 'Narrate actions ("I am picking you up") — bootstraps semantic memory.', source: 'piaget-1952' },
      { ro: 'Reparare după rupture: dizadele sunt necoordonate 70% din timp — reparările construiesc reziliența.', en: 'Repair after rupture: dyads are miscoordinated 70% of the time — repairs build resilience.', source: 'tronick-1989' },
    ],
    harms: [
      { ro: 'Îngrijire inconsistentă sau neresponsivă → semnalele bebelușului că lumea nu e sigură.', en: 'Inconsistent or unresponsive caregiving → signals to baby that world is unsafe.', source: 'harvard-neglect-2012' },
      { ro: 'Expunere pasivă la ecrane sub 18 luni (exceptând video-chat).', en: 'Passive screen exposure under 18 months (except video-chat).', source: 'aap-2016' },
      { ro: 'Stres cronic al părintelui neregulat → bebelușul absorbă dysregularea (cortizol crescut).', en: "Parent's unregulated chronic stress → baby absorbs dysregulation (raised cortisol).", source: 'shonkoff-2012' },
    ],
    actions: [
      { ro: '30 sec de contact vizual fără telefon când îl iei în brațe.', en: '30 sec eye contact, no phone, when you pick them up.' },
      { ro: 'Când te enervezi, IEȘI 60 secunde din cameră înainte să interacționezi.', en: 'When triggered, LEAVE the room for 60 seconds before interacting.' },
      { ro: 'La finalul zilei: 1 minut de povești mici — vocea ta e coloană sonoră.', en: 'End of day: 1 min of small stories — your voice is the soundtrack.' },
    ],
  },
  '2-7': {
    works: [
      { ro: 'Joc simbolic și povești fantastice — copilul gândește magic, nu logic.', en: 'Symbolic play and fantasy stories — child thinks magically, not logically.', source: 'piaget-1952' },
      { ro: 'Îl lași să facă (îmbrăcat, ales mâncare între 2 opțiuni) → autonomie sănătoasă.', en: 'Let them do (dress themselves, choose between 2 options) → healthy autonomy.', source: 'erikson-1963' },
      { ro: 'Emotion coaching (Gottman 5 pași): validezi emoția → pui limita comportamentală.', en: 'Emotion coaching (Gottman 5 steps): validate emotion → then set behavioral limit.', source: 'gottman-1997' },
      { ro: 'Fereastră critică funcție executivă (3-5 ani): joc de rol, jocuri cu reguli, activitate fizică.', en: 'Critical window for executive function (3-5): pretend play, rule-based games, physical activity.', source: 'harvard-ef-2011' },
    ],
    harms: [
      { ro: 'Ceri explicații logice ("de ce ai făcut asta?") — creierul nu are hardware încă.', en: 'Demanding logical explanations ("why did you do this?") — brain lacks the hardware.', source: 'piaget-1952' },
      { ro: '„Nu plânge!" (dismissing) — copiii cu părinți emotion-dismissing au cortizol crescut.', en: '"Stop crying!" (dismissing) — children of dismissing parents show elevated cortisol.', source: 'gottman-1997' },
      { ro: 'Rușinarea greșelilor de inițiativă → vină internalizată ca default.', en: 'Shaming mistakes of initiative → guilt internalized as default.', source: 'erikson-1963' },
      { ro: 'Ecrane peste 1 oră/zi de conținut non-interactiv (2-5 ani).', en: 'More than 1 hour/day of non-interactive screens (2-5 y).', source: 'aap-2016' },
    ],
    actions: [
      { ro: 'Când plânge: „Văd că ești foarte supărat. E în regulă să simți asta." (etichetezi înainte să corectezi).', en: 'When crying: "I see you\'re very upset. It\'s ok to feel this." (label before correcting).' },
      { ro: 'Oferă 2 opțiuni în loc de comandă: „Vrei să te îmbraci acum sau după micul dejun?"', en: 'Offer 2 options instead of a command: "Do you want to dress now or after breakfast?"' },
      { ro: '15 minute joc condus de copil, fără telefon — el hotărăște ce jucați.', en: '15 min child-led play, no phone — they choose what you play.' },
    ],
  },
  '7-11': {
    works: [
      { ro: 'Explici motivele regulilor — creierul poate procesa acum și crește complianța.', en: 'Explain reasons behind rules — brain can process, and compliance increases.', source: 'piaget-1952' },
      { ro: 'Laudi efortul, nu doar rezultatul → construiești sârguința, nu inferioritatea.', en: 'Praise effort, not only outcomes → build industry, not inferiority.', source: 'erikson-1963' },
      { ro: 'Sarcini reale în casă cu responsabilitate → competență + apartenență.', en: 'Real household tasks with responsibility → competence + belonging.', source: 'lamborn-1991' },
      { ro: 'Reguli clare + căldură + autonomie (stil authoritative) → cele mai bune rezultate empirice.', en: 'Clear rules + warmth + autonomy (authoritative) → best empirical outcomes.', source: 'steinberg-1992' },
    ],
    harms: [
      { ro: '„Bine, dar puteai mai bine" — construiește credința internă „nu sunt destul de bun".', en: '"Good, but you could do better" — builds the internal belief "I am not enough".', source: 'assor-2009' },
      { ro: 'Iubire condiționată de performanță → performanță compulsivă la 30 ani, nu motivație sănătoasă.', en: 'Love conditional on performance → compulsive performing at 30, not healthy motivation.', source: 'assor-roth-deci-2004' },
      { ro: 'Critică frecventă + control excesiv — predictor puternic al anxietății copilului (r=.33).', en: 'Frequent criticism + overcontrol — strong predictor of child anxiety (r=.33).', source: 'mcleod-2007' },
      { ro: 'Compararea cu alți copii („uite ce face vecinul") → rușine + resentiment.', en: 'Comparison with other children → shame + resentment.', source: 'haines-2023' },
    ],
    actions: [
      { ro: 'Ratio 5:1 (euristică Gottman, adaptată): pentru fiecare corectură, 5 observații pozitive concrete.', en: '5:1 ratio (Gottman heuristic, adapted): for every correction, 5 concrete positive observations.' },
      { ro: 'Când vrei să adaugi „...dar", oprește-te. Doar aprecierea, punct.', en: 'When you want to add "...but", stop. Just the appreciation, period.' },
      { ro: 'Când reacționezi excesiv: „Am reacționat exagerat mai devreme. Îmi pare rău." — asumarea NU te slăbește.', en: 'When you overreact: "I overreacted earlier. I\'m sorry." — owning it does NOT weaken you.' },
    ],
  },
  '12-18': {
    works: [
      { ro: 'Dialog Socratic — lasă adolescentul să conteste regulile și răspunde autentic.', en: 'Socratic dialogue — let them challenge rules and engage authentically.', source: 'piaget-1952' },
      { ro: 'Valori clare + libertate de a experimenta rolurile → identitate sănătoasă.', en: 'Clear values + freedom to experiment with roles → healthy identity.', source: 'erikson-1963' },
      { ro: 'Autonomie negociată, nu impusă — style authoritative funcționează și în adolescență.', en: 'Negotiated autonomy, not imposed — authoritative style still wins in adolescence.', source: 'lamborn-1991' },
    ],
    harms: [
      { ro: '„Un tunet în glas" pentru a închide o discuție → 5 min de obediență, ani de tăcere despre decizii mari.', en: '"Thunder in the voice" to close a discussion → 5 min of obedience, years of silence on big decisions.', source: 'steinberg-1992' },
      { ro: 'Iubire condiționată acum are cost dublu — identitatea abia se formează.', en: 'Conditional love now doubles the cost — identity is being formed.', source: 'assor-2009' },
      { ro: 'Respinger idealismului abstract → resentiment underground, nu maturizare.', en: 'Dismissing abstract idealism → underground resentment, not maturation.', source: 'piaget-1952' },
    ],
    actions: [
      { ro: '10 minute de conversație zilnică fără agenda ta — doar întrebi și asculți.', en: '10 min daily conversation with no agenda — just ask and listen.' },
      { ro: 'Când ești în dezacord: „Înțeleg de ce vezi așa. Eu văd așa. Cum rezolvăm?"', en: 'When you disagree: "I understand why you see it that way. Here\'s how I see it. How do we solve it?"' },
      { ro: 'Un „nu" cu motiv → mai puternic decât 10 „nu" cu autoritate.', en: 'One "no" with reason → stronger than 10 "no"s with authority.' },
    ],
  },
};

const ParentingLibrary: React.FC = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { profile } = useParentingProfile();
  const lang = profile?.preferred_language || 'ro';

  const [child, setChild] = useState<ParentingChild | null>(null);
  const [sources, setSources] = useState<EvidenceSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [c, s] = await Promise.all([
          childId ? parentingService.getChild(childId) : Promise.resolve(null),
          parentingService.listEvidenceSources(),
        ]);
        setChild(c);
        setSources(s);
      } finally { setLoading(false); }
    })();
  }, [childId]);

  if (loading) {
    return <Layout><div className="p-6 text-sm text-muted-foreground">Loading...</div></Layout>;
  }

  // General library mode (no childId)
  if (!childId || !child) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              {lang === 'en' ? 'Evidence Library' : 'Biblioteca de Surse'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {lang === 'en'
                ? 'Every claim in this module is backed by peer-reviewed research. Here is the full bibliography.'
                : 'Fiecare afirmație din acest modul este susținută de cercetare peer-review. Aici e bibliografia completă.'}
            </p>
          </div>
          <SourcesList sources={sources} lang={lang} />
        </div>
      </Layout>
    );
  }

  const ctx = getAgeContext(child.birth_year, child.birth_month);
  const content = AGE_BAND_CONTENT[ctx.ageBand];
  const sourceMap = new Map(sources.map((s) => [s.slug, s]));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/parenting')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Back' : 'Înapoi'}
        </Button>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{child.name}</h1>
            <Badge>{ctx.age} {lang === 'en' ? 'years' : 'ani'}</Badge>
            <Badge variant="outline">{ctx.ageBand}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="font-semibold text-primary">Piaget:</span> {ctx.piagetLabel[lang]}
            {' · '}
            <span className="font-semibold text-primary">Erikson:</span> {ctx.eriksonLabel[lang]}
          </p>
        </div>

        {/* Pseudoscience alert if 0-7 */}
        {(ctx.ageBand === '0-2' || ctx.ageBand === '2-7') && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {lang === 'en' ? 'Honest science note' : 'Notă științifică onestă'}
                </p>
                <p className="text-muted-foreground mt-1">
                  {lang === 'en'
                    ? 'Ages 0-7 are a maximum plasticity window (Harvard CDev) — children absorb the caregiver\'s emotional state at high fidelity. We DO NOT use popular "0-7 = hypnosis at 7Hz theta" framing — that is Bruce Lipton pseudoscience without peer-review support.'
                    : 'Vârsta 0-7 e o fereastră de plasticitate maximă (Harvard CDev) — copilul absoarbe cu fidelitate starea emoțională a părintelui. NU folosim framing-ul popular „0-7 = hipnoză la 7Hz theta" — e pseudoștiință Bruce Lipton fără suport peer-review.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              {lang === 'en' ? 'What works at this age' : 'Ce funcționează la această vârstă'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {content.works.map((w, i) => (
                <li key={i} className="text-sm">
                  <p>{w[lang]}</p>
                  {w.source && sourceMap.has(w.source) && (
                    <SourceChip src={sourceMap.get(w.source)!} lang={lang} />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* What harms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <XCircle className="w-5 h-5 text-destructive" />
              {lang === 'en' ? 'What harms at this age' : 'Ce dăunează la această vârstă'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {content.harms.map((h, i) => (
                <li key={i} className="text-sm">
                  <p>{h[lang]}</p>
                  {h.source && sourceMap.has(h.source) && (
                    <SourceChip src={sourceMap.get(h.source)!} lang={lang} />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Concrete actions today */}
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">
              {lang === 'en' ? '3 actions you can do today' : '3 acțiuni pe care le poți face azi'}
            </CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Under 10 minutes each. Small hits, daily.' : 'Sub 10 minute fiecare. Loviri mici, zilnic.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 list-decimal list-inside text-sm">
              {content.actions.map((a, i) => <li key={i}>{a[lang]}</li>)}
            </ol>
          </CardContent>
        </Card>

        {/* All sources for this age */}
        <Accordion type="single" collapsible>
          <AccordionItem value="sources">
            <AccordionTrigger>
              {lang === 'en' ? 'All evidence sources' : 'Toate sursele bibliografice'} ({sources.length})
            </AccordionTrigger>
            <AccordionContent>
              <SourcesList sources={sources} lang={lang} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

const SourceChip: React.FC<{ src: EvidenceSource; lang: 'ro' | 'en' }> = ({ src, lang }) => (
  <div className="mt-1 text-xs">
    {src.url ? (
      <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
        [{src.author}{src.year ? ` ${src.year}` : ''}]
        <ExternalLink className="w-3 h-3" />
      </a>
    ) : (
      <span className="text-muted-foreground">[{src.author}{src.year ? ` ${src.year}` : ''}]</span>
    )}
  </div>
);

const SourcesList: React.FC<{ sources: EvidenceSource[]; lang: 'ro' | 'en' }> = ({ sources, lang }) => (
  <div className="space-y-3">
    {sources.map((s) => (
      <div key={s.id} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold">{s.author}</span>
          {s.year && <span className="text-muted-foreground">({s.year})</span>}
          <Badge variant="outline" className="text-xs">{s.confidence}</Badge>
          {s.source_type && <Badge variant="secondary" className="text-xs">{s.source_type.replace('_', ' ')}</Badge>}
        </div>
        <p className="mt-0.5">{s.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{lang === 'en' ? s.summary_en : s.summary_ro}</p>
        {s.url && (
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline inline-flex items-center gap-0.5 mt-1">
            {lang === 'en' ? 'Source' : 'Sursa'} <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    ))}
  </div>
);

export default ParentingLibrary;
