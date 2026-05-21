import { Dialog, DialogPortal, DialogOverlay } from '../ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '../ui/button';
import { fileService } from '../../../services/fileService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  fileId: number | null;
  filename: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteModal({ fileId, filename, open, onOpenChange }: DeleteModalProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (fileId === null) return;
      await fileService.deleteFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('File deleted successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete file';
      toast.error(msg);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="
            fixed top-1/2 left-1/2 z-50
            -translate-x-1/2 -translate-y-1/2
            w-full max-w-md
            bg-background border border-border
            rounded-2xl shadow-xl p-6
            flex flex-col gap-4
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
        >
          {/* Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Delete File</h2>
              <p className="text-xs text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-foreground break-all">{filename}</span>?
            {' '}All records associated with this file will be removed.
          </p>

          {/* Buttons — always on one row */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
