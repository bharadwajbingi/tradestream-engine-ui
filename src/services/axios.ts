import axios from 'axios';
import { toast } from 'sonner';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 500:
          toast.error('Server error, please try again');
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('Cannot connect to server');
    } else {
      toast.error(error.message || 'An error occurred');
    }

    return Promise.reject(error);
  }
);
