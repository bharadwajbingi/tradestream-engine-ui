import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmptyState } from './EmptyState';
import { SkeletonTable } from './SkeletonTable';
import { FileX } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { [key: string]: unknown }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data found',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <SkeletonTable rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return <EmptyState icon={FileX} title={emptyMessage} />;
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="group cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => {
                const value = typeof column.accessor === 'function'
                  ? column.accessor(row)
                  : row[column.accessor];

                return (
                  <TableCell key={colIndex} className={column.className}>
                    {value as React.ReactNode}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
