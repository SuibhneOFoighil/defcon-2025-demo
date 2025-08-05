"use client"

import { useTheme } from "@/lib/theme/theme-context"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      richColors={false}
      toastOptions={{
        duration: 6000, // Longer duration for error messages
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:max-w-lg group-[.toaster]:min-h-[60px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:whitespace-pre-wrap group-[.toast]:break-words group-[.toast]:text-sm group-[.toast]:leading-relaxed group-[.toast]:max-h-32 group-[.toast]:overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "border-[hsl(var(--success))] border-opacity-50 bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
          error: "border-[hsl(var(--destructive))] border-opacity-50 bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
