import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button styles with variants
 */
export const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-transparent hover:bg-secondary",
        ghost: "bg-transparent hover:bg-secondary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export type ButtonStyleProps = VariantProps<typeof buttonStyles>

/**
 * Input styles with variants
 */
export const inputStyles = cva(
  "flex rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        filled: "border-transparent bg-secondary",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export type InputStyleProps = VariantProps<typeof inputStyles>

/**
 * Card styles with variants
 */
export const cardStyles = cva("rounded-lg border bg-card text-card-foreground shadow", {
  variants: {
    variant: {
      default: "border-border",
      outline: "border-2",
      ghost: "border-transparent shadow-none",
    },
    padding: {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
})

export type CardStyleProps = VariantProps<typeof cardStyles>

/**
 * Helper function to generate responsive class names
 */
export function responsive(base: string, sm?: string, md?: string, lg?: string, xl?: string) {
  return cn(base, sm && `sm:${sm}`, md && `md:${md}`, lg && `lg:${lg}`, xl && `xl:${xl}`)
}
