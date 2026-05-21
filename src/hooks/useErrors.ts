import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { FileLoadMetaData } from '../types';

const LIVE_STATUSES = new Set(['STARTED', 'PROCESSING', 'PENDING']);

export function useErrors() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['errors'],
    queryFn: () => fileService.getAllErrors(),
    staleTime: 0,
    retry: 1,
    // Keep polling while files are still processing
    refetchInterval: () => {
      const files = queryClient.getQueryData<FileLoadMetaData[]>(['files']);
      return files?.some((f) => LIVE_STATUSES.has(f.status)) ? 2_000 : false;
    },
  });
}
