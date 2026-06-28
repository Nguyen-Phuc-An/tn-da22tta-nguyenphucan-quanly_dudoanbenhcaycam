import apiClient from './apiClient';

const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        mat_khau: password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return {
          success: true,
          user,
          token,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      };
    }
  },

  // Register
  register: async (name, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        ho_ten: name,
        email,
        mat_khau: password,
      });

      if (response.data.success) {
        return {
          success: true,
          message: 'Đăng ký thành công',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
