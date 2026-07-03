import React, { useState } from 'react';
import { ResponsiveModal, ResponsiveModalHeader, ResponsiveModalTitle, ResponsiveModalDescription, ResponsiveModalFooter } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/context/LanguageContext';
import { biz4MetricsService } from '@/services/biz4MetricsService';
import { useToast } from '@/hooks/use-toast';

type ActionType = 'content' | 'engage' | 'outreach' | 'close' | 'podcast' | 'webinar';

interface Biz4ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: ActionType;
  onComplete: () => void;
}

const ACTION_CONFIG: Record<ActionType, {
  title: { en: string; ro: string };
  fields: {
    id: string;
    label: { en: string; ro: string };
    type: 'number' | 'text' | 'checkbox' | 'multicheck';
    options?: { value: string; label: { en: string; ro: string } }[];
  }[];
}> = {
  content: {
    title: { en: 'Log Content Creation', ro: 'Înregistrează Conținut Creat' },
    fields: [
      { id: 'pieces_count', label: { en: 'Number of pieces created', ro: 'Număr de piese create' }, type: 'number' },
      { id: 'type', label: { en: 'Content type', ro: 'Tip conținut' }, type: 'text' },
    ],
  },
  engage: {
    title: { en: 'Log Engagement', ro: 'Înregistrează Interacțiune' },
    fields: [
      { id: 'minutes', label: { en: 'Minutes spent engaging', ro: 'Minute petrecute interacționând' }, type: 'number' },
      { id: 'comments_count', label: { en: 'Comments/replies made', ro: 'Comentarii/răspunsuri făcute' }, type: 'number' },
    ],
  },
  outreach: {
    title: { en: 'Log Outreach', ro: 'Înregistrează Prospectare' },
    fields: [
      { id: 'prospects_count', label: { en: 'Prospects contacted', ro: 'Prospecți contactați' }, type: 'number' },
      { 
        id: 'channels', 
        label: { en: 'Channels used', ro: 'Canale folosite' }, 
        type: 'multicheck',
        options: [
          { value: 'email', label: { en: 'Email', ro: 'Email' } },
          { value: 'dm', label: { en: 'DM/Message', ro: 'DM/Mesaj' } },
          { value: 'call', label: { en: 'Phone call', ro: 'Apel telefonic' } },
          { value: 'linkedin', label: { en: 'LinkedIn', ro: 'LinkedIn' } },
        ],
      },
    ],
  },
  close: {
    title: { en: 'Log Sales Activity', ro: 'Înregistrează Activitate Vânzări' },
    fields: [
      { id: 'conversations_count', label: { en: 'Sales conversations', ro: 'Conversații de vânzare' }, type: 'number' },
      { id: 'deals_won', label: { en: 'Deals closed', ro: 'Tranzacții închise' }, type: 'number' },
    ],
  },
  podcast: {
    title: { en: 'Log Podcast', ro: 'Înregistrează Podcast' },
    fields: [
      { id: 'episode_number', label: { en: 'Episode number', ro: 'Număr episod' }, type: 'number' },
    ],
  },
  webinar: {
    title: { en: 'Log Webinar', ro: 'Înregistrează Webinar' },
    fields: [
      { id: 'attendees_count', label: { en: 'Number of attendees', ro: 'Număr participanți' }, type: 'number' },
    ],
  },
};

export const Biz4ActionModal: React.FC<Biz4ActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  onComplete,
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const config = ACTION_CONFIG[actionType];

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleMultiCheckChange = (fieldId: string, optionValue: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, optionValue] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter((v: string) => v !== optionValue) };
      }
    });
  };

  const handleQuickComplete = async () => {
    setIsLoading(true);
    try {
      await biz4MetricsService.updateActionMetrics(actionType, { completed: true });
      toast({
        title: language === 'en' ? 'Action completed!' : 'Acțiune completată!',
        description: language === 'en' ? 'Great job!' : 'Foarte bine!',
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing action:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save. Please try again.' : 'Salvare eșuată. Încearcă din nou.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWithMetrics = async () => {
    setIsLoading(true);
    try {
      await biz4MetricsService.updateActionMetrics(actionType, {
        completed: true,
        ...formData,
      });
      toast({
        title: language === 'en' ? 'Metrics saved!' : 'Metrici salvate!',
        description: language === 'en' ? 'Your detailed progress has been recorded.' : 'Progresul tău detaliat a fost înregistrat.',
      });
      onComplete();
      onClose();
      setFormData({});
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Eroare',
        description: language === 'en' ? 'Failed to save. Please try again.' : 'Salvare eșuată. Încearcă din nou.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onClose} className="sm:max-w-md"><ResponsiveModalHeader>
          <ResponsiveModalTitle>{config.title[language]}</ResponsiveModalTitle>
        </ResponsiveModalHeader>

        <div className="space-y-4 py-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label[language]}</Label>
              
              {field.type === 'number' && (
                <Input
                  id={field.id}
                  type="number"
                  min="0"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              )}
              
              {field.type === 'text' && (
                <Input
                  id={field.id}
                  type="text"
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={language === 'en' ? 'Enter value...' : 'Introdu valoare...'}
                />
              )}
              
              {field.type === 'multicheck' && field.options && (
                <div className="flex flex-wrap gap-3">
                  {field.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}-${option.value}`}
                        checked={(formData[field.id] || []).includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleMultiCheckChange(field.id, option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                        {option.label[language]}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleQuickComplete}
            disabled={isLoading}
            className="flex-1"
          >
            {language === 'en' ? 'Quick Complete' : 'Completare Rapidă'}
          </Button>
          <Button
            onClick={handleSaveWithMetrics}
            disabled={isLoading}
            className="flex-1"
          >
            {language === 'en' ? 'Save with Metrics' : 'Salvează cu Metrici'}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModal>
  );
};
