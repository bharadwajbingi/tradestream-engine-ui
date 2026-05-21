import { useQuery } from '@tanstack/react-query';
import { fileService } from '../services/fileService';
import { FileLoadMetaData } from '../types';

/** Statuses that mean the backend is still actively working on this file */
const LIVE_STATUSES = new Set(['STARTED', 'PROCESSING', 'PENDING']);

function isLive(files: FileLoadMetaData[] | undefined): boolean {
  return !!files?.some((f) => LIVE_STATUSES.has(f.status));
}

export function useFileRecords() {
  return useQuery({
    queryKey: ['files'],
    queryFn: () => fileService.getAllFiles(),
    staleTime: 0,
    retry: 1,
    // Poll every 2 s while any file is processing; stop once all are settled
    refetchInterval: (query) => (isLive(query.state.data) ? 2_000 : false),
  });
}
