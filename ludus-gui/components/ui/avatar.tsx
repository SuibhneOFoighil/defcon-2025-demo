"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from 'next/image'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  status?: "online" | "offline" | "away" | "busy"
}

const getFallbackTextSizeClass = (size: AvatarProps['size']) => {
  switch (size) {
    case "xs":
      return "text-[0.625rem]"; // 10px
    case "sm":
      return "text-xs"; // 12px
    case "md":
      return "text-sm"; // 14px
    case "lg":
      return "text-base"; // 16px
    case "xl":
      return "text-lg"; // 18px
    default:
      return "text-sm";
  }
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", fallback, size = "md", status, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full",
          {
            "h-6 w-6": size === "xs",       // 24px
            "h-8 w-8": size === "sm",       // 32px
            "h-10 w-10": size === "md",     // 40px
            "h-12 w-12": size === "lg",     // 48px
            "h-16 w-16": size === "xl",     // 64px
          },
          className,
        )}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 64px) 10vw, 64px"
            className={cn("object-cover", className)}
            onError={() => setImageError(true)}
            unoptimized={true}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            {fallback ? (
              <span className={cn("font-medium uppercase", getFallbackTextSizeClass(size))}>{fallback}</span>
            ) : (
              <svg className="h-1/2 w-1/2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>
        )}
        {status && (
          <span
            className={cn("absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-background", {
              // Consider making status dot size and border responsive too if needed later
              "bg-[hsl(var(--success))]": status === "online",
              "bg-[hsl(var(--muted-foreground))]": status === "offline", // Or a specific gray like hsl(var(--grey)) if defined
              "bg-[hsl(var(--warning))]": status === "away",
              "bg-[hsl(var(--destructive))]": status === "busy",
            })}
          />
        )}
      </div>
    )
  },
)
Avatar.displayName = "Avatar"

export { Avatar, type AvatarProps }
