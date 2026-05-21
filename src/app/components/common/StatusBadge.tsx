import { FileStatus, ErrorStatus } from '../../../types';
import { cn } from '../../../lib/utils';

interface StatusBadgeProps {
  status: FileStatus | ErrorStatus;
  className?: string;
}

const statusConfig: Record<
  FileStatus | ErrorStatus,
  { label: string; color: string; dotColor: string; isPulsing?: boolean }
> = {
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-500', dotColor: 'bg-emerald-500' },
  COMPLETED_WITH_ERROR: { label: 'Completed with Error', color: 'bg-amber-500/10 text-amber-500', dotColor: 'bg-amber-500' },
  FAILED: { label: 'Failed', color: 'bg-rose-500/10 text-rose-500', dotColor: 'bg-rose-500' },
  PROCESSING: { label: 'Processing', color: 'bg-purple-500/10 text-purple-500', dotColor: 'bg-purple-500', isPulsing: true },
  STARTED: { label: 'Started', color: 'bg-cyan-500/10 text-cyan-500', dotColor: 'bg-cyan-500' },
  DELETED: { label: 'Deleted', color: 'bg-slate-500/10 text-slate-500', dotColor: 'bg-slate-500' },
  ARCHIVED: { label: 'Archived', color: 'bg-gray-500/10 text-gray-500', dotColor: 'bg-gray-500' },
  RESOLVED: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-500', dotColor: 'bg-emerald-500' },
  INVALID_TRANSACTION_ID: { label: 'Invalid Txn ID', color: 'bg-red-500/10 text-red-500', dotColor: 'bg-red-500' },
  IGNORED: { label: 'Ignored', color: 'bg-slate-500/10 text-slate-500', dotColor: 'bg-slate-500' },
  DUPLICATE: { label: 'Duplicate', color: 'bg-amber-500/10 text-amber-500', dotColor: 'bg-amber-500' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-500/10 text-slate-500',
    dotColor: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.color,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotColor, config.isPulsing && 'animate-pulse')} />
      {config.label}
    </span>
  );
}
