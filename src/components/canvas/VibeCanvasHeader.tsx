import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Download, 
  Share2, 
  Printer,
  Check,
  ChevronDown,
  FolderOpen,
  Sparkles,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface VibeCanvasHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onExport: (format: 'png' | 'jpg' | 'pdf') => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenProjects?: () => void;
  onOpenTemplates?: () => void;
  onNewProject?: () => void;
}

export const VibeCanvasHeader: React.FC<VibeCanvasHeaderProps> = ({
  title,
  onTitleChange,
  onExport,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenProjects,
  onOpenTemplates,
  onNewProject,
}) => {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const handleTitleSubmit = () => {
    onTitleChange(tempTitle || 'Untitled');
    setIsEditingTitle(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'Check out my Vibe Canvas!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <motion.header 
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-14 bg-[#1a1a2e] border-b border-white/10 flex items-center justify-between px-4"
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Projects Button */}
        {onOpenProjects && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
            onClick={onOpenProjects}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </Button>
        )}

        {/* New Project Button */}
        {onNewProject && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={onNewProject}
            title="New Project"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Templates Button */}
        {onOpenTemplates && (
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
            onClick={onOpenTemplates}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
        )}

        {/* Title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="h-8 w-48 bg-white/10 border-white/20 text-white"
              autoFocus
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTempTitle(title);
                  setIsEditingTitle(false);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-400"
              onClick={handleTitleSubmit}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            className="text-white/80 hover:text-white text-sm font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
          >
            {title}
          </button>
        )}

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            onClick={onUndo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
            onClick={onRedo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a3e] border-white/10">
            <DropdownMenuItem 
              className="text-white/80 hover:text-white focus:bg-white/10"
              onClick={() => onExport('png')}
            >
              Export as PNG
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-white/80 hover:text-white focus:bg-white/10"
              onClick={() => onExport('jpg')}
            >
              Export as JPG
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-white/80 hover:text-white focus:bg-white/10"
              onClick={() => onExport('pdf')}
            >
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 px-4 bg-primary hover:bg-primary/90 text-white text-sm"
          onClick={onSave}
        >
          Save
        </Button>
      </div>
    </motion.header>
  );
};
