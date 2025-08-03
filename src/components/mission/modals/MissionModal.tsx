
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { Check, ChevronsRight } from 'lucide-react';

interface MissionModalProps {
  title: string;
  questions: string[];
  answers: Record<number, string>;
  onAnswerChange: (idx: number, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  isImpossibleGame?: boolean;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  title,
  questions,
  answers,
  onAnswerChange,
  onSave,
  onClose,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  
  return (
    <div className="fixed inset-0 bg-black/80 z-40 flex items-center justify-center overflow-auto">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        <Button variant="ghost" className="absolute top-3 right-3 text-white" onClick={onClose}>
          ✕
        </Button>
        <div className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
          <ChevronsRight className="w-5 h-5 text-blue-400" />
          {title}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
          className="flex flex-col gap-4"
        >
          {questions.map((question, idx) => (
            <div key={idx} className="mb-2">
              <div className="font-medium text-blue-200 mb-1">{question}</div>
              <Textarea
                placeholder={language === 'en' ? "Write your answer here..." : "Scrie răspunsul tău aici..."}
                className="min-h-[70px] bg-gray-800/40 border-blue-700/30"
                value={answers[idx] || ''}
                onChange={e => onAnswerChange(idx, e.target.value)}
              />
            </div>
          ))}
          <Button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold mt-2"
          >
            <Check size={18} className="inline-block mr-2" />
            {language === 'en' ? 'Finalize' : 'Finalizează'}
          </Button>
          <div className="text-xs text-gray-400 pt-1 text-center">
            {language === 'en'
              ? 'Your answers are saved automatically and will be visible on the dashboard for regular review and guidance.'
              : 'Răspunsurile sunt salvate automat și vor fi vizibile pe dashboard pentru ghidare și reamintire.'}
          </div>
        </form>
      </div>
    </div>
  );
};
