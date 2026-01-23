import { Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocialProof } from "@/hooks/useSocialProof";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export const SocialProofBar = () => {
  const { visitorCount, currentBuyer, isRecentPurchase, hasBuyers } = useSocialProof();
  const { language } = useLanguage();

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Live Visitors Badge */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/80 backdrop-blur-sm rounded-full text-xs font-medium border border-border/50">
        <Eye className="w-3 h-3 text-green-500 animate-pulse" />
        <span className="text-foreground font-semibold">{visitorCount}</span>
        <span className="text-muted-foreground">
          {language === 'ro' ? 'online' : 'viewing'}
        </span>
      </div>

      {/* Purchase Notification - Only show if we have buyers */}
      {hasBuyers && currentBuyer && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBuyer.name}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors",
              isRecentPurchase
                ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
            )}
          >
            {/* Pulsing dot */}
            <span 
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                isRecentPurchase 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-green-500 animate-pulse"
              )} 
            />
            <span className="font-semibold truncate max-w-[60px] sm:max-w-none">{currentBuyer.name}</span>
            <span className="text-current/80 hidden sm:inline">
              {language === 'ro' ? 'a ales' : 'chose'}
            </span>
            <span className="text-current/80 sm:hidden">→</span>
            <span className="font-medium">{currentBuyer.tier}</span>
            {isRecentPurchase && (
              <span className="font-bold hidden sm:inline">
                {language === 'ro' ? 'acum!' : 'now!'}
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
