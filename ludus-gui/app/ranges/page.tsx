"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { RangesViewer } from "@/components/ranges/ranges-viewer"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { CreateRangeWizard } from "@/components/wizards/create-range-wizard"
import { useRangesAndTemplates } from "@/hooks/use-range-and-templates"
import { Plus } from "lucide-react"
import { RangesSectionSkeleton } from "@/components/ranges/ranges-section-skeleton"
import { SystemSummaryStats } from "@/components/ranges/system-summary-stats"

export default function RangesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showRangeWizard, setShowRangeWizard] = useState(false)
  const { ranges, loading, invalidateRanges, systemSummary } = useRangesAndTemplates()

  // Filter ranges based on search
  const filteredRanges = ranges.filter(range =>
    (range.userID?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (range.rangeNumber?.toString() || '').includes(searchTerm.toLowerCase()) ||
    (range.rangeState?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <PageHeader 
        title="Ranges" 
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* System Overview */}
          <SystemSummaryStats 
            summary={systemSummary} 
            isLoading={loading}
          />

          {loading ? (
            <RangesSectionSkeleton />
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search ranges..."
                  className="max-w-md"
                />
                <Button
                  onClick={() => setShowRangeWizard(true)}
                  variant="elevated"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Range
                </Button>
              </div>

              {/* Ranges Content */}
              <RangesViewer
                data={filteredRanges}
                isLoading={loading}
                enablePagination={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* Wizards */}
      <CreateRangeWizard
        open={showRangeWizard}
        onOpenChange={setShowRangeWizard}
        onSuccess={invalidateRanges}
      />
    </>
  )
}