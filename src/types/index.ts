export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  status: string;
  code?: number;
  statusCode?: number;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type FileStatus =
  | 'STARTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERROR'
  | 'FAILED'
  | 'DELETED'
  | 'ARCHIVED';

export type ErrorStatus = 'FAILED' | 'RESOLVED' | 'INVALID_TRANSACTION_ID' | 'IGNORED' | 'DUPLICATE';

export interface FileLoadMetaData {
  id?: number;
  fileId: number;
  filename: string;
  uploadTime: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  duplicateCount?: number;
  status: FileStatus;
  processingTimeMs?: number;
}

export interface TransactionError {
  errorId: number;
  transactionId?: string;
  accountNumber?: string;
  errorField: string;
  errorMessage: string;
  status: ErrorStatus;
  fileId: number;
  filename: string;
  rowNumber: number;
  createdTime: string;
}

export interface DashboardMetrics {
  totalFiles: number;
  successRecords: number;
  errorRecords: number;
}

export interface FileUploadResponse {
  fileId: number;
  fileName: string;
  status: string;
  message: string;
}

export interface FileSearchRequest {
  fileId?: number;
  filename?: string;
  status?: FileStatus;
  startDate?: string;
  endDate?: string;
}

export interface TransactionErrorSearchRequest {
  fileLoadId?: number;
  transactionId?: string;
  accountNumber?: string;
  errorField?: string;
  status?: string;
  page?: number;
  size?: number;
  globalSearchTerm?: string;
}

export interface User {
  email: string;
  token: string;
}
