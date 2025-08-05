"use client"

import React, { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal/modal"
import { FormCheckbox } from "@/components/ui/form/form-checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"

export interface MultiSelectItem {
  id: string;
  label: string;         // e.g., User name or Group name
  details?: string;      // e.g., User email or Group description (optional)
  avatarUrl?: string;    // Optional avatar image URL
  avatarFallback?: string; // Fallback text for avatar if no image or image fails to load
}

interface MultiSelectModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedItemIds: string[]) => void;
  title: string;
  description?: string;
  items: MultiSelectItem[];
  confirmButtonText?: string;
  cancelButtonText?: string;
  emptyStateText?: string;
  modalSize?: "sm" | "md" | "lg"; // Allow modal size customization
}

export function MultiSelectModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  items = [],
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  emptyStateText = "No items available to select.",
  modalSize = "md",
}: MultiSelectModalProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  useEffect(() => {
    // Reset selection when modal is opened or items change fundamentally
    if (open) {
      setSelectedItemIds([]);
    }
  }, [open, items]); // Reset if items array instance changes too

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedItemIds);
    // The modal consumer is responsible for closing the modal via its own `onClose` 
    // and resetting its state if needed, after `onConfirm` is processed.
    // This modal itself doesn't call `onClose` after `onConfirm`.
  };

  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent size={modalSize}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>

        <div className="py-4">
          {description && (
            <p className="text-sm text-muted-foreground mb-4 px-1">{description}</p>
          )}

          {items.length > 0 ? (
            <ScrollArea className="h-[300px] pr-3">
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-2 -mx-1 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleItem(item.id)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter' || e.key === ' ') { 
                        e.preventDefault(); 
                        // Only call toggle if the event target is the row itself,
                        // not an inner element like the checkbox which handles its own events.
                        if (e.target === e.currentTarget) {
                          handleToggleItem(item.id); 
                        }
                      }
                    }}
                    role="checkbox"
                    aria-checked={selectedItemIds.includes(item.id)}
                    tabIndex={0}
                  >
                    <div 
                      className="w-auto mr-3"
                      onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the parent div's onClick
                    >
                      <FormCheckbox
                        id={`msm-item-${item.id}`}
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)} 
                      />
                    </div>
                    {item.avatarUrl && (
                      <Avatar src={item.avatarUrl} fallback={item.avatarFallback || item.label.substring(0,2).toUpperCase()} size="sm" className="mr-2" />
                    )}
                    <div className="flex flex-col min-w-0"> {/* min-w-0 for truncation if needed */}
                        <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
                        {item.details && <span className="text-xs text-muted-foreground truncate">{item.details}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">{emptyStateText}</p>
          )}
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            {cancelButtonText}
          </Button>
          <Button variant="elevated" onClick={handleConfirm} disabled={!selectedItemIds.length}>
            {confirmButtonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 