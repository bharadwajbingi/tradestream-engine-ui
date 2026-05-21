import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, FileWarning } from 'lucide-react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useErrors } from '../hooks/useErrors';
import { fileService } from '../services/fileService';
import { Button } from '../app/components/ui/button';
import { Card } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { StatusBadge } from '../app/components/common/StatusBadge';

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm font-medium break-words">{value || 'N/A'}</div>
    </div>
  );
}

export default function ErrorDetailsPage() {
  const { errorId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: errors, isLoading } = useErrors();

  const error = useMemo(
    () => errors?.find((item) => String(item.errorId) === String(errorId)),
    [errors, errorId]
  );

  const handleIgnore = async () => {
    if (!error || error.status !== 'INVALID_TRANSACTION_ID') return;
    try {
      await fileService.ignoreError(error.errorId);
      toast.success('Error status updated to IGNORED');
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      navigate('/errors');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to ignore error');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading error details...</div>;
  }

  if (!error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => navigate('/errors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 border border-border text-center">
          <FileWarning className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Error not found</h2>
          <p className="text-sm text-muted-foreground mt-1">The selected error record is not available.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/errors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {error.status === 'INVALID_TRANSACTION_ID' && (
          <Button variant="outline" onClick={handleIgnore}>
            <Ban className="h-4 w-4 mr-2" />
            Ignore
          </Button>
        )}
      </div>

      <Card className="p-6 border border-border">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">#{error.errorId}</Badge>
              <StatusBadge status={error.status} />
            </div>
            <h1 className="text-2xl font-semibold">Transaction Error Details</h1>
            <p className="text-sm text-muted-foreground mt-1">{error.errorMessage}</p>
          </div>
          <div className="text-sm text-muted-foreground md:text-right">
            {error.createdTime ? format(new Date(error.createdTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DetailRow label="Row Number" value={error.rowNumber} />
          <DetailRow label="Transaction ID" value={<span className="font-mono">{error.transactionId}</span>} />
          <DetailRow label="Account Number" value={<span className="font-mono">{error.accountNumber}</span>} />
          <DetailRow label="Error Field" value={<Badge variant="outline">{error.errorField}</Badge>} />
          <DetailRow label="File" value={`${error.filename || 'N/A'} (${error.fileId || 'N/A'})`} />
        </div>
      </Card>
    </div>
  );
}
