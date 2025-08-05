"use client"

import * as React from "react";
import { PROTECTED_ROUTES } from "@/lib/routes";
import { RangesCard } from "./ranges-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { components } from '@/lib/api/ludus/schema';
import { Button } from "@/components/ui/button";

type RangeObject = components['schemas']['RangeObject'];

// Transform RangeObject to RangeItem for card view
interface RangeItem {
  id: string;
  name: string;
  labTemplate: string;
  state: "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "ACTIVE" | "NEVER DEPLOYED" | "UNKNOWN";
  vmsRunning: number;
  vmsTotal: number;
  lastUse: string;
}

interface RangesViewerProps {
  data?: RangeObject[];
  isLoading?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

export function RangesViewer({ 
  data = [], 
  isLoading = false,
  enablePagination = true, 
  pageSize = 10
}: RangesViewerProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Transform data for card view
  const transformToCardData = (ranges: RangeObject[]): RangeItem[] => {
    return ranges.map(range => {
      const poweredOnVMs = range.VMs?.filter(vm => vm.poweredOn).length || 0;
      const totalVMs = range.numberOfVMs || 0;

      return {
        id: `${range.userID}-${range.rangeNumber}`,
        name: `Range ${range.rangeNumber}`,
        labTemplate: `User: ${range.userID}`,
        state: (range.rangeState?.toUpperCase() as "SUCCESS" | "FAILURE" | "ERROR" | "PENDING" | "ACTIVE" | "NEVER DEPLOYED") || "UNKNOWN",
        vmsRunning: poweredOnVMs,
        vmsTotal: totalVMs,
        lastUse: range.lastDeployment
      };
    });
  };

  const cardData = transformToCardData(data);

  const handleCardNavigate = (id: string) => {
    const range = data.find(r => `${r.userID}-${r.rangeNumber}` === id);
    if (range) {
      console.log('Navigate to range editor:', id);
      // Navigate to range editor using composite range ID
      window.location.href = `${PROTECTED_ROUTES.EDITOR_BASE}/${id}`;
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = enablePagination ? cardData.slice(startIndex, endIndex) : cardData;
  const totalPages = enablePagination ? Math.ceil(cardData.length / pageSize) : 1;

  return (
    <>
      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedData.map((item) => (
              <RangesCard
                key={item.id}
                item={item}
                onNavigate={handleCardNavigate}
              />
            ))}
          </div>

          {/* Empty state */}
          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No ranges found</p>
            </div>
          )}

          {/* Pagination */}
          {enablePagination && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, cardData.length)} of {cardData.length} ranges
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
} 