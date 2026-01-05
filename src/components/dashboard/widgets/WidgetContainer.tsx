import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetSize } from '@/types/dashboardWidget';

interface WidgetContainerProps {
  title: string;
  icon?: React.ReactNode;
  size: WidgetSize;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  children: React.ReactNode;
  className?: string;
  dragHandleProps?: any;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  title,
  icon,
  size,
  onRemove,
  onResize,
  children,
  className,
  dragHandleProps
}) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3'
  };

  const toggleSize = () => {
    if (!onResize) return;
    const sizes: WidgetSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    onResize(sizes[nextIndex]);
  };

  return (
    <Card className={cn(
      'relative group transition-all duration-200 hover:shadow-md',
      sizeClasses[size],
      className
    )}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {dragHandleProps && (
            <div {...dragHandleProps} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {icon}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onResize && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleSize}
            >
              {size === 'small' ? (
                <Maximize2 className="h-3 w-3" />
              ) : (
                <Minimize2 className="h-3 w-3" />
              )}
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};
