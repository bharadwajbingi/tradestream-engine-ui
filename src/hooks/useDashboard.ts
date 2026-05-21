import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { FileLoadMetaData } from '../types';

const LIVE_STATUSES = new Set(['STARTED', 'PROCESSING', 'PENDING']);

export function useDashboard() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 0,
    retry: 1,
    refetchInterval: () => {
      const files = queryClient.getQueryData<FileLoadMetaData[]>(['files']);
      return files?.some((f) => LIVE_STATUSES.has(f.status)) ? 2_000 : false;
    },
  });
}
