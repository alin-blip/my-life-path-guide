import React from 'react';
import { EnhancedAiLiveCoaching } from './EnhancedAiLiveCoaching';

interface AiLiveCoachingProps {
  onAddToHitList?: (action: string) => void;
}

export const AiLiveCoaching: React.FC<AiLiveCoachingProps> = ({ onAddToHitList }) => {
  return <EnhancedAiLiveCoaching onAddToHitList={onAddToHitList} />;
};