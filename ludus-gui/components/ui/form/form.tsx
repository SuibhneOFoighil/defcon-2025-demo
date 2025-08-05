"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Form Root Component
interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (data: Record<string, FormDataEntryValue>) => void
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ className, onSubmit, children, ...props }, ref) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (onSubmit) {
      const formData = new FormData(event.currentTarget)
      const data = Object.fromEntries(formData)
      onSubmit(data)
    }
  }

  return (
    <form ref={ref} className={cn("space-y-6", className)} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  )
})
Form.displayName = "Form"

// Form Section Component
type FormSectionProps = React.HTMLAttributes<HTMLDivElement>

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  )
})
FormSection.displayName = "FormSection"

// Form Field Component
type FormFieldProps = React.HTMLAttributes<HTMLDivElement>

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  )
})
FormField.displayName = "FormField"

// Form Label Component
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label ref={ref} className={cn("block text-sm font-medium", className)} {...props}>
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    )
  },
)
FormLabel.displayName = "FormLabel"

// Form Description Component
type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props}>
        {children}
      </p>
    )
  },
)
FormDescription.displayName = "FormDescription"

// Form Message Component
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: boolean
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, error = false, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-xs", error ? "text-red-500" : "text-muted-foreground", className)} {...props}>
        {children}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

// Form Footer Component
type FormFooterProps = React.HTMLAttributes<HTMLDivElement>

const FormFooter = React.forwardRef<HTMLDivElement, FormFooterProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center justify-end space-x-2", className)} {...props}>
      {children}
    </div>
  )
})
FormFooter.displayName = "FormFooter"

export {
  Form,
  FormSection,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  FormFooter,
  type FormSectionProps,
  type FormFieldProps,
  type FormLabelProps,
  type FormDescriptionProps,
  type FormMessageProps,
  type FormFooterProps,
}
