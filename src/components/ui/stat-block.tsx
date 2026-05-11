import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * StatBlock — large gold number + hairline + small caption.
 * Used for KPIs, counts, headline metrics.
 */
export interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  value: React.ReactNode;
  label: React.ReactNode;
  suffix?: React.ReactNode;
  align?: "left" | "center";
}

export const StatBlock = React.forwardRef<HTMLDivElement, StatBlockProps>(
  ({ className, value, label, suffix, align = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
      {...props}
    >
      <div className="font-display text-5xl font-bold leading-none text-primary md:text-6xl">
        {value}
        {suffix && (
          <span className="ml-1 font-mono text-2xl text-primary/70">{suffix}</span>
        )}
      </div>
      <div className="h-px w-12 bg-border" />
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
)
StatBlock.displayName = "StatBlock"
