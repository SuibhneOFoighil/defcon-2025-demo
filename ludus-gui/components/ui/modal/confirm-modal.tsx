import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "./modal";
import { Button } from "../button";
import type { ReactNode } from "react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (event?: React.MouseEvent) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  confirmVariant?: "default" | "destructive" | "elevated" | "secondary";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  confirmVariant = "elevated",
}: ConfirmModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        {description && <div className="mb-4">{description}</div>}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={(e) => onConfirm(e)} disabled={loading}>
            {loading ? "Loading..." : confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 