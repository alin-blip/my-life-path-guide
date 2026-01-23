import { motion } from 'framer-motion';
import { Check, Target } from 'lucide-react';

interface ChallengeMiniPreviewProps {
  weakestDimension: string;
}

const DIMENSION_NAMES: Record<string, string> = {
  body: 'Corp',
  being: 'Ființă',
  balance: 'Echilibru',
  business: 'Business'
};

export function ChallengeMiniPreview({ weakestDimension }: ChallengeMiniPreviewProps) {
  const weakName = DIMENSION_NAMES[weakestDimension] || weakestDimension;
  
  const bullets = [
    {
      title: 'Ziua 1: Declarația Ta',
      description: 'Viziune clară stil Napoleon Hill'
    },
    {
      title: 'Ziua 2-4: Obiective + Rutina',
      description: `Focus pe ${weakName} + Morning Stack`
    },
    {
      title: 'Ziua 5-7: AI + Integrare',
      description: 'Vision Board + Accountability'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Ce primești în Challenge:
        </span>
      </div>
      
      <div className="space-y-2">
        {bullets.map((bullet, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-start gap-2"
          >
            <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-sm font-medium text-foreground">
                {bullet.title}
              </span>
              <span className="text-sm text-muted-foreground ml-1">
                — {bullet.description}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
