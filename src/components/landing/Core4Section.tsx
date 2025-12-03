import { Card } from "@/components/ui/card";
import { Heart, Brain, Scale, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export const Core4Section = () => {
  const { elementRef, isVisible } = useScrollAnimation();

  const coreAreas = [
    {
      icon: Heart,
      title: "Corp",
      color: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Energie, sănătate, vitalitate",
      details: "Un corp plin de energie devine claritate în decizii și rezistență în negocieri. Fără sănătate, nimic altceva nu contează.",
      feeds: "Energie → Claritate mentală → Forță în relații → Rezistență în business"
    },
    {
      icon: Brain,
      title: "Ființă (Spirit)",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Credință, sens, pace interioară",
      details: "Pacea interioară vede oportunitățile invizibile altora. Claritatea spirituală susține relațiile și ghidează deciziile de business.",
      feeds: "Claritate → Decizii înțelepte → Relații autentice → Business cu scop"
    },
    {
      icon: Scale,
      title: "Echilibru (Relații)",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Familie, partener, prieteni",
      details: "Suportul din relații îți dă curajul să riști în business. Rețeaua ta deschide uși. Familia îți dă motivația să continui.",
      feeds: "Suport → Curaj → Rețea → Oportunități de business"
    },
    {
      icon: TrendingUp,
      title: "Afaceri (Bani)",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Libertate financiară, impact, moștenire",
      details: "Resursele din business îți cumpără timp pentru corp, liniște pentru spirit și experiențe pentru familie. Banii amplifică celelalte arii.",
      feeds: "Resurse → Timp liber → Sănătate mai bună → Relații mai profunde"
    }
  ];

  return (
    <section 
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${
        isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'
      }`}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Cele 4 Arii ale Vieții
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Adevărata bogăție înseamnă abundență în TOATE ariile — nu doar una pe costul celorlalte
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {coreAreas.map((area, index) => {
          const Icon = area.icon;
          return (
            <Card 
              key={index}
              className={`${area.bgColor} border-2 ${area.borderColor} p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.03] hover:-translate-y-2 cursor-pointer group`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`${area.bgColor} p-3 rounded-lg border ${area.borderColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`h-8 w-8 ${area.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{area.title}</h3>
                  <p className={`text-sm font-semibold ${area.color}`}>{area.description}</p>
                </div>
              </div>
              <p className="text-base text-slate-600 leading-relaxed mb-3">
                {area.details}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Zap className="h-4 w-4" />
                <span className="text-xs">{area.feeds}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Ciclul Virtuos - Visual Diagram */}
      <div className="max-w-5xl mx-auto mt-16 mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-6">
          Ciclul Virtuos: Cum Se Alimentează Reciproc Cele 4 Arii
        </h3>
        <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
          Nu construiești 4 lucruri separate. Construiești un singur motor cu 4 cilindri care se alimentează reciproc.
        </p>

        <div className="relative">
          {/* Circular Flow Diagram */}
          <div className="grid grid-cols-2 gap-8 md:gap-12 max-w-3xl mx-auto relative">
            {/* Center Connection Visualization */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 animate-pulse" />
            </div>

            {/* Corp - Top Left */}
            <Card className="relative bg-red-50 border-2 border-red-200 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-red-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <Heart className="h-8 w-8 text-red-500 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-xl font-bold text-slate-900">Corp</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Energie fizică → Claritate mentală → Rezistență în provocări
              </p>
              <ArrowRight className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse hidden md:block" />
            </Card>

            {/* Spirit - Top Right */}
            <Card className="relative bg-purple-50 border-2 border-purple-200 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="h-8 w-8 text-purple-500 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-xl font-bold text-slate-900">Spirit</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pace interioară → Decizii înțelepte → Scop clar în acțiuni
              </p>
              <ArrowRight className="absolute left-1/2 -bottom-4 -translate-x-1/2 rotate-90 h-8 w-8 text-primary animate-pulse hidden md:block" />
            </Card>

            {/* Relații - Bottom Left */}
            <Card className="relative bg-blue-50 border-2 border-blue-200 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <Scale className="h-8 w-8 text-blue-500 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-xl font-bold text-slate-900">Relații</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Suport emoțional → Curaj să riști → Rețea de oportunități
              </p>
              <ArrowRight className="absolute left-1/2 -top-4 -translate-x-1/2 -rotate-90 h-8 w-8 text-primary animate-pulse hidden md:block" />
            </Card>

            {/* Business - Bottom Right */}
            <Card className="relative bg-green-50 border-2 border-green-200 p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-green-200/50 hover:-translate-y-1 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-8 w-8 text-green-500 transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                <h4 className="text-xl font-bold text-slate-900">Business</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Resurse financiare → Timp liber → Investiție în celelalte arii
              </p>
              <ArrowRight className="absolute -left-4 top-1/2 -translate-y-1/2 rotate-180 h-8 w-8 text-primary animate-pulse hidden md:block" />
            </Card>
          </div>

          {/* Flow Description */}
          <div className="mt-12 text-center max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 border-2 border-primary/30 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-primary animate-pulse" />
                <h4 className="text-xl md:text-2xl font-bold text-slate-900">
                  Efectul Multiplicator
                </h4>
              </div>
              <p className="text-base md:text-lg text-slate-700 leading-relaxed mb-4">
                <span className="font-bold text-red-500">Când Corp crește</span>, ai mai multă energie pentru Spirit și Business. 
                <span className="font-bold text-purple-500"> Când Spirit este puternic</span>, iei decizii mai bune în Business și Relații. 
                <span className="font-bold text-blue-500"> Când Relațiile sunt solide</span>, ai curajul să riști în Business și pacea să te odihnești. 
                <span className="font-bold text-green-500"> Când Business merge bine</span>, ai resurse pentru sănătate, timp pentru familie și liniște pentru spirit.
              </p>
              <p className="text-lg font-bold text-slate-900">
                Nu alegi între arii — le construiești simultan. Când una crește, toate cresc. 
                <span className="text-primary"> Asta e diferența RoWarrior.</span>
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/40 p-8 max-w-4xl mx-auto mt-8 shadow-lg">
        <p className="text-lg text-slate-900 font-bold text-center mb-3">
          🎯 Filosofia RoWarrior: Progres SIMULTAN în toate cele 4 arii
        </p>
        <p className="text-base text-slate-600 text-center leading-relaxed">
          <span className="text-slate-900 font-semibold">Nu sacrifici corpul pentru bani.</span> Nu sacrifici familia pentru succes. 
          Nu sacrifici spiritualitatea pentru productivitate. <span className="text-primary font-bold">Construiești totul în același timp</span> — 
          echilibrat, sustenabil, de durată. Pentru că adevăratul războinic nu alege între arii — le câștigă pe toate patru.
        </p>
      </Card>
    </section>
  );
};
