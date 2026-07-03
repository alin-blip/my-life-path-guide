import { ReactNode } from 'react';
import { ResponsiveModal, ResponsiveModalDescription, ResponsiveModalHeader, ResponsiveModalTitle } from '@/components/ui/responsive-modal';

interface StepConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function StepConfigDialog({
  open,
  onOpenChange,
  title,
  description,
  children
}: StepConfigDialogProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} className="max-w-md">
      
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          {description && (
            <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
          )}
        </ResponsiveModalHeader>
        <div className="py-4">
          {children}
        </div>
      
    </ResponsiveModal>
  );
}
