import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from '../components/Layout/AuthLayout';
import authService from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await authService.register(
        data.name,
        data.email,
        data.password
      );

      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Lỗi đăng ký. Vui lòng thử lại.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="📝 Tạo Tài Khoản"
      subtitle="Đăng ký để bắt đầu"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ tên
          </label>
          <input
            type="text"
            placeholder="Nguyễn Văn A"
            className="auth-input"
            {...register('name', {
              required: 'Họ tên là bắt buộc',
              minLength: {
                value: 2,
                message: 'Họ tên ít nhất 2 ký tự',
              },
            })}
          />
          {errors.name && (
            <p className="error-text">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="email@example.com"
            className="auth-input"
            {...register('email', {
              required: 'Email là bắt buộc',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không hợp lệ',
              },
            })}
          />
          {errors.email && (
            <p className="error-text">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="auth-input pr-12"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu ít nhất 6 ký tự',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && (
            <p className="error-text">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="auth-input pr-12"
              {...register('confirmPassword', {
                required: 'Xác nhận mật khẩu là bắt buộc',
                validate: (value) =>
                  value === password || 'Mật khẩu không khớp',
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-text">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="auth-button"
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      {/* Link to Login */}
      <div className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="auth-link">
          Đăng nhập ngay
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
