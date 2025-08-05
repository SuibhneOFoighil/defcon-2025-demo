"use client"

import * as React from "react"
import { useState } from "react"
import {
  MoreVertical,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  Camera,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DestroyVMsModal } from "./destroy-vms-modal"
import { SnapshotsModal } from "./snapshots-modal"

interface RangeActionsMenuProps {
  powerOnMutation: { isPending: boolean }
  powerOffMutation: { isPending: boolean }
  destroyRangeMutation: { isPending: boolean }
  onPowerOnAll: () => void
  onPowerOffAll: () => void
  onDestroyAll: () => void
  // Props for destroy modal
  rangeName: string
  vmCount: number
  // Props for snapshots modal
  userId: string
}

export function RangeActionsMenu({
  powerOnMutation,
  powerOffMutation,
  destroyRangeMutation,
  onPowerOnAll,
  onPowerOffAll,
  onDestroyAll,
  rangeName,
  vmCount,
  userId,
}: RangeActionsMenuProps) {
  const [isDestroyModalOpen, setIsDestroyModalOpen] = useState(false)
  const [isSnapshotsModalOpen, setIsSnapshotsModalOpen] = useState(false)
  
  const isActionPending =
    powerOnMutation.isPending ||
    powerOffMutation.isPending ||
    destroyRangeMutation.isPending

  const handleDestroyClick = () => {
    setIsDestroyModalOpen(true)
  }

  const handleDestroyConfirm = () => {
    onDestroyAll()
    setIsDestroyModalOpen(false)
  }

  const handleSnapshotsClick = () => {
    setIsSnapshotsModalOpen(true)
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-2"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Range Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleSnapshotsClick}
          disabled={isActionPending}
        >
          <Camera className="h-4 w-4 mr-2" />
          Snapshot Manager
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onPowerOnAll}
          disabled={isActionPending}
        >
          {powerOnMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Power className="h-4 w-4 mr-2 text-green-600" />
          )}
          {powerOnMutation.isPending ? "Powering On..." : "Power On VMs"}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={onPowerOffAll}
          disabled={isActionPending}
        >
          {powerOffMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <PowerOff className="h-4 w-4 mr-2 text-orange-600" />
          )}
          {powerOffMutation.isPending ? "Powering Off..." : "Power Off VMs"}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleDestroyClick}
          disabled={isActionPending}
          className="text-destructive focus:text-destructive"
        >
          {destroyRangeMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-2" />
          )}
          {destroyRangeMutation.isPending ? "Destroying..." : "Destroy VMs"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
    <DestroyVMsModal
      isOpen={isDestroyModalOpen}
      onClose={() => setIsDestroyModalOpen(false)}
      onConfirm={handleDestroyConfirm}
      rangeName={rangeName}
      vmCount={vmCount}
      isDestroying={destroyRangeMutation.isPending}
    />
    
    <SnapshotsModal
      isOpen={isSnapshotsModalOpen}
      onClose={() => setIsSnapshotsModalOpen(false)}
      userId={userId}
    />
    </>
  )
} 