import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Card } from "@/components/ui/card/card-components"

interface ResourceCardProps {
  title: string
  value: string
  icon?: ReactNode
  className?: string
}

export function ResourceCard({ title, value, icon, className }: ResourceCardProps) {
  return (
    <Card className={cn(className)} padding="md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </Card>
  )
}
