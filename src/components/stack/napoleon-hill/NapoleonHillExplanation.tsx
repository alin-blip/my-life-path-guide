import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Sparkles, Users } from "lucide-react";

export const NapoleonHillExplanation: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-primary" />
            Napoleon Hill: Think and Grow Rich
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/90 leading-relaxed">
            Bine ai venit la studiul principiilor succesului din "Think and Grow Rich"! 
            Acest coaching te ghidează prin cele <strong>13 principii transformatoare</strong> ale lui Napoleon Hill,
            bazate pe analiza celor mai de succes oameni din lume.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Target className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Obiectiv Clar</h3>
                <p className="text-sm text-muted-foreground">
                  Definește exact ce vrei să obții - suma concretă sau rezultatul specific pe care îl urmărești.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Credință & Acțiune</h3>
                <p className="text-sm text-muted-foreground">
                  Transformă dorința în credință puternică și apoi în plan concret de acțiune.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Users className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Master Mind</h3>
                <p className="text-sm text-muted-foreground">
                  Formează un grup de oameni care te susțin și te ajută să crești continuu.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Brain className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Perseverență</h3>
                <p className="text-sm text-muted-foreground">
                  Depășește obstacolele și continuă să acționezi până obții rezultatul dorit.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Cum funcționează?</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>AI-ul te va ghida prin cele 13 principii ale succesului</li>
              <li>Vei răspunde la întrebări profunde despre obiectivele tale</li>
              <li>Poți folosi voce (microfon) sau text pentru răspunsuri</li>
              <li>AI-ul poate citi răspunsurile cu voce tare (buton TTS)</li>
              <li>La final, vei defini o acțiune concretă pentru astăzi</li>
              <li>Întreaga conversație se salvează automat în biblioteca ta</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📚 Încarcă cartea pentru referință</h3>
            <p className="text-sm text-muted-foreground">
              Poți încărca PDF-ul cărții "Think and Grow Rich" sau notițele tale pentru ca AI-ul 
              să folosească conținutul ca referință în timpul conversației.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
