"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormCheckbox } from "@/components/ui/form/form-checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconButton } from "@/components/ui/icon-button"

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string, confirmPassword: string, sendEmail: boolean) => void
  userName: string
}

export function ResetPasswordModal({ isOpen, onClose, onConfirm, userName }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    onConfirm(password, confirmPassword, sendEmail)
    onClose()
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Reset Password</ModalTitle>
        </ModalHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter a new password for {userName}. The user will need to change their password on next login.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormInput
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            rightIcon={
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconButton>
            }
          />

          <FormInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setError(null)
            }}
            rightIcon={
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleShowConfirmPassword}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </IconButton>
            }
          />

          <FormCheckbox
            label="Email new password to user"
            checked={sendEmail}
            onChange={() => setSendEmail(!sendEmail)}
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="elevated" onClick={handleSubmit} disabled={!password || !confirmPassword}>
            Reset
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
