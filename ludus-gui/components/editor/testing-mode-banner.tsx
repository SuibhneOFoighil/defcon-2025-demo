"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TestingModeBannerProps {
  onConfigureAllowlist: () => void
}

export function TestingModeBanner({ onConfigureAllowlist }: TestingModeBannerProps) {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 py-1.5 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          Range is in Testing Mode – internet access blocked
        </span>
        <Button
          variant="link"
          size="sm"
          className="text-amber-600 dark:text-amber-400 h-auto p-0 ml-2 text-xs underline"
          onClick={onConfigureAllowlist}
        >
          Configure domain allowlist
        </Button>
      </div>
    </div>
  )
}
