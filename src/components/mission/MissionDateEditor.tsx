
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface MissionDateEditorProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const MissionDateEditor: React.FC<MissionDateEditorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSave,
  onCancel
}) => {
  const { language } = useLanguage();
  
  return (
    <form 
      className="flex flex-col gap-2 mt-2"
      onClick={e => e.stopPropagation()}
      onSubmit={e => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <label className="text-xs text-gray-300">
          {language === "en" ? "Start date:" : "Data început:"}
          <input
            className="ml-2 px-2 py-1 rounded bg-gray-700 text-white border border-blue-700/40"
            type="date"
            value={startDate || ""}
            onChange={e => onStartDateChange(e.target.value)}
          />
        </label>
        <label className="text-xs text-gray-300">
          {language === "en" ? "End date:" : "Data final:"}
          <input
            className="ml-2 px-2 py-1 rounded bg-gray-700 text-white border border-blue-700/40"
            type="date"
            value={endDate || ""}
            onChange={e => onEndDateChange(e.target.value)}
          />
        </label>
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          type="submit"
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold"
        >
          {language === "en" ? "Save" : "Salvează"}
        </Button>
        <Button
          variant="secondary"
          className="text-gray-300"
          onClick={onCancel}
          type="button"
        >
          {language === "en" ? "Cancel" : "Anulează"}
        </Button>
      </div>
    </form>
  );
};
