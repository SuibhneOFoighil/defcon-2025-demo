import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 p-8 text-center",
        "bg-[hsl(var(--background))] rounded-md border border-[hsl(var(--border))]",
        className
      )}
    >
      {icon && (
        <div className="text-[hsl(var(--muted-foreground))] w-16 h-16 mb-4">
          {icon}
        </div>
      )}
      <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
        {title}
      </h2>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
} 