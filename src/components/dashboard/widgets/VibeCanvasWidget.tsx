import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, ArrowRight, Sparkles, PenTool } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface VibeCanvasWidgetProps {
  size?: 'small' | 'medium' | 'large';
  onRemove?: () => void;
}

export const VibeCanvasWidget: React.FC<VibeCanvasWidgetProps> = ({ size = 'medium' }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = language === 'ro' ? {
    title: 'Vibe Canvas',
    subtitle: 'Notițe vizuale & brainstorming',
    cta: 'Deschide Canvas',
    features: ['Mind Maps', 'Brainstorming', 'Vision Board']
  } : {
    title: 'Vibe Canvas',
    subtitle: 'Visual notes & brainstorming',
    cta: 'Open Canvas',
    features: ['Mind Maps', 'Brainstorming', 'Vision Board']
  };

  const handleOpen = () => {
    navigate('/vibe-canvas');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 hover:border-primary/40 transition-all duration-300"
        onClick={handleOpen}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Palette className="h-5 w-5 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {content.title}
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {content.subtitle}
              </p>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {content.features.map((feature) => (
                  <span 
                    key={feature}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <PenTool className="h-16 w-16 text-primary rotate-12" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
