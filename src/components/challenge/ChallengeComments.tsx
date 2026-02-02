import React, { forwardRef, useImperativeHandle } from 'react';
import { ModuleComments, ModuleCommentsRef } from '@/components/warriors-way/ModuleComments';
import { useModuleComments } from '@/hooks/useModuleComments';

interface ChallengeCommentsProps {
  dayNumber: number;
}

export interface ChallengeCommentsRef {
  postComment: (content: string) => Promise<boolean>;
}

export const ChallengeComments = forwardRef<ChallengeCommentsRef, ChallengeCommentsProps>(
  ({ dayNumber }, ref) => {
    // Generate module_id in the format used by warriors_way_comments table
    const moduleId = `challenge-day-${dayNumber}`;
    const { addComment, refetch } = useModuleComments(moduleId);
    
    // Expose postComment method to parent
    useImperativeHandle(ref, () => ({
      postComment: async (content: string) => {
        const success = await addComment(content);
        if (success) {
          // Refetch immediately to show the new comment
          await refetch();
        }
        return success;
      }
    }));
    
    return (
      <div className="mt-6">
        <ModuleComments moduleId={moduleId} />
      </div>
    );
  }
);

ChallengeComments.displayName = 'ChallengeComments';
