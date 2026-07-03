import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * ResponsiveModal
 * - Desktop/tablet: standard centered Dialog
 * - Mobile (<768px): bottom sheet with drag-handle affordance and safe-area padding
 *
 * Drop-in replacement for Dialog in most places. Use the same primitives
 * (Header, Title, Description, Footer) exported from this file so children
 * render correctly in both modes.
 */

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  /** Max height on mobile as CSS value. Default 90vh */
  mobileMaxHeight?: string;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  open,
  onOpenChange,
  children,
  className,
  mobileMaxHeight = "90vh",
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "rounded-t-2xl border-t p-0 flex flex-col gap-0",
            "safe-bottom",
            className
          )}
          style={{ maxHeight: mobileMaxHeight }}
        >
          {/* Drag handle affordance */}
          <div className="pt-2 pb-1 flex justify-center shrink-0">
            <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="px-5 pb-5 pt-2 overflow-y-auto flex-1">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>{children}</DialogContent>
    </Dialog>
  );
};

// Re-export normalized primitives so consumers write once and it works in both modes.
export const ResponsiveModalHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetHeader className={cn("text-left space-y-1.5", className)} {...props} />
  ) : (
    <DialogHeader className={className} {...props} />
  );
};

export const ResponsiveModalTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetTitle className={cn("text-left text-lg", className)} {...props} />
  ) : (
    <DialogTitle className={className} {...props} />
  );
};

export const ResponsiveModalDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetDescription className={cn("text-left", className)} {...props} />
  ) : (
    <DialogDescription className={className} {...props} />
  );
};

export const ResponsiveModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <SheetFooter
      className={cn("flex-col-reverse gap-2 pt-4", className)}
      {...props}
    />
  ) : (
    <DialogFooter className={className} {...props} />
  );
};
