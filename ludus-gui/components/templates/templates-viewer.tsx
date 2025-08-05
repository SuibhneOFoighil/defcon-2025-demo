"use client"

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TemplatesCard } from "./templates-card";
import { Button } from "@/components/ui/button";
import type { TemplateObject, TemplateItem } from "@/lib/types/template";

interface TemplatesViewerProps {
  data?: TemplateObject[];
  isLoading?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

export function TemplatesViewer({ 
  data = [], 
  isLoading = false,
  enablePagination = true,
  pageSize = 10
}: TemplatesViewerProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to first page when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Transform data for card view
  const transformToCardData = (templates: TemplateObject[]): TemplateItem[] => {
    return templates.map(template => {
      // Map boolean built to card built format
      let built: "built" | "building" | "failed" | "not-built" = "not-built";
      if (template.built) {
        built = "built";
      }

      return {
        id: template.name,
        name: template.name,
        built
      };
    });
  };

  const cardData = transformToCardData(data);


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
              <TemplatesCard
                key={item.id}
                item={item}
              />
            ))}
          </div>

          {/* Empty state */}
          {paginatedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}

          {/* Pagination */}
          {enablePagination && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, cardData.length)} of {cardData.length} templates
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