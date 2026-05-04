import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="auth-card">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
