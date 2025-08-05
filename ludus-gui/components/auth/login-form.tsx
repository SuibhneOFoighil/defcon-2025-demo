"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { FormInput } from "@/components/ui/form/form-input"
import { Button } from "@/components/ui/button"
import { FormCheckbox } from "@/components/ui/form/form-checkbox"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  onForgotPassword: () => void
  className?: string
}

export function LoginForm({ onForgotPassword, className }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push("/")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-2 text-muted-foreground">Welcome back! Please enter your details.</p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/30 dark:border dark:border-red-500/50 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <FormInput
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
            leftIcon={<User className="h-4 w-4" />}
          />

          <FormInput
            label="Password"
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={togglePassword}
                className="text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <FormCheckbox
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            label="Remember me"
          />
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" variant="elevated" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </div>
  )
}
