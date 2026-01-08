import { cn } from "@/lib/utils";
import { Briefcase, Dumbbell, Heart, Target, Sparkles, BookOpen } from "lucide-react";

export type TimeCategory = 'work' | 'health' | 'relationships' | 'personal' | 'spirituality' | 'learning';

interface CategoryOption {
  id: TimeCategory;
  label: string;
  labelRo: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const categories: CategoryOption[] = [
  { id: 'work', label: 'Work', labelRo: 'Muncă', icon: Briefcase, color: 'text-blue-500', bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30' },
  { id: 'health', label: 'Health', labelRo: 'Sănătate', icon: Dumbbell, color: 'text-green-500', bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30' },
  { id: 'relationships', label: 'Relationships', labelRo: 'Relații', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30' },
  { id: 'personal', label: 'Personal', labelRo: 'Personal', icon: Target, color: 'text-orange-500', bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30' },
  { id: 'spirituality', label: 'Spirituality', labelRo: 'Spiritual', icon: Sparkles, color: 'text-purple-500', bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30' },
  { id: 'learning', label: 'Learning', labelRo: 'Învățare', icon: BookOpen, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30' },
];

interface CategoryPickerProps {
  selected: TimeCategory | null;
  onSelect: (category: TimeCategory) => void;
  language?: 'en' | 'ro';
}

export function CategoryPicker({ selected, onSelect, language = 'ro' }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;
        
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
              category.bgColor,
              isSelected && "ring-2 ring-primary border-primary"
            )}
          >
            <Icon className={cn("h-5 w-5", category.color)} />
            <span className={cn("text-xs font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
              {language === 'ro' ? category.labelRo : category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function getCategoryInfo(category: TimeCategory) {
  return categories.find(c => c.id === category);
}

export { categories };
