"use client";

import * as React from "react";
import { DataGrid, DataGridPagination, type Column } from "@/components/ui/data-grid/data-grid";
import { TableHeader } from "./table-header";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { MoreHorizontal } from "lucide-react";
import { useTableSelection } from "@/hooks/use-table-selection";
import { useTableContextMenu } from "@/hooks/use-table-context-menu";

export interface TableAction {
  label: string;
  onClick: (itemId: string) => void;
  destructive?: boolean;
  icon?: React.ReactNode;
  separator?: boolean;
}

export interface BaseTableItem {
  id: string;
}

export interface DataTableProps<T extends BaseTableItem> {
  data: T[];
  columns: Column<T & { isSelected: boolean }>[];
  keyField: keyof T;
  title?: string;
  navigationPath: (id: string) => string;
  actions: TableAction[] | ((item: T) => TableAction[]); // Support dynamic actions
  getSelectionCount?: (data: T[]) => string; // Custom selection count display
  headerActions?: React.ReactNode; // Optional header actions (buttons, etc.)
  toggleComponent?: React.ReactNode; // Optional toggle component (e.g., ranges/templates)
  isLoading?: boolean;
  className?: string;
  // Pagination props
  enablePagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends BaseTableItem>({
  data = [],
  columns,
  keyField,
  title,
  navigationPath,
  actions,
  getSelectionCount,
  headerActions,
  toggleComponent,
  isLoading = false,
  className,
  enablePagination = false,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
}: DataTableProps<T>) {
  // Pagination logic
  const totalPages = enablePagination ? Math.ceil(data.length / pageSize) : 1;
  const paginatedData = enablePagination 
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  const { selectedItemIds, handleRowClick, dataWithSelection } = useTableSelection({
    data: paginatedData,
    navigationPath,
  });
  
  const { openMenuId, triggerRefs, handleMenuToggle, closeMenu, setTriggerRef } = useTableContextMenu();

  // Helper function to create properly sized icons
  const menuIcon = (icon: React.ReactNode) => {
    if (!icon) return undefined;
    return React.cloneElement(icon as React.ReactElement, {
      className: "h-4 w-4 stroke-[1.75]",
    } as React.SVGProps<SVGSVGElement>);
  };

  // Create actions column
  const actionsColumn: Column<T & { isSelected: boolean }> = {
    id: "actions",
    header: null,
    cell: (item) => {
      // Resolve actions for this specific item
      const itemActions = typeof actions === 'function' ? actions(item) : actions;
      
      return (
        <div className="flex justify-end items-center" onClick={(e) => e.stopPropagation()}>
          <Button
            ref={(el) => setTriggerRef(item.id, el)}
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            onClick={(e) => handleMenuToggle(item.id, e)}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu for {item.id}</span>
          </Button>
          {triggerRefs.current[item.id] && (
            <ContextMenu
              open={openMenuId === item.id}
              onClose={closeMenu}
              triggerRef={{ current: triggerRefs.current[item.id]! }}
              align="end"
            >
              {itemActions.map((action: TableAction) => (
                <React.Fragment key={action.label}>
                  <ContextMenuItem
                    icon={action.icon ? menuIcon(action.icon) : undefined}
                    destructive={action.destructive}
                    onClick={() => action.onClick(item.id)}
                  >
                    {action.label}
                  </ContextMenuItem>
                  {action.separator && <ContextMenuSeparator />}
                </React.Fragment>
              ))}
            </ContextMenu>
          )}
        </div>
      );
    },
    className: "w-[60px]",
  };

  // Combine provided columns with actions column
  const allColumns = [...columns, actionsColumn];

  return (
    <div className="space-y-4">
      <TableHeader
        title={getSelectionCount ? getSelectionCount(data) : title || ""}
        selectedItemsCount={selectedItemIds.length}
        headerActions={headerActions}
        toggleComponent={toggleComponent}
      />
      <DataGrid<T & { isSelected: boolean }>
        data={dataWithSelection}
        columns={allColumns}
        keyField={keyField}
        onRowClick={(item, event) => handleRowClick(item, event)}
        className={className}
        isLoading={isLoading}
      />
      {enablePagination && totalPages > 1 && (
        <DataGridPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange || (() => {})}
        />
      )}
    </div>
  );
} 