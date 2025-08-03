
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  TextIcon,
  MousePointerIcon,
  PencilIcon,
  Trash2Icon
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CanvasControlsProps {
  activeTool: 'select' | 'text' | 'draw';
  onToolChange: (tool: 'select' | 'text' | 'draw') => void;
  onColorChange: (color: string) => void;
  activeColor: string;
  onClear: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  activeTool,
  onToolChange,
  onColorChange,
  activeColor,
  onClear
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <TooltipProvider>
        <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('select')}
              >
                <MousePointerIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select & Move (V)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('text')}
              >
                <TextIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add Text (T)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'draw' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onToolChange('draw')}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Draw (D)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-8 h-8 border-0 p-0 cursor-pointer rounded-md"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change Color</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
