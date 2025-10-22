import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('Unauthorized access - token may be expired');
      } else if (status === 403) {
        console.error('Forbidden - insufficient permissions');
      } else if (status === 404) {
        console.error('Resource not found');
      } else if (status >= 500) {
        console.error('Server error');
      }
      
      return Promise.reject({
        ...error,
        message: data?.message || error.message || 'An unexpected error occurred'
      });
    } else if (error.request) {
      return Promise.reject({
        ...error,
        message: 'Network error - please check your connection'
      });
    } else {
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;