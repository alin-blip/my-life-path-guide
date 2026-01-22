import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VibeCanvasFooterProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const VibeCanvasFooter: React.FC<VibeCanvasFooterProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <motion.footer 
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="h-12 bg-[#1a1a2e] border-t border-white/10 flex items-center justify-between px-4"
      >
        {/* Left - Page indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Page 1 of 1</span>
        </div>

        {/* Center - Zoom controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={onZoomOut}
                disabled={zoom <= 25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2a2a3e] border-white/10">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <button
            className="px-3 py-1 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors min-w-[60px]"
            onClick={onZoomReset}
          >
            {zoom}%
          </button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={onZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2a2a3e] border-white/10">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-white/10 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                onClick={onZoomReset}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#2a2a3e] border-white/10">
              <p>Fit to Screen</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right - Keyboard shortcuts hint */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/30">
            Ctrl+Z: Undo • Ctrl+Shift+Z: Redo • Delete: Remove
          </span>
        </div>
      </motion.footer>
    </TooltipProvider>
  );
};
