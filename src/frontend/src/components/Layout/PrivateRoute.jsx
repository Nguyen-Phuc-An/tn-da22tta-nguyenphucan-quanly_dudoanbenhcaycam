import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../../services/authService';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const isLoggedIn = authService.isLoggedIn();
  const user = authService.getCurrentUser();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.vai_tro !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
