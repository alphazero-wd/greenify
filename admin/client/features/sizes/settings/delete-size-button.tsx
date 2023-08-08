"use client";
import { Button, Label, useDeleteRecordsModal } from "@/features/ui";

export const DeleteSizeButton = () => {
  const { onOpen } = useDeleteRecordsModal();

  return (
    <div>
      <Label>Delete size</Label>
      <p className="text-sm text-gray-500">This action cannot be undone.</p>
      <Button onClick={onOpen} variant="destructive" className="mt-3">
        Delete size
      </Button>
    </div>
  );
};
