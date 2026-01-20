
import * as React from "react"
import { KeyboardEvent } from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnterSubmit?: () => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onEnterSubmit, ...props }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Detect mobile device - on mobile, Enter creates new line instead of submitting
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (e.key === 'Enter' && !e.shiftKey && onEnterSubmit && !isMobile) {
        e.preventDefault();
        onEnterSubmit();
      }
      
      if (props.onKeyDown) {
        props.onKeyDown(e as any);
      }
    };
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
