import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * HairlineDivider — 1px border-color separator with controlled spacing.
 */
export interface HairlineDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  spacing?: "sm" | "md" | "lg" | "none";
}

const spacingMap = {
  none: "",
  sm: "my-4",
  md: "my-8",
  lg: "my-16",
} as const;

const spacingMapVertical = {
  none: "",
  sm: "mx-4",
  md: "mx-8",
  lg: "mx-16",
} as const;

export const HairlineDivider = React.forwardRef<HTMLDivElement, HairlineDividerProps>(
  ({ className, orientation = "horizontal", spacing = "md", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? cn("h-px w-full bg-border", spacingMap[spacing])
          : cn("h-full w-px bg-border", spacingMapVertical[spacing]),
        className
      )}
      {...props}
    />
  )
)
HairlineDivider.displayName = "HairlineDivider"
