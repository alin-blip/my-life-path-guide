import { X, CheckCircle2 } from "lucide-react";

export const UniqueMechanismSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          De ce nu Notion, Asana sau Trello?
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Tool-urile clasice sunt pentru task management. RoWarrior e sistem de <span className="text-primary font-bold">War Planning pentru CEO-uri</span>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-muted to-muted/50 border-2 border-border rounded-xl p-8 shadow-md">
          <div className="flex items-center gap-2 mb-6">
            <X className="w-6 h-6 text-destructive" />
            <h3 className="text-2xl font-bold text-foreground">Tool clasic</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <span className="text-muted-foreground">Liste nesfârșite de task-uri fără prioritizare</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <span className="text-muted-foreground">Zero legătură între viziune și task-ul de azi</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <span className="text-muted-foreground">Nicio diferență între urgent și important</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <span className="text-muted-foreground">Supraîncărcare constantă, burnout garantat</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
              <span className="text-muted-foreground">Generic pentru orice industrie = ineficient pentru tine</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">RoWarrior War System</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground"><strong>1 obiectiv domino</strong> pe săptămână — focalizare maximă</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground"><strong>War Plan pe o pagină</strong> — viziune €10M → task-ul de azi</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground"><strong>1-3 task-uri high-ROI</strong> pe zi — zero time waste</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground"><strong>Coaching AI tip Hormozi</strong> pentru ofertă și preț</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-foreground"><strong>Specific pentru antreprenori €500k-€10M+</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};