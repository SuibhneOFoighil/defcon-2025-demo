"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { FormInput } from "@/components/ui/form/form-input"
import { Button } from "@/components/ui/button"

interface ForgotPasswordFormProps {
  onBack: () => void
  className?: string
}

export function ForgotPasswordForm({ onBack, className }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // TODO: Replace with real forgot password API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Forgot password?</h1>
        <p className="mt-2 text-muted-foreground">
          {isSubmitted ? "Check your email for a reset link." : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:border dark:border-red-500/50 dark:text-red-200">
              {error}
            </div>
          )}

          <FormInput
            label="Email address"
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Button type="submit" variant="elevated" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to sign in
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/30 dark:border dark:border-green-500/50 dark:text-green-200">
            Reset link sent! Check your email.
          </div>

          <Button type="button" variant="elevated" className="w-full" onClick={onBack}>
            Back to sign in
          </Button>
        </div>
      )}
    </div>
  )
}
