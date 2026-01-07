import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";

interface EnergySliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  showIcon?: boolean;
}

export function EnergySlider({ value, onChange, label, showIcon = true }: EnergySliderProps) {
  const getEnergyColor = (val: number) => {
    if (val <= 3) return "text-red-500";
    if (val <= 5) return "text-orange-500";
    if (val <= 7) return "text-yellow-500";
    return "text-green-500";
  };

  const getEnergyIcon = (val: number) => {
    if (val <= 3) return BatteryLow;
    if (val <= 6) return BatteryMedium;
    return BatteryFull;
  };

  const Icon = getEnergyIcon(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {showIcon && <Icon className={cn("h-4 w-4", getEnergyColor(value))} />}
          <span className={cn("text-sm font-semibold", getEnergyColor(value))}>
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
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Epuizat</span>
        <span>Plin de energie</span>
      </div>
    </div>
  );
}
