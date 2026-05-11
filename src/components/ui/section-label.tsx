import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SectionLabel — uppercase eyebrow used above headlines.
 * Renders as: — LABEL TEXT  (gold, tracking-wider, 11px)
 */
export interface SectionLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: keyof JSX.IntrinsicElements;
}

export const SectionLabel = React.forwardRef<HTMLSpanElement, SectionLabelProps>(
  ({ className, children, as: Tag = "span", ...props }, ref) => {
    const Component = Tag as any;
    return (
      <Component
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary",
          className
        )}
        {...props}
      >
        <span aria-hidden className="text-primary">—</span>
        <span>{children}</span>
      </Component>
    );
  }
)
SectionLabel.displayName = "SectionLabel"
