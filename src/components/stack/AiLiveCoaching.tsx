import React from 'react';
import { EnhancedAiLiveCoaching } from './EnhancedAiLiveCoaching';

interface AiLiveCoachingProps {
  onAddToHitList?: (action: string) => void;
  stackType?: string;
}

export const AiLiveCoaching: React.FC<AiLiveCoachingProps> = ({ onAddToHitList, stackType }) => {
  return <EnhancedAiLiveCoaching onAddToHitList={onAddToHitList} stackType={stackType} />;
};