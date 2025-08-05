"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Network, ExternalLink, ArrowRight } from "lucide-react"

interface NetworkConnectionsDialogProps {
  isOpen: boolean
  onClose: () => void
  vlanId: string
  vlanName: string
  connections: {
    id: string
    source: string
    target: string
    sourceName: string
    targetName: string
    connectionType: "accept" | "deny" | "drop"
  }[]
  onEditConnection: (edgeId: string) => void
}

export function NetworkConnectionsDialog({
  isOpen,
  onClose,
  vlanId,
  vlanName,
  connections,
  onEditConnection,
}: NetworkConnectionsDialogProps) {
  // Get connection type badge styling
  const getConnectionBadge = (type: "accept" | "deny" | "drop") => {
    switch (type) {
      case "accept":
        return "bg-green-500/20 text-green-600 border-green-500"
      case "deny":
        return "bg-red-500/20 text-red-600 border-red-500"
      case "drop":
        return "bg-amber-500/20 text-amber-600 border-amber-500"
      default:
        return "bg-muted text-muted-foreground border-muted-foreground"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center">
          <Network className="h-5 w-5 mr-2" />
          <DialogTitle>Network Connections for {vlanName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {connections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No network connections found for this VLAN.</p>
              <p className="text-sm mt-2">Connect this VLAN to other VLANs to see connections here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-3 bg-card rounded-md border border-border"
                >
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <span className="text-sm font-medium">
                        {connection.source === vlanId ? connection.sourceName : connection.targetName}
                      </span>
                      <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {connection.target === vlanId ? connection.targetName : connection.sourceName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getConnectionBadge(connection.connectionType)}`}
                    >
                      {connection.connectionType}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditConnection(connection.id)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
