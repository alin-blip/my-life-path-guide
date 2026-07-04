import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MousePointer2, 
  Hand,
  Pencil, 
  Highlighter, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  Triangle, 
  Star,
  Minus,
  ArrowRight,
  StickyNote,
  Trash2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ToolType } from './VibeCanvas';

interface VibeCanvasToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
}

const tools: { id: ToolType; icon: React.ElementType; label: string; shortcut?: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'pan', icon: Hand, label: 'Pan / Move', shortcut: 'Space' },
  { id: 'pencil', icon: Pencil, label: 'Pencil', shortcut: 'P' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note', shortcut: 'N' },
];

const shapes: { id: ToolType; icon: React.ElementType; label: string }[] = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
];

const presetColors = [
  '#ffffff', '#000000', '#ff4444', '#ff8844', '#ffff44',
  '#44ff44', '#44ffff', '#4488ff', '#8844ff', '#ff44ff',
  '#ffcccc', '#ffe4cc', '#ffffcc', '#ccffcc', '#ccffff',
  '#cce4ff', '#e4ccff', '#ffccff', '#888888', '#444444',
];

export const VibeCanvasToolbar: React.FC<VibeCanvasToolbarProps> = ({
  activeTool,
  onToolSelect,
  activeColor,
  onColorChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
}) => {
  const [showShapes, setShowShapes] = useState(false);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div 
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-16 bg-[#1a1a2e] border-r border-white/10 flex flex-col items-center py-4 gap-1"
      >
        {/* Main Tools */}
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`w-11 h-11 rounded-lg transition-all ${
                  activeTool === tool.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => onToolSelect(tool.id)}
              >
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2a2a3e] border-white/10">
              <p>{tool.label} {tool.shortcut && <span className="text-white/70 ml-1">({tool.shortcut})</span>}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 my-2" />

        {/* Shapes Popover */}
        <Popover open={showShapes} onOpenChange={setShowShapes}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-11 h-11 rounded-lg transition-all ${
                    ['rectangle', 'circle', 'triangle', 'star', 'line', 'arrow'].includes(activeTool)
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Square className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2a2a3e] border-white/10">
              <p>Shapes</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent 
            side="right" 
            className="w-auto p-2 bg-[#2a2a3e] border-white/10"
          >
            <div className="grid grid-cols-3 gap-1">
              {shapes.map((shape) => (
                <Button
                  key={shape.id}
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 text-white/60 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    onToolSelect(shape.id);
                    setShowShapes(false);
                  }}
                >
                  <shape.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 my-2" />

        {/* Fill Color */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <div 
                    className="w-6 h-6 rounded-md border-2 border-white/30"
                    style={{ backgroundColor: activeColor }}
                  />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2a2a3e] border-white/10">
              <p>Fill Color</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent 
            side="right" 
            className="w-auto p-3 bg-[#2a2a3e] border-white/10"
          >
            <div className="space-y-3">
              <p className="text-xs text-white/60 font-medium">Fill Color</p>
              <div className="grid grid-cols-5 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      activeColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-white/70" />
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-8 cursor-pointer rounded bg-transparent"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Stroke Color */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-11 h-11 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <div 
                    className="w-6 h-6 rounded-md border-3"
                    style={{ borderColor: strokeColor, backgroundColor: 'transparent' }}
                  />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#2a2a3e] border-white/10">
              <p>Stroke Color</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent 
            side="right" 
            className="w-auto p-3 bg-[#2a2a3e] border-white/10"
          >
            <div className="space-y-3">
              <p className="text-xs text-white/60 font-medium">Stroke Color</p>
              <div className="grid grid-cols-5 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      strokeColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onStrokeColorChange(color)}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs text-white/60">Stroke Width: {strokeWidth}px</p>
                <Slider
                  value={[strokeWidth]}
                  onValueChange={([value]) => onStrokeWidthChange(value)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Clear */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-11 h-11 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
              onClick={onClear}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#2a2a3e] border-white/10">
            <p>Clear Canvas</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
};
