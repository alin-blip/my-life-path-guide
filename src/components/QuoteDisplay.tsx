
import React, { useState, useEffect, useRef } from 'react';
import { Share, Facebook, Twitter, Instagram, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import EnhancedQuoteDisplay from './EnhancedQuoteDisplay';

interface QuoteDisplayProps {
  appName?: string;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ appName = "WARRIOR" }) => {
  // For backward compatibility, we're using the EnhancedQuoteDisplay now
  return <EnhancedQuoteDisplay appName={appName} />;
};
