import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2];

export const SpeedSlider: React.FC<SpeedSliderProps> = ({
  value,
  onChange,
  disabled = false,
  className
}) => {
  // Convert speed value to slider index (0-3)
  const sliderValue = SPEED_OPTIONS.indexOf(value) !== -1 
    ? SPEED_OPTIONS.indexOf(value) 
    : 1; // default to 1.25x

  const handleChange = (values: number[]) => {
    const index = values[0];
    onChange(SPEED_OPTIONS[index]);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Gauge className="w-4 h-4 text-muted-foreground" />
      <Slider
        value={[sliderValue]}
        onValueChange={handleChange}
        min={0}
        max={3}
        step={1}
        disabled={disabled}
        className="w-20"
      />
      <span className="text-xs text-muted-foreground w-8">
        {value}x
      </span>
    </div>
  );
};
