import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LayoutGrid, Grid3X3, Grid2X2, Maximize, Minimize, AlignJustify } from 'lucide-react';

type Density = 'compact' | 'normal' | 'spacious';
type Columns = 1 | 2 | 3;

const LAYOUT_STORAGE_KEY = 'dashboard-layout-settings';

interface LayoutSettings {
  density: Density;
  columns: Columns;
}

export const LayoutOptions: React.FC = () => {
  const { language } = useLanguage();
  const [density, setDensity] = useState<Density>('normal');
  const [columns, setColumns] = useState<Columns>(1);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (saved) {
      try {
        const settings: LayoutSettings = JSON.parse(saved);
        setDensity(settings.density || 'normal');
        setColumns(settings.columns || 1);
      } catch (e) {
        console.error('Error loading layout settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newDensity: Density, newColumns: Columns) => {
    const settings: LayoutSettings = { density: newDensity, columns: newColumns };
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(settings));
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('dashboard-layout-changed', { detail: settings }));
  };

  const handleDensityChange = (value: Density) => {
    setDensity(value);
    saveSettings(value, columns);
  };

  const handleColumnsChange = (value: number[]) => {
    const newColumns = value[0] as Columns;
    setColumns(newColumns);
    saveSettings(density, newColumns);
  };

  return (
    <div className="space-y-8">
      {/* Density Selection */}
      <div>
        <h3 className="text-sm font-medium mb-4">
          {language === 'ro' ? 'Densitate Widget-uri' : 'Widget Density'}
        </h3>
        <RadioGroup 
          value={density} 
          onValueChange={(v) => handleDensityChange(v as Density)}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem value="compact" id="compact" className="peer sr-only" />
            <Label 
              htmlFor="compact" 
              className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Minimize className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {language === 'ro' ? 'Compact' : 'Compact'}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {language === 'ro' ? 'Mai multe widget-uri vizibile' : 'More widgets visible'}
              </span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem value="normal" id="normal" className="peer sr-only" />
            <Label 
              htmlFor="normal" 
              className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <AlignJustify className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {language === 'ro' ? 'Normal' : 'Normal'}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {language === 'ro' ? 'Echilibru optim' : 'Optimal balance'}
              </span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem value="spacious" id="spacious" className="peer sr-only" />
            <Label 
              htmlFor="spacious" 
              className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Maximize className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">
                {language === 'ro' ? 'Spațios' : 'Spacious'}
              </span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {language === 'ro' ? 'Mai mult spațiu' : 'More breathing room'}
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Columns Selection */}
      <div>
        <h3 className="text-sm font-medium mb-4">
          {language === 'ro' ? 'Număr Coloane (Desktop)' : 'Number of Columns (Desktop)'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Grid2X2 className="h-5 w-5 text-muted-foreground" />
              <Slider
                value={[columns]}
                onValueChange={handleColumnsChange}
                min={1}
                max={3}
                step={1}
                className="w-48"
              />
              <Grid3X3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-full">
              {columns} {language === 'ro' ? (columns === 1 ? 'coloană' : 'coloane') : (columns === 1 ? 'column' : 'columns')}
            </span>
          </div>
          
          {/* Preview */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground mb-3">
              {language === 'ro' ? 'Previzualizare layout:' : 'Layout preview:'}
            </p>
            <div className={`grid gap-2 ${
              columns === 1 ? 'grid-cols-1' : 
              columns === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}>
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-8 rounded bg-primary/20 ${i > columns ? 'hidden' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          {language === 'ro' 
            ? '💡 Modificările sunt salvate automat și se aplică imediat pe dashboard.'
            : '💡 Changes are saved automatically and apply immediately to your dashboard.'}
        </p>
      </div>
    </div>
  );
};
