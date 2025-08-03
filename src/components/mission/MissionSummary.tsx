
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { MonthlyMission } from '@/types/mission';

interface MissionSummaryProps {
  mission: MonthlyMission;
  summary: string | null;
  formattedStartDate: string;
  formattedEndDate: string;
  onEditDates: () => void;
  onViewDetails: () => void;
  isEditable?: boolean;
}

export const MissionSummary: React.FC<MissionSummaryProps> = ({
  mission,
  summary,
  formattedStartDate,
  formattedEndDate,
  onEditDates,
  onViewDetails,
  isEditable = true
}) => {
  const { language } = useLanguage();
  
  return (
    <div>
      <h3 className="text-blue-300 font-medium mb-2">{mission.name}</h3>
      {summary ? (
        <p className="text-gray-300">{summary}</p>
      ) : (
        <p className="text-gray-300">
          {mission.parts && mission.parts[0]?.content
            ? mission.parts[0].content.slice(0, 150) + '...'
            : (language === 'en' ? 'No details available.' : 'Nu sunt disponibile detalii.')
          }
        </p>
      )}
      <div className="flex gap-3 mt-3 flex-wrap text-xs text-gray-400">
        <div>
          {language === 'en' ? "Created" : "Creată"}:{" "}
          <span className="text-white">{formattedStartDate}</span>
        </div>
      </div>
      {isEditable && (
        <div className="mt-3 flex items-center gap-4">
          <div>
            <span className="text-gray-400">{language === "en" ? "Period:" : "Perioada:"}</span>
            <span className="ml-2 font-semibold text-white">
              {formattedStartDate} - {formattedEndDate}
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="px-2 py-1 text-blue-400"
            onClick={e => {
              e.stopPropagation();
              onEditDates();
            }}
          >
            {language === "en" ? "Change Period" : "Modifică perioada"}
          </Button>
        </div>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-blue-700 text-blue-300 mt-4"
        onClick={e => {
          e.stopPropagation();
          onViewDetails();
        }}
      >
        {summary
          ? (language === 'en' ? 'Review or Edit Mission' : 'Revizuiește sau editează misiunea')
          : (language === 'en' ? 'Complete Monthly Mission' : 'Completează misiunea lunară')
        }
      </Button>
    </div>
  );
};
