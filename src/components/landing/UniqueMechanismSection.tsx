import { Card } from "@/components/ui/card";
import { Dumbbell, Sparkles, Heart, Briefcase, Target } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/context/LanguageContext";
import { SectionLabel } from "@/components/ui/section-label";

export const UniqueMechanismSection = () => {
  const { elementRef, isVisible } = useScrollAnimation();
  const { t } = useLanguage();

  const protocols = [
    { number: "01", icon: Dumbbell, titleKey: "body", descriptionKey: "landingBodyDesc", resultKey: "landingBodyResult" },
    { number: "02", icon: Sparkles, titleKey: "being", descriptionKey: "landingBeingDesc", resultKey: "landingBeingResult" },
    { number: "03", icon: Heart, titleKey: "balance", descriptionKey: "landingBalanceDesc", resultKey: "landingBalanceResult" },
    { number: "04", icon: Briefcase, titleKey: "business", descriptionKey: "landingBusinessDesc", resultKey: "landingBusinessResult" },
    { number: "05", icon: Target, titleKey: "landingDoorTitle", descriptionKey: "landingDoorDesc", resultKey: "landingDoorResult" },
  ];

  return (
    <section
      ref={elementRef}
      className={`mb-24 transition-all duration-700 ${isVisible ? 'opacity-100 animate-fade-in-up' : 'opacity-0'}`}
    >
      <div className="text-center mb-12">
        <SectionLabel className="justify-center mb-4">Sistemul</SectionLabel>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
          {t('landing5Pillars')}
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          <span dangerouslySetInnerHTML={{
            __html: t('landing5PillarsDesc')
              .replace(/<span>/g, '<span class="text-primary font-medium">')
              .replace(/<\/span>/g, '</span>')
          }} />
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border max-w-6xl mx-auto mb-8">
        {protocols.map((protocol, index) => {
          const Icon = protocol.icon;
          return (
            <div
              key={index}
              className="bg-card p-8 hover:bg-accent/30 transition-colors duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-wider text-primary">
                  — {protocol.number}
                </span>
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.25} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{t(protocol.titleKey)}</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t(protocol.descriptionKey)}</p>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium text-primary">→ {t(protocol.resultKey)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Card className="p-8 max-w-4xl mx-auto">
        <p className="font-display text-lg text-foreground font-semibold text-center mb-2">
          {t('landingSystemTitle')}
        </p>
        <p className="text-base text-muted-foreground text-center">
          <span dangerouslySetInnerHTML={{
            __html: t('landingSystemDesc')
              .replace(/<span>/g, '<span class="text-foreground font-medium">')
              .replace(/<\/span>/g, '</span>')
          }} />
        </p>
      </Card>
    </section>
  );
};
