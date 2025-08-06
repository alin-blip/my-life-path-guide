import React from 'react';
import { EnhancedAngerStack } from './EnhancedAngerStack';
import { AngerStackProps } from './anger-stack/types';

export const AngerStack: React.FC<AngerStackProps> = ({ onAddToHitList }) => {
  return <EnhancedAngerStack onAddToHitList={onAddToHitList} />;
};
