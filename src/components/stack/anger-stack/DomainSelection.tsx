
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/context/LanguageContext';

interface DomainSelectionProps {
  domain: string;
  onDomainChange: (value: string) => void;
}

export const DomainSelection: React.FC<DomainSelectionProps> = ({ domain, onDomainChange }) => {
  const { language } = useLanguage();

  const domains = [
    { value: "body", label: language === 'en' ? "Body" : "Corp" },
    { value: "being", label: language === 'en' ? "Spirituality" : "Spiritualitate" },
    { value: "balance", label: language === 'en' ? "Relationships" : "Relații" },
    { value: "business", label: language === 'en' ? "Business" : "Afaceri" }
  ];

  return (
    <RadioGroup value={domain} onValueChange={onDomainChange} className="flex flex-col space-y-3 mt-4">
      {domains.map((domainOption) => (
        <div key={domainOption.value} className="flex items-center space-x-3">
          <RadioGroupItem value={domainOption.value} id={domainOption.value} />
          <Label htmlFor={domainOption.value} className="text-white">{domainOption.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};
