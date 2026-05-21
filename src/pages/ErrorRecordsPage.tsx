import { useState, useMemo } from 'react';
import { Download, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useErrors } from '../hooks/useErrors';
import { DataTable, Column } from '../app/components/common/DataTable';
import { SearchBar } from '../app/components/common/SearchBar';
import { StatusBadge } from '../app/components/common/StatusBadge';
import { Pagination } from '../app/components/common/Pagination';
import { TransactionError } from '../types';
import { format } from 'date-fns';
import { Button } from '../app/components/ui/button';
import { Badge } from '../app/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../app/components/ui/select';

const ITEMS_PER_PAGE = 10;

export default function ErrorRecordsPage() {
  const { data: errors, isLoading } = useErrors();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleIgnore = async (id: number) => {
    setProcessingId(id);
    try {
      await fileService.ignoreError(id);
      toast.success('Error status updated to IGNORED');
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to ignore error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!errors) return [];
    return errors.filter((error) => {
      const matchesSearch =
        (error?.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error?.accountNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error?.errorMessage || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error?.errorField || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (error?.filename || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'ALL'
          ? error?.status !== 'IGNORED' && error?.status !== 'DUPLICATE'
          : error?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [errors, searchQuery, statusFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const timeA = a?.createdTime ? new Date(a.createdTime).getTime() : 0;
      const timeB = b?.createdTime ? new Date(b.createdTime).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToCSV = () => {
    if (!filteredData.length) return;

    const headers = [
      'Error ID',
      'Row Number',
      'Transaction ID',
      'Account Number',
      'Error Field',
      'Error Message',
      'Status',
      'File ID',
      'Filename',
      'Created Time',
    ];

    const rows = filteredData.map((error) => [
      error?.errorId || '',
      error?.rowNumber || '',
      error?.transactionId || '',
      error?.accountNumber || '',
      error?.errorField || '',
      error?.errorMessage || '',
      error?.status || '',
      error?.fileId || '',
      error?.filename || '',
      error?.createdTime || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-records-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<TransactionError>[] = [
    {
      header: 'Row #',
      accessor: (row) => <span className="font-mono text-sm font-semibold text-muted-foreground">{row?.rowNumber}</span>,
    },
    {
      header: 'Transaction ID',
      accessor: (row) => (
        <span className="font-mono text-sm text-primary font-medium">
          {row?.transactionId || <span className="text-muted-foreground italic">N/A</span>}
        </span>
      ),
    },
    {
      header: 'Account Number',
      accessor: (row) => (
        <span className="font-mono text-sm">
          {row?.accountNumber || <span className="text-muted-foreground italic">N/A</span>}
        </span>
      ),
    },
    {
      header: 'Error Field',
      accessor: (row) => (
        <Badge variant="outline" className="font-mono text-xs text-rose-500 border-rose-500/20 bg-rose-500/5">
          {row?.errorField || 'N/A'}
        </Badge>
      ),
    },
    {
      header: 'Error Message',
      accessor: (row) => <span className="text-sm font-medium text-foreground">{row?.errorMessage || 'N/A'}</span>,
      className: 'max-w-xs truncate',
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row?.status} />,
    },
    {
      header: 'File',
      accessor: (row) => (
        <div className="text-sm">
          <p className="font-mono text-muted-foreground font-medium">{row?.filename || 'N/A'}</p>
          <p className="text-xs text-muted-foreground/60">ID: {row?.fileId}</p>
        </div>
      ),
    },
    {
      header: 'Created Time',
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {row?.createdTime ? format(new Date(row.createdTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => {
        const isInvalidTxnId = row?.status === 'INVALID_TRANSACTION_ID';
        const isProcessing = processingId === row?.errorId;
        if (!isInvalidTxnId) {
          return <span className="text-muted-foreground text-xs italic">-</span>;
        }
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="View details"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/errors/${row.errorId}`);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 transition-all font-semibold"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleIgnore(row.errorId);
              }}
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              Ignore
            </Button>
          </div>
        );
      },
    },
  ];

  if (!isLoading && !errors?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-4 rounded-full bg-success/10 p-6">
          <svg className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mb-2 font-semibold">No errors found</h3>
        <p className="text-sm text-muted-foreground">All records are clean</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by transaction, account, error message or file..."
            className="flex-1"
          />
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="INVALID_TRANSACTION_ID">Invalid Txn ID</SelectItem>
                <SelectItem value="IGNORED">Ignored</SelectItem>
                <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={exportToCSV} disabled={!filteredData.length} className="w-full md:w-auto shrink-0">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          emptyMessage="No errors found"
          onRowClick={(row) => navigate(`/errors/${row.errorId}`)}
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
