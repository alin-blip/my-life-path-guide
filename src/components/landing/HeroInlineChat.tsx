import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface HeroInlineChatProps {
  onAskQuestion: (question: string) => void;
  onOpenChat: () => void;
}

export const HeroInlineChat = ({ onAskQuestion, onOpenChat }: HeroInlineChatProps) => {
  const { language } = useLanguage();
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const typingTexts = language === 'ro' 
    ? [
        "Întreabă-mă orice despre platformă...",
        "Cum te pot ajuta să-ți atingi obiectivele?",
        "Ce vrei să știi despre WarriorOS?"
      ]
    : [
        "Ask me anything about the platform...",
        "How can I help you reach your goals?",
        "What do you want to know about WarriorOS?"
      ];

  const quickActions = language === 'ro'
    ? [
        { label: "Cum funcționează?", question: "Cum funcționează platforma WarriorOS?" },
        { label: "La ce mă ajută?", question: "La ce mă ajută WarriorOS concret?" },
        { label: "Cât costă?", question: "Cât costă abonamentul?" },
        { label: "E pentru mine?", question: "Este WarriorOS potrivit pentru mine?" },
      ]
    : [
        { label: "How does it work?", question: "How does the WarriorOS platform work?" },
        { label: "How can it help me?", question: "How can WarriorOS help me specifically?" },
        { label: "What's the price?", question: "How much does the subscription cost?" },
        { label: "Is it for me?", question: "Is WarriorOS right for me?" },
      ];

  // Typing effect
  useEffect(() => {
    const currentText = typingTexts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Wait before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % typingTexts.length);
        }
      }
    }, isDeleting ? 30 : 50);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, typingTexts]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Fake Input with Typing Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onOpenChat}
        className="relative cursor-pointer group"
      >
        <div className="flex items-center gap-3 px-5 py-4 bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-2xl shadow-lg hover:border-primary/40 hover:shadow-xl transition-all duration-300">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-h-[24px]">
            <span className="text-muted-foreground text-base md:text-lg">
              {displayText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-0.5 h-5 bg-primary ml-0.5 align-middle"
              />
            </span>
          </div>
          <div className="flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </motion.div>

      {/* Quick Action Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-4"
      >
        {quickActions.map((action, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            onClick={() => onAskQuestion(action.question)}
            className="px-4 py-2 text-sm font-medium bg-secondary/50 hover:bg-primary hover:text-primary-foreground border border-border/50 hover:border-primary rounded-full transition-all duration-200 hover:scale-105"
          >
            {action.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
