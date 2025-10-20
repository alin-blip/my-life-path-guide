
import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Target, BarChart3, BookOpen, TrendingUp } from "lucide-react";

const Business: React.FC = () => {
  useEffect(() => {
    document.title = "RoWarrior – Secțiunea Business";
  }, []);

  return (
    <Layout>
      <main className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Business</h1>
          <p className="text-muted-foreground mt-2">Claritate. Ofertă. Execuție. KPI. Tot ce ai nevoie ca să crești profitabil.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <CardTitle className="text-white">Oferta Ta de Profit</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Clarifică produsul, promisiunea și prețul cu Coaching AI în stil Hormozi.</p>
              <Link to="/stack?type=hormozi-coaching">
                <Button>Deschide Coaching AI</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-white">Analiză Platformă Hormozi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Feedback strategic brutal despre RoWarrior din perspectiva lui Alex Hormozi.</p>
              <Link to="/business/hormozi-analysis">
                <Button variant="outline">Generează Analiza</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                <CardTitle className="text-white">KPI esențiali</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Setează 3-5 indicatori care îți dictează profitul și urmărește-i săptămânal.</p>
              <Link to="/dashboard">
                <Button variant="outline">Configurează KPI</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <CardTitle className="text-white">90-Day Sprint</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Stabilește un obiectiv principal și livrabile clare pe 13 săptămâni.</p>
              <Link to="/game">
                <Button variant="outline">Începe Sprintul</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <CardTitle className="text-white">Resurse Business</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Template-uri, playbook-uri și materiale pentru implementare rapidă.</p>
              <Link to="/library">
                <Button variant="outline">Deschide Biblioteca</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </Layout>
  );
};

export default Business;
