import { useRef } from "react";
import videoAsset from "@/assets/warrior-routine.mp4.asset.json";
import { useLanguage } from "@/context/LanguageContext";
import { trackEvent } from "@/lib/facebook-pixel";

interface Props {
  variant?: "light" | "dark";
  /** Where this section is rendered (e.g. "index_en", "warrior_en"). Used for analytics. */
  location?: string;
  /** Hide the section header (title + subtitle). Useful when embedding under a hero. */
  hideHeader?: boolean;
  /** Reduce vertical padding for compact placements (e.g. inside hero). */
  compact?: boolean;
}

export const WarriorRoutineVideoSection = ({ variant = "light", location = "unknown", hideHeader = false, compact = false }: Props) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const playedRef = useRef(false);
  const endedRef = useRef(false);

  const title = isEn
    ? "The Warrior Routine — 45-Minute Morning System"
    : "Rutina Războinicului — Sistem de dimineață de 45 de minute";
  const subtitle = isEn
    ? "End burnout and build days with intention. Watch how the system works."
    : "Elimină burnout-ul și construiește-ți zilele cu intenție. Vezi cum funcționează sistemul.";

  const isDark = variant === "dark";

  const handlePlay = () => {
    if (playedRef.current) return;
    playedRef.current = true;
    const payload = {
      content_name: "warrior_routine_video",
      content_category: "video",
      location,
      language,
    };
    trackEvent("VideoPlay", payload);
    console.log("[Analytics] warrior_routine_video_play", payload);
  };

  const handleEnded = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    const payload = {
      content_name: "warrior_routine_video",
      content_category: "video",
      location,
      language,
    };
    trackEvent("VideoComplete", payload);
    console.log("[Analytics] warrior_routine_video_complete", payload);
  };

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
            onPlay={handlePlay}
            onEnded={handleEnded}
          >
            <source src={videoAsset.url} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
};

export default WarriorRoutineVideoSection;
