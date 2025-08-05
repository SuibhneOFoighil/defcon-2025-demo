"use client"

import { useState } from "react"
import { DestroyVMsModal } from "./destroy-vms-modal"

interface DestroyVMsModalTriggerProps {
  rangeName: string
  vmCount: number
  isDestroying: boolean
  onConfirm: () => void
  children: React.ReactNode
}

export function DestroyVMsModalTrigger({ 
  rangeName,
  vmCount,
  isDestroying,
  onConfirm,
  children 
}: DestroyVMsModalTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <DestroyVMsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        rangeName={rangeName}
        vmCount={vmCount}
        isDestroying={isDestroying}
      />
    </>
  )
}