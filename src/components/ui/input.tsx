import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-xl text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-input bg-background px-4 py-2 h-11 hover:border-primary/50",
        glass: "glass-input px-4 py-2 h-11 hover:border-primary/30 focus:bg-background/60",
        filled: "bg-muted border-transparent px-4 py-2 h-11 hover:bg-muted/80 focus:bg-background focus:border-primary/50",
        outline: "border-2 border-input bg-transparent px-4 py-2 h-11 hover:border-primary/50 focus:border-primary",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  }
)

export interface InputProps
  extends React.ComponentProps<"input">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
