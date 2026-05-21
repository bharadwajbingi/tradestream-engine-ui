import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { FileLoadMetaData, FileStatus } from '../../../types';
import { fileService } from '../../../services/fileService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditFileModalProps {
  file: FileLoadMetaData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusOptions: FileStatus[] = [
  'STARTED',
  'PROCESSING',
  'COMPLETED',
  'COMPLETED_WITH_ERROR',
  'FAILED',
  'DELETED',
  'ARCHIVED',
];

export function EditFileModal({ file, open, onOpenChange }: EditFileModalProps) {
  const [status, setStatus] = useState<FileStatus>(file?.status || 'STARTED');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newStatus: FileStatus) => {
      if (!file) return;
      await fileService.modifyFile({ fileId: file.fileId, status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File status updated successfully');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Failed to update file status');
    },
  });

  const handleSave = () => {
    mutation.mutate(status);
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit File Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm text-muted-foreground">File Name</Label>
            <p className="font-mono text-sm mt-1">{file.filename}</p>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as FileStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
