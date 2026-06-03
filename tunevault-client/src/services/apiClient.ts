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
      // Rút token và đẩy người dùng về trang đăng nhập
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
