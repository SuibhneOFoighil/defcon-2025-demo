"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MoreVertical } from "lucide-react"

interface NetworkTopologySkeletonProps {
  showHeader?: boolean
  showSidebar?: boolean
  showCanvas?: boolean
  showPropertiesPanel?: boolean
}

export function NetworkTopologySkeleton({
  showHeader = true,
  showSidebar = true, 
  showCanvas = true,
  showPropertiesPanel = false
}: NetworkTopologySkeletonProps) {
  return (
    <div className="flex flex-col h-screen bg-card">
      {/* Header Skeleton - matching current design */}
      {showHeader ? (
        <header className="shrink-0 z-10 bg-card/60 backdrop-blur-sm border-b border-border/60">
          <div className="p-3">
            <div className="flex justify-between items-center">
              {/* Left side - Range info */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  disabled
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  {/* Range name and status badge */}
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>

                {/* Resource metrics block */}
                <Skeleton className="h-6 w-48 rounded-md" />

                {/* Range details icon skeleton */}
                <Skeleton className="h-7 w-7 rounded-full" />
                </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center space-x-3">
                {/* Testing Mode Toggle Button Skeleton */}
                <Skeleton className="h-9 w-[120px] rounded-md" />

                {/* Deploy Button Skeleton */}
                <Skeleton className="h-9 w-[120px] rounded-md" />

                {/* Range Actions Menu Skeleton */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 flex items-center justify-center"
                  disabled
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Notification Bell Skeleton */}
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          </div>
        </header>
      ) : (
        <Skeleton className="h-14 w-full" />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Skeleton */}
        {showSidebar ? (
          <div className="border-r border-border bg-card h-full flex flex-col w-[280px] flex-shrink-0">
            <div className="p-4 flex flex-col">
              {/* Header skeleton */}
              <div className="flex items-center justify-between w-full text-left mb-4">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              
              {/* Add VLAN button skeleton */}
              <div className="mb-4 h-9 flex-shrink-0">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
              
              {/* Search bar skeleton */}
              <div className="mb-4 flex-shrink-0">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
            
            {/* Template cards */}
            <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-3 bg-[hsl(var(--card-bg))] rounded-lg border border-[hsl(var(--card-border))]">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Skeleton className="w-[280px] h-full" />
        )}

        {/* Main Canvas Skeleton */}
        {showCanvas ? (
          <div className="flex-1 relative bg-muted/20">
            {/* Canvas skeleton with node placeholders */}
            <div className="absolute inset-0 p-8">
              {/* Node skeletons removed */}
            </div>

            {/* Mini map skeleton */}
            <div className="absolute top-6 right-6">
              <Skeleton className="h-24 w-32 rounded border border-border" />
            </div>

            {/* Zoom controls skeleton */}
            <div className="absolute bottom-6 left-6">
              <div className="flex flex-col items-center bg-card border border-border rounded p-1 shadow-md">
                <Skeleton className="h-4 w-4 mb-2" />
                <div className="h-px w-4 bg-border mb-2" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>

            {/* Floating action button skeleton */}
            <div className="absolute bottom-6 right-6">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ) : (
          <Skeleton className="flex-1 h-full" />
        )}

        {/* Right Properties Panel Skeleton */}
        {showPropertiesPanel && (
          <div className="w-80 border-l border-border bg-card/50 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function ComponentSidebarSkeleton() {
  return (
    <div className="border-r border-border bg-card h-full flex flex-col w-[280px] flex-shrink-0">
      <div className="p-4 flex flex-col">
        {/* Header skeleton */}
        <div className="flex items-center justify-between w-full text-left mb-4">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-6 rounded-full" />
        </div>
        
        {/* Add VLAN button skeleton */}
        <div className="mb-4 h-9 flex-shrink-0">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        
        {/* Search bar skeleton */}
        <div className="mb-4 flex-shrink-0">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
      
      {/* Template cards */}
      <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 bg-[hsl(var(--card-bg))] rounded-lg border border-[hsl(var(--card-border))]">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3.5 w-3.5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FlowCanvasSkeleton() {
  return (
    <div className="flex-1 relative bg-muted/20">
      <div className="absolute inset-0 p-8">
        {/* Node skeletons removed */}
      </div>

      {/* Mini map skeleton */}
      <div className="absolute top-6 right-6">
        <Skeleton className="h-24 w-32 rounded border border-border" />
      </div>

      {/* Zoom controls skeleton */}
      <div className="absolute bottom-6 left-6">
        <div className="flex flex-col items-center bg-card border border-border rounded p-1 shadow-md">
          <Skeleton className="h-4 w-4 mb-2" />
          <div className="h-px w-4 bg-border mb-2" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>

      {/* Floating action button skeleton */}
      <div className="absolute bottom-6 right-6">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  )
}