"use client"

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RolesCard } from "./roles-card";
import { Button } from "@/components/ui/button";
import type { AnsibleItem } from "@/lib/types/ansible";

interface RolesViewerProps {
  data?: AnsibleItem[];
  onViewDetails?: (item: AnsibleItem) => void;
  isLoading?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

export function RolesViewer({ 
  data = [], 
  onViewDetails,
  isLoading = false,
  enablePagination = true,
  pageSize = 12
}: RolesViewerProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = enablePagination ? data.slice(startIndex, endIndex) : data;
  const totalPages = enablePagination ? Math.ceil(data.length / pageSize) : 1;

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
            {paginatedData.map((item, index) => (
              <RolesCard
                key={`${item.name}-${item.type}-${index}`}
                item={item}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>

          {/* Empty state */}
          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {data.length === 0 ? "No roles or collections installed" : "No items match your search"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {enablePagination && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} items
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