
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LockKeyhole } from "lucide-react";

interface CourseIframeProps {
  isOpen: boolean;
  onClose: () => void;
  courseUrl: string;
  courseTitle: string;
  isLocked?: boolean;
  purchaseUrl?: string;
}

export const CourseIframe: React.FC<CourseIframeProps> = ({ 
  isOpen, 
  onClose, 
  courseUrl, 
  courseTitle,
  isLocked = false,
  purchaseUrl
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isLocked && <LockKeyhole className="h-5 w-5 text-amber-500" />}
            {!isLocked && <ShieldCheck className="h-5 w-5 text-green-500" />}
            {courseTitle}
          </DialogTitle>
        </DialogHeader>
        
        {isLocked ? (
          <div className="h-full flex-1 flex flex-col items-center justify-center space-y-4 p-6 text-center">
            <LockKeyhole className="h-16 w-16 text-amber-500 mb-2" />
            <h3 className="text-xl font-semibold">This course is locked</h3>
            <p className="text-muted-foreground max-w-md">
              You don't have access to this course yet. Purchase access to unlock this content.
            </p>
            {purchaseUrl && (
              <Button className="mt-4" asChild>
                <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
                  Purchase Access
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full flex-1 overflow-hidden rounded border border-muted">
            <iframe 
              src={courseUrl}
              className="w-full h-full"
              title={courseTitle}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
