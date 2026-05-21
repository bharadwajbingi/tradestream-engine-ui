import { axiosInstance } from "./axios";
import {
  LoginRequest,
  SignupRequest,
  ApiResponse,
} from "../types";

export const authService = {
  async login(
    email: string,
    password: string,
  ): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/auth/login',
      { email, password } as LoginRequest
    );
    return response.data.data;
  },

  async signup(
    email: string,
    password: string,
  ): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<string>>(
      '/auth/signup',
      { email, password } as SignupRequest
    );
    return response.data.message;
  },
};