import React from 'react';

interface ChallengeProgressBadgeProps {
  completions: number;
  language: string;
}

// Intentionally hidden: per landing copy strategy we don't surface per-day
// completion counts on the challenge cards (small numbers hurt conversion).
export const ChallengeProgressBadge: React.FC<ChallengeProgressBadgeProps> = () => null;
