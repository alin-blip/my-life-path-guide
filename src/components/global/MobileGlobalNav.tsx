import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Flame, Sparkles, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { haptic } from "@/utils/hapticFeedback";

interface MobileGlobalNavProps {
  onMenuClick: () => void;
}

/**
 * Global bottom nav for authenticated mobile view.
 * 5 slots: Dashboard · Rutină · Coach · Comunitate · Meniu
 */
export const MobileGlobalNav: React.FC<MobileGlobalNavProps> = ({ onMenuClick }) => {
  const { language } = useLanguage();
  const { pathname, search } = useLocation();

  const items = [
    {
      to: "/dashboard",
      icon: Home,
      label: language === "en" ? "Home" : "Acasă",
      active: pathname === "/dashboard",
    },
    {
      to: "/champion-routine",
      icon: Flame,
      label: language === "en" ? "Routine" : "Rutină",
      active: pathname.startsWith("/champion-routine"),
    },
    {
      to: "/mind-coach",
      icon: Sparkles,
      label: "Coach",
      active: pathname.startsWith("/mind-coach") || pathname.startsWith("/coach"),
    },
    {
      to: "/programs?tab=community",
      icon: Users,
      label: language === "en" ? "Tribe" : "Trib",
      active: pathname === "/programs" && (!search.includes("tab=") || search.includes("community")),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border safe-bottom"
      aria-label="Primary mobile navigation"
    >
      <ul className="flex items-stretch justify-around h-14">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                onClick={() => haptic.light()}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full min-h-[44px] transition-colors",
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground active:bg-accent/40"
                )}
              >
                <Icon className={cn("h-5 w-5", item.active && "scale-110")} />
                <span className={cn("text-[10px] leading-none", item.active && "font-semibold")}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={() => {
              haptic.light();
              onMenuClick();
            }}
            className="w-full h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-muted-foreground active:bg-accent/40"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] leading-none">
              {language === "en" ? "Menu" : "Meniu"}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
};
