import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface IntensitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  color?: string;
}

export function IntensitySlider({ label, value, onChange, icon, color = 'primary' }: IntensitySliderProps) {
  const getIntensityLabel = (val: number) => {
    if (val <= 2) return 'Foarte slab';
    if (val <= 4) return 'Slab';
    if (val <= 6) return 'Moderat';
    if (val <= 8) return 'Puternic';
    return 'Foarte puternic';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{getIntensityLabel(value)}</span>
          <span className={cn(
            'text-sm font-bold px-2 py-0.5 rounded-full',
            'bg-primary/20 text-primary'
          )}>
            {value}/10
          </span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}
