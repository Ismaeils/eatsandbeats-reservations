import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from './api-response'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle responses - return data directly as ApiResponse
// We need to cast the return type to satisfy axios's interceptor signature
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the data directly - this transforms AxiosResponse to just the data
    // Cast to satisfy TypeScript - the interceptor expects AxiosResponse but we return just data
    return response.data as unknown as AxiosResponse
  },
  (error) => {
    // Only redirect on 401 for authenticated routes, not for login/register
    if (error.response?.status === 401) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      const isAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/forgot-password'
      
      if (!isAuthPage) {
        // Clear token and redirect to login only if not already on auth pages
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      }
    }
    // Return the error response data so it can be caught and displayed
    return Promise.reject(error.response?.data || { error: error.message || 'An error occurred' })
  }
)

// Create typed wrapper functions
const apiClientWrapper = {
  get: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => 
    apiClient.get(url, config) as unknown as Promise<ApiResponse<T>>,
  post: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => 
    apiClient.post(url, data, config) as unknown as Promise<ApiResponse<T>>,
  patch: <T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => 
    apiClient.patch(url, data, config) as unknown as Promise<ApiResponse<T>>,
  delete: <T = any>(url: string, config?: any): Promise<ApiResponse<T>> => 
    apiClient.delete(url, config) as unknown as Promise<ApiResponse<T>>,
}

export default apiClientWrapper

