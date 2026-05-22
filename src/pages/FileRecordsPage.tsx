import { useState, useMemo, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Trash2, Archive, Download, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useFileRecords } from '../hooks/useFileRecords';
import { fileService } from '../services/fileService';
import { DataTable, Column } from '../app/components/common/DataTable';
import { SearchBar } from '../app/components/common/SearchBar';
import { StatusBadge } from '../app/components/common/StatusBadge';
import { Pagination } from '../app/components/common/Pagination';
import { DeleteModal } from '../app/components/modals/DeleteModal';
import { ArchiveModal } from '../app/components/modals/ArchiveModal';
import { FileLoadMetaData } from '../types';
import { format } from 'date-fns';
import { Button } from '../app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';

const ITEMS_PER_PAGE = 10;

export default function FileRecordsPage() {
  const { data: files, isLoading } = useFileRecords();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<FileLoadMetaData | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [reuploadTarget, setReuploadTarget] = useState<FileLoadMetaData | null>(null);
  const reuploadInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      const response = await fileService.exportFileTransactions(fileId);
      const blob = new Blob([response], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${filename.replace('.csv', '')}_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  const handleReuploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const correctedFile = event.target.files?.[0];
    if (!correctedFile || !reuploadTarget) return;

    const toastId = toast.loading(`Uploading corrected CSV for ${reuploadTarget.filename}`);
    try {
      await fileService.uploadFile(correctedFile);
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Corrected file uploaded for processing', { id: toastId });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload corrected file', { id: toastId });
    } finally {
      event.target.value = '';
      setReuploadTarget(null);
    }
  };

  const filteredData = useMemo(() => {
    if (!files) return [];
    return files.filter((file) => {
      const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || file.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [files, searchQuery, statusFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) =>
      new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );
  }, [filteredData]);

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const columns: Column<FileLoadMetaData>[] = [
    {
      header: 'File ID',
      accessor: (row) => <span className="font-mono text-sm text-primary">{row.fileId}</span>,
    },
    {
      header: 'File Name',
      accessor: (row) => <span className="font-mono text-sm">{row.filename}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Total Records',
      accessor: (row) => <span className="text-sm">{row.totalRecords.toLocaleString()}</span>,
    },
    {
      header: 'Success',
      accessor: (row) => <span className="text-sm text-success">{row.successCount.toLocaleString()}</span>,
    },
    {
      header: 'Errors',
      accessor: (row) => <span className="text-sm text-error">{row.errorCount.toLocaleString()}</span>,
    },
    {
      header: 'Duplicates',
      accessor: (row) => (
        <span className="text-sm text-amber-500 font-semibold">
          {(row.duplicateCount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Upload Time',
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.uploadTime), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadFile(row.fileId, row.filename);
            }}
            title="Download CSV"
          >
            <Download className="h-4 w-4" />
          </Button>

          {row.status === 'COMPLETED_WITH_ERROR' || row.status === 'FAILED' ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setReuploadTarget(row);
                reuploadInputRef.current?.click();
              }}
              title="Reupload Corrected CSV"
            >
              <Upload className="h-4 w-4" />
            </Button>
          ) : null}

          {row.status !== 'ARCHIVED' ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(row);
                  setArchiveModalOpen(true);
                }}
                title="Archive File"
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(row);
                  setDeleteModalOpen(true);
                }}
                title="Delete File"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground px-2 flex items-center">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <input
        ref={reuploadInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleReuploadFile}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by filename..."
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="COMPLETED_WITH_ERROR">With Errors</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          emptyMessage="No files found"
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <DeleteModal
        fileId={selectedFile?.fileId || null}
        filename={selectedFile?.filename || ''}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
      />
      <ArchiveModal
        fileId={selectedFile?.fileId || null}
        filename={selectedFile?.filename || ''}
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
      />
    </div>
  );
}
