import { axiosInstance } from './axios';
import {
  ApiResponse,
  FileLoadMetaData,
  FileUploadResponse,
  FileSearchRequest,
  TransactionError,
  TransactionErrorSearchRequest,
  PageResponse,
} from '../types';

export const fileService = {
  async uploadFile(file: File, onUploadProgress?: (progressEvent: any) => void): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ApiResponse<FileUploadResponse>>(
      '/file/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data.data;
  },

  async getAllFiles(): Promise<FileLoadMetaData[]> {
    const response = await axiosInstance.get<ApiResponse<FileLoadMetaData[]>>('/file/getAll');
    return response.data.data;
  },

  async getFilesPage(page = 0, size = 20): Promise<PageResponse<FileLoadMetaData>> {
    const response = await axiosInstance.get<ApiResponse<PageResponse<FileLoadMetaData>>>(
      '/file/getAll/page',
      { params: { page, size } }
    );
    return response.data.data;
  },

  async searchFiles(request: FileSearchRequest): Promise<FileLoadMetaData[]> {
    const response = await axiosInstance.post<ApiResponse<FileLoadMetaData[]>>(
      '/file/search',
      request
    );
    return response.data.data;
  },

  async searchFilesPage(request: FileSearchRequest): Promise<PageResponse<FileLoadMetaData>> {
    const response = await axiosInstance.post<ApiResponse<PageResponse<FileLoadMetaData>>>(
      '/file/search/page',
      request
    );
    return response.data.data;
  },

  async modifyFile(data: Partial<FileLoadMetaData>): Promise<void> {
    await axiosInstance.put<ApiResponse<void>>('/file/modify', data);
  },

  async deleteFile(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/file/delete/${id}`);
  },

  async archiveFile(id: number): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(`/file/archive/${id}`);
  },

  async getAllErrors(): Promise<TransactionError[]> {
    const response = await axiosInstance.get<ApiResponse<TransactionError[]>>('/file/errors');
    return response.data.data;
  },

  async getErrorsPage(page = 0, size = 20): Promise<PageResponse<TransactionError>> {
    const response = await axiosInstance.get<ApiResponse<PageResponse<TransactionError>>>(
      '/file/errors/page',
      { params: { page, size } }
    );
    return response.data.data;
  },

  async searchErrors(request: TransactionErrorSearchRequest): Promise<TransactionError[]> {
    const response = await axiosInstance.post<ApiResponse<TransactionError[]>>(
      '/file/search-errors',
      request
    );
    return response.data.data;
  },

  async searchErrorsPage(request: TransactionErrorSearchRequest): Promise<PageResponse<TransactionError>> {
    const response = await axiosInstance.post<ApiResponse<PageResponse<TransactionError>>>(
      '/file/search-errors/page',
      request
    );
    return response.data.data;
  },

  async resolveError(id: number): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(`/file/errors/${id}/resolve`);
  },

  async ignoreError(id: number): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>(`/file/errors/${id}/ignore`);
  },

  async exportFileTransactions(fileId: number): Promise<any> {
    const response = await axiosInstance.get(`/file/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
