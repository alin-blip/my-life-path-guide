import { X, CheckCircle2 } from "lucide-react";

export const UniqueMechanismSection = () => {
  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          De ce nu Notion, Asana sau Trello?
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Tool-urile clasice sunt pentru task management. RoWarrior e sistem de <span className="text-feminine-primary font-bold">War Planning pentru CEO-uri</span>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 border border-gray-700 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <X className="w-6 h-6 text-red-400" />
            <h3 className="text-2xl font-bold text-white">Tool clasic</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">Liste nesfârșite de task-uri fără prioritizare</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">Zero legătură între viziune și task-ul de azi</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">Nicio diferență între urgent și important</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">Supraîncărcare constantă, burnout garantat</span>
            </li>
            <li className="flex items-start gap-3">
              <X className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <span className="text-gray-300">Generic pentru orice industrie = ineficient pentru tine</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-feminine-primary/30 to-feminine-purple/30 border border-feminine-primary rounded-xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-6 h-6 text-feminine-primary" />
            <h3 className="text-2xl font-bold text-white">RoWarrior War System</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
              <span className="text-gray-200"><strong>1 obiectiv domino</strong> pe săptămână — focalizare maximă</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
              <span className="text-gray-200"><strong>War Plan pe o pagină</strong> — viziune €10M → task-ul de azi</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
              <span className="text-gray-200"><strong>1-3 task-uri high-ROI</strong> pe zi — zero time waste</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
              <span className="text-gray-200"><strong>Coaching AI tip Hormozi</strong> pentru ofertă și preț</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-feminine-primary mt-0.5 shrink-0" />
              <span className="text-gray-200"><strong>Specific pentru antreprenori €500k-€10M+</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};