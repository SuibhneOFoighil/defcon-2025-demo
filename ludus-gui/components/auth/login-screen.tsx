"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useTheme } from "next-themes"
import Image from "next/image"

export function LoginScreen() {
  const [view, setView] = useState<"login" | "forgot-password">("login")
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before using theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use default logo during SSR/hydration, then switch to theme-appropriate logo
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')
  const logoSrc = mounted ? (isDark ? '/Luuds_icon_white.svg' : '/Ludus_icon_black.svg') : '/Ludus_icon_black.svg'

  // Switch to forgot password view
  const handleForgotPassword = () => {
    setView("forgot-password")
  }

  // Switch back to login view
  const handleBackToLogin = () => {
    setView("login")
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left side - Logo and background */}
      <div className="hidden w-1/2 items-center justify-center bg-muted/30 dark:bg-black lg:flex">
        <div className="p-8 flex flex-col items-center">
          <div className="flex-shrink-0">
            <Image
              src={logoSrc}
              alt="Ludus Logo"
              width={160}
              height={120}
              className="w-[10vw] h-auto min-w-[120px] max-w-[200px] transition-all duration-200 ease-in-out"
              priority
            />
          </div>
          <div className="mt-8 flex flex-col items-center">
            <span className="text-[2.5vw] font-bold text-foreground tracking-wide lg:text-3xl xl:text-4xl">
              LUDUS
            </span>
            <span className="mt-2 text-[1vw] text-muted-foreground font-medium tracking-wider lg:text-base xl:text-lg">
              CYBER RANGES
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col justify-center bg-white dark:bg-background px-4 sm:px-6 md:px-8 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {view === "login" ? (
            <LoginForm onForgotPassword={handleForgotPassword} />
          ) : (
            <ForgotPasswordForm onBack={handleBackToLogin} />
          )}
        </div>
      </div>
    </div>
  )
}
