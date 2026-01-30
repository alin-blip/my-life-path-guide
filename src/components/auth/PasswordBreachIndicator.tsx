import React from 'react';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PasswordCheckState, PasswordCheckMessages } from '@/hooks/usePasswordCheck';

interface PasswordBreachIndicatorProps {
  state: PasswordCheckState;
  messages: PasswordCheckMessages;
  className?: string;
}

export const PasswordBreachIndicator: React.FC<PasswordBreachIndicatorProps> = ({
  state,
  messages,
  className,
}) => {
  const { isChecking, result, formattedCount } = state;

  // Don't show anything if no check has been done
  if (!isChecking && !result) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isChecking ? 'checking' : result?.isBreached ? 'breached' : 'safe'}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('mt-1', className)}
      >
        {isChecking ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{messages.checking}</span>
          </div>
        ) : result?.isBreached ? (
          <div className="flex items-start gap-2 text-xs text-orange-400">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              {messages.breached}
              {formattedCount && (
                <span className="text-orange-500 font-medium ml-1">
                  ({formattedCount}×)
                </span>
              )}
            </span>
          </div>
        ) : result && !result.error ? (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{messages.safe}</span>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
};
