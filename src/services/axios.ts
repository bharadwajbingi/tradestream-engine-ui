import axios from "axios";
import { toast } from "sonner";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "An error occurred";

      switch (status) {
        case 401:
        case 403:
        case 500:
        case 502:
        case 503:
        case 504:
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
          break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      // Network timeout or server unreachable
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    } else {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
