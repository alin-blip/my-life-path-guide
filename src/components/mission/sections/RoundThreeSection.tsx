
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { MissionCategory } from '@/types/mission';
import { useCategoryLabel } from '../utils/categoryUtils';

interface RoundThreeSectionProps {
  category: MissionCategory;
  currentMindsets: string;
  requiredMindsets: string;
  currentSkills: string;
  requiredSkills: string;
  currentResources: string;
  requiredResources: string;
  onCurrentMindsetsChange: (value: string) => void;
  onRequiredMindsetsChange: (value: string) => void;
  onCurrentSkillsChange: (value: string) => void;
  onRequiredSkillsChange: (value: string) => void;
  onCurrentResourcesChange: (value: string) => void;
  onRequiredResourcesChange: (value: string) => void;
  isImpossibleGame?: boolean;
}

export const RoundThreeSection: React.FC<RoundThreeSectionProps> = ({
  category,
  currentMindsets,
  requiredMindsets,
  currentSkills,
  requiredSkills,
  currentResources,
  requiredResources,
  onCurrentMindsetsChange,
  onRequiredMindsetsChange,
  onCurrentSkillsChange,
  onRequiredSkillsChange,
  onCurrentResourcesChange,
  onRequiredResourcesChange,
  isImpossibleGame = false
}) => {
  const { language } = useLanguage();
  const categoryLabel = useCategoryLabel(category);
  
  return (
    <div className="border-t border-gray-700 pt-4">
      <h3 className="text-lg font-semibold mb-4">
        {language === 'en' ? 'ROUND #3 QUESTIONS...' : 'RUNDA #3 ÎNTREBĂRI...'}
      </h3>
      
      <p className="mb-4">
        {language === 'en' 
          ? 'There are specific strategies to unlocking the power of the GAP and getting clear on who you will have to become to reveal Impossible Freedom.'
          : 'Există strategii specifice pentru a debloca puterea GOLULUI și pentru a clarifica cine va trebui să devii pentru a dezvălui Libertatea Imposibilă.'}
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What MINDSETS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel}?`
              : `Ce MINDSETURI ai în prezent care va trebui să fie accesate pentru a obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={currentMindsets}
            onChange={(e) => onCurrentMindsetsChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What MINDSETS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel}?`
              : `Ce MINDSETURI trebuie să dobândești pentru a te asigura că poți obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={requiredMindsets}
            onChange={(e) => onRequiredMindsetsChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What SKILLS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel}?`
              : `Ce ABILITĂȚI ai în prezent care vor trebui să fie accesate pentru a obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={currentSkills}
            onChange={(e) => onCurrentSkillsChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What SKILLS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel}?`
              : `Ce ABILITĂȚI trebuie să dobândești pentru a te asigura că poți obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={requiredSkills}
            onChange={(e) => onRequiredSkillsChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What RESOURCES/RELATIONSHIPS do you currently have that will need to be accessed to obtain your Impossible Freedom in ${categoryLabel}?`
              : `Ce RESURSE/RELAȚII ai în prezent care vor trebui să fie accesate pentru a obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={currentResources}
            onChange={(e) => onCurrentResourcesChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {language === 'en' 
              ? `What RESOURCES/RELATIONSHIPS must you acquire to ensure you can obtain your impossible Freedom In ${categoryLabel}?`
              : `Ce RESURSE/RELAȚII trebuie să dobândești pentru a te asigura că poți obține Libertatea ta Imposibilă în ${categoryLabel}?`}
          </label>
          <Textarea
            value={requiredResources}
            onChange={(e) => onRequiredResourcesChange(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};
