"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  title,
  description,
  loading,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            type="button"
            className={buttonVariants({ variant: "outline" })}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "destructive" }), "min-w-24")}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
