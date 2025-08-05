"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Server, Plus } from "lucide-react"
import { Modal, ModalContent, ModalHeader, ModalFooter } from "@/components/ui/modal/modal"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card/card-components"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { fetchAccessibleRanges, addRangeToGroup, groupQueryKeys } from "@/lib/api/ludus/groups"

interface Range {
  rangeNumber: number
  userID: string
  rangeState: string
}

interface AddRangesToGroupModalProps {
  open: boolean
  onClose: () => void
  groupId: string
  groupName: string
}

export function AddRangesToGroupModal({
  open,
  onClose,
  groupId,
  groupName
}: AddRangesToGroupModalProps) {
  const [selectedRanges, setSelectedRanges] = useState<Set<number>>(new Set())
  const [isAdding, setIsAdding] = useState(false)
  const queryClient = useQueryClient()

  // Fetch accessible ranges
  const { data: accessibleRanges = [], isLoading } = useQuery({
    queryKey: ['ranges', 'accessible'],
    queryFn: fetchAccessibleRanges,
    enabled: open,
  })

  // Get current group ranges to filter out already assigned ones
  const currentGroupRanges = queryClient.getQueryData<Range[]>([
    ...groupQueryKeys.detail(groupId), 
    'ranges'
  ]) || []
  
  const currentGroupRangeNumbers = new Set(
    currentGroupRanges.map(range => range.rangeNumber)
  )

  // Filter out ranges already in the group
  const availableRanges = accessibleRanges.filter(
    range => !currentGroupRangeNumbers.has(range.rangeNumber)
  )

  const handleRangeSelection = (rangeNumber: number) => {
    const newSelection = new Set(selectedRanges)
    if (newSelection.has(rangeNumber)) {
      newSelection.delete(rangeNumber)
    } else {
      newSelection.add(rangeNumber)
    }
    setSelectedRanges(newSelection)
  }

  const handleAddRanges = async () => {
    if (selectedRanges.size === 0) return

    setIsAdding(true)
    try {
      // Add each selected range to the group
      await Promise.all(
        Array.from(selectedRanges).map(rangeNumber => 
          addRangeToGroup(groupId, rangeNumber)
        )
      )

      // Invalidate group ranges query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: [...groupQueryKeys.detail(groupId), 'ranges']
      })

      toast.success("Ranges added", {
        description: `${selectedRanges.size} range(s) have been added to ${groupName}.`,
      })

      setSelectedRanges(new Set())
      onClose()
    } catch (error) {
      toast.error("Failed to add ranges", {
        description: error instanceof Error ? error.message : "An error occurred while adding ranges to the group.",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleClose = () => {
    setSelectedRanges(new Set())
    onClose()
  }

  return (
    <Modal open={open} onOpenChange={handleClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <span>Add Ranges to {groupName}</span>
          </div>
        </ModalHeader>

        <div className="flex-1 min-h-0 p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : availableRanges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Server className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-medium mb-1">No available ranges</h3>
              <p className="text-sm">All accessible ranges are already assigned to this group or no ranges are available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Select ranges to add to {groupName}. Only ranges not already in the group are shown.
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {availableRanges.map((range) => (
                  <Card 
                    key={range.rangeNumber}
                    className={`cursor-pointer transition-colors ${
                      selectedRanges.has(range.rangeNumber)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleRangeSelection(range.rangeNumber)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedRanges.has(range.rangeNumber)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedRanges.has(range.rangeNumber) && (
                            <Plus className="h-2.5 w-2.5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium">
                            Range {range.rangeNumber}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground">
                            User: {range.userID}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={range.rangeState === 'deployed' ? 'success' : 'secondary'} 
                        size="sm"
                      >
                        {range.rangeState}
                      </Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddRanges}
            disabled={selectedRanges.size === 0 || isAdding}
            loading={isAdding}
          >
            Add {selectedRanges.size > 0 && `${selectedRanges.size} `}Range{selectedRanges.size !== 1 ? 's' : ''}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}