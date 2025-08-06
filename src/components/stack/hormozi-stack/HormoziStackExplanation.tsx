import { TrendingUp, Target, DollarSign, Zap } from 'lucide-react';

export function HormoziStackExplanation() {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <div className="flex items-start space-x-3">
        <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-foreground mb-1">Analiza Business cu Alex Hormozi</h4>
          <p>
            O conversație structurată cu principiile lui Alex Hormozi pentru a-ți identifica 
            bottleneck-urile și a genera planuri concrete de creștere business.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-foreground mb-1">Metodologie Directă</h4>
          <p>
            Întrebări tăioase despre situația ta actuală, obiective concrete și 
            identificarea rapidă a problemelor principale care îți blochează creșterea.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-foreground mb-1">Orientat pe Rezultate</h4>
          <p>
            Focus pe cifre, ROI și acțiuni măsurabile. Nu teorii, ci pași concreți 
            pe care îi poți implementa în următoarele 24-48 de ore.
          </p>
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-foreground mb-1">Acțiune Imediată</h4>
          <p>
            La final vei avea un plan concret de acțiune bazat pe răspunsurile tale, 
            care poate fi adăugat direct în Hot List pentru implementare.
          </p>
        </div>
      </div>
    </div>
  );
}