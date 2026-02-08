import React from 'react';
import { ProgramCard, ProgramCardProps } from './ProgramCard';

interface ProgramGridProps {
  programs: ProgramCardProps[];
  className?: string;
}

export const ProgramGrid: React.FC<ProgramGridProps> = ({ programs, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {programs.map((program) => (
        <ProgramCard key={program.id} {...program} />
      ))}
    </div>
  );
};
