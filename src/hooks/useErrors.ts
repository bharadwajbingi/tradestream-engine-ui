import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { FileLoadMetaData } from '../types';

const LIVE_STATUSES = new Set(['STARTED', 'PROCESSING', 'PENDING']);

export function useErrors(searchQuery: string = '', statusFilter: string = 'ALL', page: number = 0, size: number = 20) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['errors', searchQuery, statusFilter, page, size],
    queryFn: () => fileService.searchErrorsPage({
      globalSearchTerm: searchQuery,
      status: statusFilter,
      page,
      size
    }),
    staleTime: 0,
    retry: 1,
    // Keep polling while files are still processing
    refetchInterval: () => {
      const files = queryClient.getQueryData<FileLoadMetaData[]>(['files']);
      return files?.some((f) => LIVE_STATUSES.has(f.status)) ? 2_000 : false;
    },
  });
}
