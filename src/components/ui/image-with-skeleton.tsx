import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  skeletonClassName?: string;
}

/**
 * Renders an <img> with a Skeleton overlay until the image finishes loading.
 * Prevents the "flicker" of empty containers while remote images fetch.
 */
export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  wrapperClassName,
  skeletonClassName,
  className,
  onLoad,
  onError,
  loading = 'lazy',
  decoding = 'async',
  ...imgProps
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={cn('relative w-full h-full', wrapperClassName)}>
      {!loaded && !errored && (
        <Skeleton
          className={cn(
            'absolute inset-0 w-full h-full rounded-[inherit]',
            skeletonClassName
          )}
        />
      )}
      <img
        {...imgProps}
        loading={loading}
        decoding={decoding}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setErrored(true);
          setLoaded(true);
          onError?.(e);
        }}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  );
};
