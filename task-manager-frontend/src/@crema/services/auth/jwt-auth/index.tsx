import axios from "@crema/services/axios";
import type { AxiosResponse, AxiosError } from "axios";
import { tokenManager } from "@crema/services/TokenManager";

const jwtAxios = axios.create({
  baseURL: "http://localhost:8081/api/v1/", // Updated to match backend API
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for handling token refresh
jwtAxios.interceptors.response.use(
  (res: AxiosResponse<any, any>) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as any;

    // Check if error is due to invalid/expired token
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return jwtAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use TokenManager to refresh token
        const newAccessToken = await tokenManager.refreshAccessToken();

        // Update axios default header
        jwtAxios.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return jwtAxios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        delete jwtAxios.defaults.headers.common.Authorization;

        // Redirect to login page
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export const setAuthToken = (token?: string) => {
  if (token) {
    jwtAxios.defaults.headers.common.Authorization = `Bearer ${token}`;
    // TokenManager will handle localStorage storage
  } else {
    delete jwtAxios.defaults.headers.common.Authorization;
    tokenManager.clearTokens();
  }
};

export default jwtAxios;
