"use client"

import { ConfirmModal } from "@/components/ui/modal/confirm-modal"

interface DeleteFirewallRuleDialogProps {
  open: boolean
  onOpenChange: () => void
  onConfirm: () => void
  ruleName: string
}

export function DeleteFirewallRuleDialog({ open, onOpenChange, onConfirm, ruleName }: DeleteFirewallRuleDialogProps) {
  return (
    <ConfirmModal
      open={open}
      onClose={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Firewall Rule"
      description={
        <span>
          Are you sure you want to delete the rule &quot;{ruleName}&quot;? This action cannot be undone.
        </span>
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      confirmVariant="destructive"
    />
  )
}
