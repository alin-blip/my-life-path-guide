import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton placeholder shown while Dashboard data loads from Supabase.
 * Mirrors the visual rhythm of the real dashboard cards so the layout
 * doesn't jump when data arrives.
 */
const CardSkeleton: React.FC<{ heightClass?: string; withHeader?: boolean }> = ({
  heightClass = 'h-32',
  withHeader = true,
}) => (
  <Card className="mb-6">
    {withHeader && (
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>
    )}
    <CardContent className="space-y-3">
      <Skeleton className={`w-full ${heightClass}`} />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-full py-4 px-2 md:py-8 md:px-4" aria-busy="true" aria-live="polite">
      {/* Objectives card */}
      <CardSkeleton heightClass="h-24" />

      {/* Daily Command Center */}
      <CardSkeleton heightClass="h-40" />

      {/* Vision Declaration */}
      <CardSkeleton heightClass="h-36" />

      {/* Empowerment Meditation */}
      <CardSkeleton heightClass="h-28" />

      {/* Self Care */}
      <CardSkeleton heightClass="h-28" />

      {/* Widget grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-2/3" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Evening Routine */}
      <CardSkeleton heightClass="h-28" />
    </div>
  );
};

export default DashboardSkeleton;
