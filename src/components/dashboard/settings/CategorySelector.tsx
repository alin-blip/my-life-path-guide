import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useUserCategories, DEFAULT_CATEGORIES, LIFEBOOK_SUBCATEGORIES } from '@/hooks/useUserCategories';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dumbbell, Brain, Heart, Briefcase, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const categoryIcons: Record<string, React.ReactNode> = {
  body: <Dumbbell className="h-4 w-4" />,
  being: <Brain className="h-4 w-4" />,
  balance: <Heart className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
};

export const CategorySelector: React.FC = () => {
  const { language } = useLanguage();
  const { 
    categories, 
    mode, 
    setMode, 
    toggleCategory, 
    addCustomCategory, 
    removeCategory,
    loading 
  } = useUserCategories();
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['body', 'being', 'balance', 'business']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParent, setNewCategoryParent] = useState<string>('body');

  const toggleExpand = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCustomCategory(newCategoryName.trim(), newCategoryParent);
      setNewCategoryName('');
    }
  };

  const isCategoryActive = (key: string) => {
    return categories.find(c => c.category_key === key)?.is_active ?? true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          {language === 'ro' ? 'Mod Vizualizare' : 'View Mode'}
        </h3>
        <RadioGroup 
          value={mode} 
          onValueChange={(value) => setMode(value as 'simple' | 'detailed' | 'custom')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="simple" id="simple" />
            <Label htmlFor="simple" className="cursor-pointer">
              {language === 'ro' ? '4 Categorii' : '4 Categories'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="detailed" id="detailed" />
            <Label htmlFor="detailed" className="cursor-pointer">
              {language === 'ro' ? '12 Detaliate' : '12 Detailed'}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="custom" id="custom" />
            <Label htmlFor="custom" className="cursor-pointer">
              {language === 'ro' ? 'Personalizat' : 'Custom'}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Categories Display */}
      <div className="space-y-4">
        {DEFAULT_CATEGORIES.map((mainCategory) => {
          const subcategories = LIFEBOOK_SUBCATEGORIES.filter(
            sub => sub.parent === mainCategory.key
          );
          const isExpanded = expandedCategories.includes(mainCategory.key);
          
          return (
            <Collapsible 
              key={mainCategory.key}
              open={isExpanded}
              onOpenChange={() => toggleExpand(mainCategory.key)}
            >
              <div className="border rounded-lg p-3">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${mainCategory.color}`}>
                        {categoryIcons[mainCategory.key]}
                      </div>
                      <div>
                        <p className="font-medium">
                          {mainCategory.icon} {language === 'ro' ? mainCategory.labelRo : mainCategory.labelEn}
                        </p>
                        {mode === 'detailed' && (
                          <p className="text-xs text-muted-foreground">
                            {subcategories.length} {language === 'ro' ? 'subcategorii' : 'subcategories'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === 'custom' && (
                        <Switch
                          checked={isCategoryActive(mainCategory.key)}
                          onCheckedChange={(checked) => toggleCategory(mainCategory.key, checked)}
                        />
                      )}
                      {mode === 'detailed' && (
                        isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                {mode === 'detailed' && (
                  <CollapsibleContent className="mt-3 space-y-2 pl-4 border-l-2 border-border ml-4">
                    {subcategories.map((sub) => (
                      <div 
                        key={sub.key}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sub.icon}</span>
                          <span className="text-sm">
                            {language === 'ro' ? sub.labelRo : sub.labelEn}
                          </span>
                        </div>
                        {(mode === 'detailed' || mode === 'custom') && (
                          <Switch
                            checked={isCategoryActive(sub.key)}
                            onCheckedChange={(checked) => toggleCategory(sub.key, checked)}
                          />
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          );
        })}
      </div>

      {/* Custom Categories */}
      {mode === 'custom' && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">
            {language === 'ro' ? 'Categorii Personalizate' : 'Custom Categories'}
          </h3>
          
          {/* Existing custom categories */}
          {categories.filter(c => c.category_key.startsWith('custom_')).map((cat) => (
            <div 
              key={cat.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon || '📌'}</span>
                <span>{language === 'ro' ? cat.display_name_ro : cat.display_name}</span>
                <Badge variant="outline" className="text-xs">
                  {language === 'ro' 
                    ? DEFAULT_CATEGORIES.find(c => c.key === cat.parent_category)?.labelRo
                    : DEFAULT_CATEGORIES.find(c => c.key === cat.parent_category)?.labelEn
                  }
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeCategory(cat.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          {/* Add new custom category */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder={language === 'ro' ? 'Nume categorie nouă...' : 'New category name...'}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
            />
            <select 
              value={newCategoryParent}
              onChange={(e) => setNewCategoryParent(e.target.value)}
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {language === 'ro' ? cat.labelRo : cat.labelEn}
                </option>
              ))}
            </select>
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ro' ? 'Adaugă' : 'Add'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
