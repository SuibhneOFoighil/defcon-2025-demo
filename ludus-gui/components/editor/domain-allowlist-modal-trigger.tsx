"use client"

import { useState } from "react"
import { DomainAllowlistModal } from "./domain-allowlist-modal"

interface DomainAllowlistModalTriggerProps {
  userID: string
  allowedDomains: string[]
  allowedIPs?: string[]
  children: React.ReactNode
}

export function DomainAllowlistModalTrigger({ 
  userID,
  allowedDomains,
  allowedIPs = [],
  children 
}: DomainAllowlistModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <DomainAllowlistModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userID={userID}
        initialDomains={allowedDomains}
        initialIPs={allowedIPs}
      />
    </>
  )
}