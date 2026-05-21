import { axiosInstance } from './axios';
import { ApiResponse, DashboardMetrics } from '../types';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const response = await axiosInstance.get<ApiResponse<DashboardMetrics>>('/file/metrics');
    return response.data.data;
  },
};
