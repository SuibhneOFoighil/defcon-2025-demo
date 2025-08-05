"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image from 'next/image'

// Card Root Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "ghost"
  padding?: "none" | "sm" | "md" | "lg"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow",
          {
            "border-border": variant === "default",
            "border-2": variant === "outline",
            "border-transparent shadow-none": variant === "ghost",
            "p-0": padding === "none",
            "p-3": padding === "sm",
            "p-4": padding === "md",
            "p-6": padding === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
Card.displayName = "Card"

// Card Header Component
type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props}>
      {children}
    </div>
  )
})
CardHeader.displayName = "CardHeader"

// Card Title Component
type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, children, ...props }, ref) => {
  return (
    <h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h3>
  )
})
CardTitle.displayName = "CardTitle"

// Card Description Component
type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}>
        {children}
      </p>
    )
  },
)
CardDescription.displayName = "CardDescription"

// Card Content Component
type CardContentProps = React.HTMLAttributes<HTMLDivElement>

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  )
})
CardContent.displayName = "CardContent"

// Card Footer Component
type CardFooterProps = React.HTMLAttributes<HTMLDivElement>

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props}>
      {children}
    </div>
  )
})
CardFooter.displayName = "CardFooter"

// Card Media Component
interface CardMediaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'src'> {
  aspectRatio?: "auto" | "square" | "video" | "wide" | "portrait"
  overlay?: React.ReactNode
  src?: string
  alt?: string
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
  ({ className, src, alt = "", aspectRatio = "auto", overlay }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          {
            "aspect-square": aspectRatio === "square",
            "aspect-video": aspectRatio === "video",
            "aspect-[16/9]": aspectRatio === "wide",
            "aspect-[3/4]": aspectRatio === "portrait",
          },
          className,
        )}
      >
        <Image 
          src={src || "/placeholder.svg"}
          alt={alt}
          width={400}
          height={200}
          className="w-full h-full object-cover"
          unoptimized={true}
          priority={true}
        />
        {overlay && <div className="absolute inset-0">{overlay}</div>}
      </div>
    )
  },
)
CardMedia.displayName = "CardMedia"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
  type CardMediaProps,
}
