import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, Settings, GripVertical,
  Book, Heart, Target, Clock, Check, Star, Trophy, Flame,
  Dumbbell, Brain, Coffee, Sun, Moon, Droplet, Apple, Smile,
  Plus, Minus
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { CustomWidget, WidgetConfig, WidgetData } from '@/types/customWidget';

interface CustomWidgetRendererProps {
  widget: CustomWidget;
  data?: WidgetData | null;
  onSaveData: (data: Record<string, unknown>) => void;
  onDelete?: () => void;
  onSettings?: () => void;
  isCompact?: boolean;
  dragHandleProps?: any;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Book, Heart, Target, Clock, Check, Star, Trophy, Flame,
  Dumbbell, Brain, Coffee, Sun, Moon, Droplet, Apple, Smile,
};

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  green: 'bg-green-500/20 text-green-500 border-green-500/30',
  orange: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  red: 'bg-red-500/20 text-red-500 border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  pink: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/30',
};

export function CustomWidgetRenderer({
  widget,
  data,
  onSaveData,
  onDelete,
  onSettings,
  isCompact = false,
  dragHandleProps,
}: CustomWidgetRendererProps) {
  const { language } = useLanguage();
  const { config } = widget;
  const IconComponent = ICON_MAP[config.icon] || Target;
  const colorClasses = COLOR_MAP[config.color] || COLOR_MAP.blue;

  const currentData = data?.data || {};

  const handleValueChange = (fieldName: string, value: unknown) => {
    onSaveData({ ...currentData, [fieldName]: value });
  };

  // Counter Widget
  if (config.type === 'counter') {
    const fieldName = config.fields[0]?.name || 'value';
    const currentValue = (currentData[fieldName] as number) || 0;
    const goal = config.goal;
    const progress = goal ? Math.min((currentValue / goal) * 100, 100) : 0;

    return (
      <Card className={`glass-card ${colorClasses}`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
              )}
              <IconComponent className="w-5 h-5" />
              <CardTitle className="text-sm">{widget.name}</CardTitle>
            </div>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleValueChange(fieldName, Math.max(0, currentValue - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-3xl font-bold">{currentValue}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleValueChange(fieldName, currentValue + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {goal && (
            <>
              <Progress value={progress} className="h-2 mb-1" />
              <p className="text-xs text-center text-muted-foreground">
                {currentValue} / {goal} {config.unit || ''}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Tracker Widget (boolean toggle)
  if (config.type === 'tracker') {
    const fieldName = config.fields[0]?.name || 'completed';
    const isCompleted = Boolean(currentData[fieldName]);

    return (
      <Card className={`glass-card ${isCompleted ? colorClasses : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
              )}
              <div className={`p-2 rounded-full ${colorClasses}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium">{widget.name}</h4>
                {widget.description && (
                  <p className="text-xs text-muted-foreground">{widget.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isCompleted}
                onCheckedChange={(checked) => handleValueChange(fieldName, checked)}
              />
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={onDelete}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Goal Widget (progress toward a target)
  if (config.type === 'goal') {
    const fieldName = config.fields[0]?.name || 'current';
    const currentValue = (currentData[fieldName] as number) || 0;
    const goal = config.goal || 100;
    const progress = Math.min((currentValue / goal) * 100, 100);

    return (
      <Card className={`glass-card`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
              )}
              <div className={`p-1.5 rounded-full ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">{widget.name}</CardTitle>
            </div>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => handleValueChange(fieldName, parseFloat(e.target.value) || 0)}
              className="h-8 w-20"
            />
            <span className="text-sm text-muted-foreground">/ {goal} {config.unit || ''}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-right mt-1 text-muted-foreground">{Math.round(progress)}%</p>
        </CardContent>
      </Card>
    );
  }

  // Checklist Widget
  if (config.type === 'checklist') {
    const items = (currentData.items as string[]) || [];
    const completed = (currentData.completed as string[]) || [];

    const toggleItem = (item: string) => {
      const newCompleted = completed.includes(item)
        ? completed.filter(i => i !== item)
        : [...completed, item];
      onSaveData({ ...currentData, completed: newCompleted });
    };

    const addItem = (item: string) => {
      if (item.trim()) {
        onSaveData({ ...currentData, items: [...items, item.trim()] });
      }
    };

    return (
      <Card className="glass-card">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
              )}
              <div className={`p-1.5 rounded-full ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">{widget.name}</CardTitle>
            </div>
            <Badge variant="outline">
              {completed.length}/{items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-1">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Switch
                checked={completed.includes(item)}
                onCheckedChange={() => toggleItem(item)}
              />
              <span className={`text-sm ${completed.includes(item) ? 'line-through text-muted-foreground' : ''}`}>
                {item}
              </span>
            </div>
          ))}
          <Input
            placeholder={language === 'en' ? 'Add item...' : 'Adaugă element...'}
            className="h-7 text-sm mt-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addItem(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Notes Widget
  if (config.type === 'notes') {
    const notes = (currentData.notes as string) || '';

    return (
      <Card className="glass-card">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </div>
              )}
              <div className={`p-1.5 rounded-full ${colorClasses}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">{widget.name}</CardTitle>
            </div>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <textarea
            value={notes}
            onChange={(e) => handleValueChange('notes', e.target.value)}
            className="w-full h-24 p-2 text-sm bg-background/50 rounded-lg border resize-none"
            placeholder={language === 'en' ? 'Write your notes...' : 'Scrie notițele tale...'}
          />
        </CardContent>
      </Card>
    );
  }

  // Default fallback
  return (
    <Card className="glass-card">
      <CardContent className="p-4 text-center">
        <IconComponent className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm">{widget.name}</p>
        <p className="text-xs text-muted-foreground">
          {language === 'en' ? 'Widget type not supported' : 'Tip de widget nesuportat'}
        </p>
      </CardContent>
    </Card>
  );
}
