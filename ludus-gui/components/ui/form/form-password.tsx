"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { FormInput } from "./form-input"
import type { FormInputProps } from "./form-input"

export interface FormPasswordProps extends Omit<FormInputProps, "type"> {
  showPassword?: boolean
  onToggleVisibility?: () => void
  leftIcon?: React.ReactNode
}

export function FormPassword({
  showPassword = false,
  onToggleVisibility,
  leftIcon = <Lock size={16} className="text-muted-foreground" />,
  ...props
}: FormPasswordProps) {
  const [showPasswordState, setShowPasswordState] = useState(showPassword)

  const handleToggleVisibility = () => {
    if (onToggleVisibility) {
      onToggleVisibility()
    } else {
      setShowPasswordState(!showPasswordState)
    }
  }

  return (
    <FormInput
      type={showPasswordState ? "text" : "password"}
      leftIcon={leftIcon}
      rightIcon={
        <button
          type="button"
          onClick={handleToggleVisibility}
          className="text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label={showPasswordState ? "Hide password" : "Show password"}
        >
          {showPasswordState ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...props}
    />
  )
}
