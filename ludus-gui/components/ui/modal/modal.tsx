"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"
import { IconButton } from "@/components/ui/icon-button"

// Modal Context
type ModalContextType = {
  isOpen: boolean
  close: () => void
  titleId: string
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined)

function useModalContext() {
  const context = React.useContext(ModalContext)
  if (!context) {
    throw new Error("Modal components must be used within a Modal")
  }
  return context
}

// Modal Root Component
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Modal({ open, onOpenChange, children }: ModalProps) {
  const [mounted, setMounted] = React.useState(false)
  const titleId = React.useId()

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const close = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  if (!mounted || !open) {
    return null
  }

  return (
    <ModalContext.Provider value={{ isOpen: open, close, titleId }}>
      {createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          {children}
        </div>,
        document.body,
      )}
    </ModalContext.Provider>
  )
}

// Modal Content Component
interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showClose?: boolean
}

function ModalContent({ className, children, size = "md", showClose = true, ...props }: ModalContentProps) {
  const { close } = useModalContext()

  return (
    <div
      className={cn(
        "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg",
        {
          "max-w-sm": size === "sm",
          "max-w-lg": size === "md",
          "max-w-2xl": size === "lg",
          "max-w-4xl": size === "xl",
          "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]": size === "full",
        },
        className,
      )}
      {...props}
    >
      {children}
      {showClose && (
        <IconButton
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={close}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </IconButton>
      )}
    </div>
  )
}

// Modal Header Component
type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>

function ModalHeader({ className, children, ...props }: ModalHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
      {children}
    </div>
  )
}

// Modal Title Component
type ModalTitleProps = React.HTMLAttributes<HTMLHeadingElement>

function ModalTitle({ className, children, ...props }: ModalTitleProps) {
  const { titleId } = useModalContext()
  return (
    <h2 id={titleId} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
      {children}
    </h2>
  )
}

// Modal Description Component
type ModalDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

function ModalDescription({ className, children, ...props }: ModalDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  )
}

// Modal Footer Component
type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>

function ModalFooter({ className, children, ...props }: ModalFooterProps) {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}>
      {children}
    </div>
  )
}

export {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  type ModalProps,
  type ModalContentProps,
  type ModalHeaderProps,
  type ModalTitleProps,
  type ModalDescriptionProps,
  type ModalFooterProps,
}
