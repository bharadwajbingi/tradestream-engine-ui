import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../app/components/ui/tabs';
import { Card } from '../app/components/ui/card';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Button } from '../app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';
import { DataTable, Column } from '../app/components/common/DataTable';
import { StatusBadge } from '../app/components/common/StatusBadge';
import { EmptyState } from '../app/components/common/EmptyState';
import { FileLoadMetaData, TransactionError, FileSearchRequest, TransactionErrorSearchRequest } from '../types';
import { fileService } from '../services/fileService';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Badge } from '../app/components/ui/badge';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState('files');

  const [fileSearch, setFileSearch] = useState<FileSearchRequest>({});
  const [errorSearch, setErrorSearch] = useState<TransactionErrorSearchRequest>({});

  const fileSearchMutation = useMutation({
    mutationFn: (request: FileSearchRequest) => fileService.searchFiles(request),
  });

  const errorSearchMutation = useMutation({
    mutationFn: (request: TransactionErrorSearchRequest) => fileService.searchErrors(request),
  });

  const handleFileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fileSearchMutation.mutate(fileSearch);
  };

  const handleErrorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    errorSearchMutation.mutate(errorSearch);
  };

  const fileColumns: Column<FileLoadMetaData>[] = [
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
      header: 'Upload Time',
      accessor: (row) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.uploadTime), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
  ];

  const errorColumns: Column<TransactionError>[] = [
    {
      header: 'Transaction ID',
      accessor: (row) => <span className="font-mono text-sm text-primary">{row.transactionId}</span>,
    },
    {
      header: 'Account Number',
      accessor: (row) => <span className="font-mono text-sm">{row.accountNumber}</span>,
    },
    {
      header: 'Error Field',
      accessor: (row) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.errorField}
        </Badge>
      ),
    },
    {
      header: 'Error Message',
      accessor: (row) => <span className="text-sm">{row.errorMessage}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="files">File Loads</TabsTrigger>
          <TabsTrigger value="errors">Transaction Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          <Card className="p-6 rounded-2xl border border-border">
            <h3 className="font-semibold mb-4">Search File Loads</h3>
            <form onSubmit={handleFileSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileId">File ID</Label>
                  <Input
                    id="fileId"
                    type="number"
                    placeholder="Enter file ID"
                    value={fileSearch.fileId || ''}
                    onChange={(e) => setFileSearch({ ...fileSearch, fileId: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    placeholder="Enter filename"
                    value={fileSearch.filename || ''}
                    onChange={(e) => setFileSearch({ ...fileSearch, filename: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={fileSearch.status || 'all'}
                    onValueChange={(value) => setFileSearch({ ...fileSearch, status: value === 'all' ? undefined : value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="COMPLETED_WITH_ERROR">With Errors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={fileSearch.startDate || ''}
                    onChange={(e) => setFileSearch({ ...fileSearch, startDate: e.target.value || undefined })}
                  />
                </div>
              </div>
              <Button type="submit" disabled={fileSearchMutation.isPending}>
                <Search className="h-4 w-4 mr-2" />
                {fileSearchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </Card>

          {fileSearchMutation.data ? (
            <DataTable
              columns={fileColumns}
              data={fileSearchMutation.data}
              emptyMessage="No files found matching your search"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No search yet"
              description="Enter search criteria above and click Search to find file loads"
            />
          )}
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card className="p-6 rounded-2xl border border-border">
            <h3 className="font-semibold mb-4">Search Transaction Errors</h3>
            <form onSubmit={handleErrorSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter transaction ID"
                    value={errorSearch.transactionId || ''}
                    onChange={(e) => setErrorSearch({ ...errorSearch, transactionId: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={errorSearch.accountNumber || ''}
                    onChange={(e) => setErrorSearch({ ...errorSearch, accountNumber: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="errorField">Error Field</Label>
                  <Input
                    id="errorField"
                    placeholder="Enter error field"
                    value={errorSearch.errorField || ''}
                    onChange={(e) => setErrorSearch({ ...errorSearch, errorField: e.target.value || undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileLoadId">File Load ID</Label>
                  <Input
                    id="fileLoadId"
                    type="number"
                    placeholder="Enter file load ID"
                    value={errorSearch.fileLoadId || ''}
                    onChange={(e) => setErrorSearch({ ...errorSearch, fileLoadId: Number(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <Button type="submit" disabled={errorSearchMutation.isPending}>
                <Search className="h-4 w-4 mr-2" />
                {errorSearchMutation.isPending ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </Card>

          {errorSearchMutation.data ? (
            <DataTable
              columns={errorColumns}
              data={errorSearchMutation.data}
              emptyMessage="No errors found matching your search"
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No search yet"
              description="Enter search criteria above and click Search to find transaction errors"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
