import axios from 'axios';

// Cấu hình base URL trỏ tới ASP.NET Core API
const apiClient = axios.create({
  baseURL: 'http://localhost:5183/api', // Đã sửa khớp với Port thực tế của Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Interceptor (Request): Tự động đính kèm JWT Token vào Header của mọi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Interceptor (Response): Xử lý lỗi 401 Unauthorized (Token hết hạn)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      
      // Rút token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Chỉ tự động chuyển hướng nếu trước đó người dùng ĐÃ có token (tức là token vừa hết hạn)
      if (hadToken && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
