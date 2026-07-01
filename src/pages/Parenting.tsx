import React from 'react';
import { Layout } from '@/components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Baby, BookOpen, Shield, Sparkles, Users, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { useParentingChildren, useParentingProfile } from '@/hooks/useParenting';
import { getAgeContext } from '@/services/parentingService';

const Parenting: React.FC = () => {
  const navigate = useNavigate();
  const { children, loading: loadingChildren } = useParentingChildren();
  const { profile } = useParentingProfile();
  const lang = profile?.preferred_language || 'ro';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Baby className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Parenting Stack</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {lang === 'en'
                  ? "The founder-parent operating system. Build your children's minds the way you build your company — with science, not guesswork."
                  : "Sistemul de operare al founder-părintelui. Construiește mintea copilului tău la fel cum construiești compania — cu știință, nu improvizație."}
              </p>
              <p className="text-sm mt-3 italic text-muted-foreground">
                {lang === 'en'
                  ? "\"We don't fix the child. We fix ourselves — the child aligns naturally.\""
                  : "„Nu reparăm copilul. Ne reparăm pe noi — copilul se așează natural.”"}
              </p>
            </div>
          </div>
        </div>

        {/* Onboarding prompt */}
        {!loadingChildren && children.length === 0 && (
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <CardTitle>{lang === 'en' ? 'Start with your child' : 'Începe cu copilul tău'}</CardTitle>
              </div>
              <CardDescription>
                {lang === 'en'
                  ? 'Add each child (birth year). The platform adapts every protocol to Piaget cognitive stage + Erikson psychosocial crisis.'
                  : 'Adaugă fiecare copil (anul nașterii). Platforma adaptează fiecare protocol la stadiul cognitiv Piaget + criza psihosocială Erikson.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/parenting/profile')} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                {lang === 'en' ? 'Add first child' : 'Adaugă primul copil'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Children cards */}
        {children.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {lang === 'en' ? 'Your children' : 'Copiii tăi'}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/parenting/profile')}>
                <Plus className="w-4 h-4 mr-1" /> {lang === 'en' ? 'Manage' : 'Gestionează'}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((c) => {
                const ctx = getAgeContext(c.birth_year, c.birth_month);
                return (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{c.name}</CardTitle>
                          <CardDescription>{ctx.age} {lang === 'en' ? 'years' : 'ani'}</CardDescription>
                        </div>
                        <Badge variant="secondary">{ctx.ageBand}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs space-y-1.5">
                        <div>
                          <span className="font-semibold text-primary">Piaget:</span>{' '}
                          <span className="text-muted-foreground">{ctx.piagetLabel[lang]}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-primary">Erikson:</span>{' '}
                          <span className="text-muted-foreground">{ctx.eriksonLabel[lang]}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/parenting/library/${c.id}`}>
                            <BookOpen className="w-3.5 h-3.5 mr-1" />
                            {lang === 'en' ? 'Library' : 'Bibliotecă'}
                          </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild>
                          <Link to={`/parenting/coach/${c.id}`}>
                            <Sparkles className="w-3.5 h-3.5 mr-1" /> Coach
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature roadmap */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/parenting/toxicity-scan')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">
                  {lang === 'en' ? 'Toxicity Scan (PSDQ)' : 'Scanare Toxicitate (PSDQ)'}
                </CardTitle>
                <Badge variant="default" className="ml-auto text-xs">{lang === 'en' ? 'Live' : 'Activ'}</Badge>
              </div>
              <CardDescription>
                {lang === 'en'
                  ? 'Baumrind style diagnosis + 6 toxic patterns (conditional love, performance-worth, "yes-but", harsh-as-preparation, dismissing, comparison).'
                  : 'Diagnoză stil Baumrind + 6 tipare toxice (iubire condiționată, „bine dar puteai mai bine”, performance-worth, duritate ca pregătire, dismissing, comparație).'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                {lang === 'en' ? 'Start 3-min scan' : 'Începe scanarea (3 min)'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/parenting/tools')}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">
                  {lang === 'en' ? 'Daily Tools' : 'Tool-uri Zilnice'}
                </CardTitle>
                <Badge variant="default" className="ml-auto text-xs">{lang === 'en' ? 'Live' : 'Activ'}</Badge>
              </div>
              <CardDescription>
                5:1 Counter · No-BUT Trainer · Emotion Coaching (Gottman 5 pași) · Repair Log (Tronick) · Serve-and-Return Streak (Harvard CDev).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" variant="outline" className="w-full">
                {lang === 'en' ? 'Open tools' : 'Deschide tool-urile'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-70">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Coach AI (Alin persona)</CardTitle>
                <Badge variant="outline" className="ml-auto text-xs">Faza 4</Badge>
              </div>
              <CardDescription>
                {lang === 'en'
                  ? 'Live sessions contextualized on child stage + detected style + timeline.'
                  : 'Sesiuni live contextualizate pe stadiul copilului + stilul detectat + timeline.'}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="opacity-70">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Timeline & Milestones</CardTitle>
                <Badge variant="outline" className="ml-auto text-xs">Faza 4</Badge>
              </div>
              <CardDescription>
                {lang === 'en'
                  ? 'Log ruptures, repairs, breakthroughs. Data belongs to you.'
                  : 'Loghezi rupturile, reparările, breakthrough-urile. Datele îți aparțin.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Evidence footer */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          {lang === 'en' ? 'Built on: ' : 'Bazat pe: '}
          Piaget (1952) · Erikson (1963) · Baumrind + Maccoby & Martin · Lamborn (1991, n=2,353) ·
          Gottman (1997) · Harvard Center on the Developing Child · Tronick (1989) · Assor, Roth & Deci (2004/2009) ·
          McLeod (2007) meta-analysis. {' '}
          <Link to="/parenting/library" className="underline">
            {lang === 'en' ? 'See all sources' : 'Vezi toate sursele'} <ArrowRight className="inline w-3 h-3" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Parenting;
