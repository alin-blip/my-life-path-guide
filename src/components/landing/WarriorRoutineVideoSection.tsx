import videoAsset from "@/assets/warrior-routine.mp4.asset.json";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  variant?: "light" | "dark";
}

export const WarriorRoutineVideoSection = ({ variant = "light" }: Props) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const title = isEn
    ? "The Warrior Routine — 45-Minute Morning System"
    : "Rutina Războinicului — Sistem de dimineață de 45 de minute";
  const subtitle = isEn
    ? "End burnout and build days with intention. Watch how the system works."
    : "Elimină burnout-ul și construiește-ți zilele cu intenție. Vezi cum funcționează sistemul.";

  const isDark = variant === "dark";

  return (
    <section
      className={`py-16 md:py-24 ${
        isDark ? "" : "bg-background"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-10 space-y-3">
          <h2
            className={`text-3xl md:text-5xl font-bold ${
              isDark ? "text-white" : "text-foreground"
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-base md:text-lg ${
              isDark ? "text-white/70" : "text-muted-foreground"
            } max-w-2xl mx-auto`}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl ${
            isDark
              ? "ring-1 ring-[#D4A84A]/30"
              : "ring-1 ring-border"
          }`}
        >
          <video
            className="w-full h-auto block"
            controls
            preload="metadata"
            playsInline
          >
            <source src={videoAsset.url} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
};

export default WarriorRoutineVideoSection;
