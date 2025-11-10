import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, History, FileDown, BarChart, Trash2 } from 'lucide-react';

interface DoorActionsMenuProps {
  onViewHistory: () => void;
  onExportPDF: () => void;
  onViewAnalytics: () => void;
  onDelete: () => void;
  disabled?: boolean;
  isMobile?: boolean;
}

export const DoorActionsMenu: React.FC<DoorActionsMenuProps> = ({
  onViewHistory,
  onExportPDF,
  onViewAnalytics,
  onDelete,
  disabled = false,
  isMobile = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isMobile ? 'sm' : 'default'}
          className="gap-2 border-border/50 hover:border-border hover:bg-accent/50"
          disabled={disabled}
        >
          <MoreVertical className="w-4 h-4" />
          {!isMobile && <span>Acțiuni</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-lg z-50">
        <DropdownMenuItem 
          onClick={onViewHistory}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <History className="w-4 h-4 mr-2" />
          Istoric Planuri
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onExportPDF}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onViewAnalytics}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          onClick={onDelete}
          className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Șterge Focus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
