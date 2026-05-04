import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/Layout/PrivateRoute';
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import UsersPage from './pages/Admin/UsersPage';
import GardensPage from './pages/Admin/GardensPage';
import DiseasesPage from './pages/Admin/DiseasesPage';
import PredictionsPage from './pages/Admin/PredictionsPage';
import ChatPage from './pages/Admin/ChatPage';
import ChangePasswordPage from './pages/Admin/ChangePasswordPage';
import SeasonsPage from './pages/Admin/SeasonsPage';
import AdminExpensesPage from './pages/Admin/ExpensesPage';
import AdminLogsPage from './pages/Admin/LogsPage';
import AdminTasksPage from './pages/Admin/TasksPage';
// User Pages
import HomePage from './pages/User/HomePage';
import UserGardensPage from './pages/User/GardensPage';
import UserLogsPage from './pages/User/LogsPage';
import PredictPage from './pages/User/PredictPage';
import UserExpensesPage from './pages/User/ExpensesPage';
import StatisticsPage from './pages/User/StatisticsPage';
import ProfilePage from './pages/User/ProfilePage';
import authService from './services/authService';

function App() {
  useEffect(() => {
    // Check if user is already logged in (for page refresh)
    const token = authService.getToken();
    if (token) {
      console.log('✓ User is logged in');
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root route - redirect based on role */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/user" replace />
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/user"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/gardens"
            element={
              <PrivateRoute>
                <UserGardensPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/gardens/new"
            element={
              <PrivateRoute>
                <UserGardensPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/logs"
            element={
              <PrivateRoute>
                <UserLogsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/logs/new"
            element={
              <PrivateRoute>
                <UserLogsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/predict"
            element={
              <PrivateRoute>
                <PredictPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/expenses"
            element={
              <PrivateRoute>
                <UserExpensesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/expenses/new"
            element={
              <PrivateRoute>
                <UserExpensesPage />
              </PrivateRoute>
            }
          />
          <Route

            path="/user/statistics"
            element={
              <PrivateRoute>
                <StatisticsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/gardens"
            element={
              <AdminRoute>
                <GardensPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/diseases"
            element={
              <AdminRoute>
                <DiseasesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/predictions"
            element={
              <AdminRoute>
                <PredictionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <AdminRoute>
                <ChatPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/change-password"
            element={
              <AdminRoute>
                <ChangePasswordPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/seasons"
            element={
              <AdminRoute>
                <SeasonsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/expenses"
            element={
              <AdminRoute>
                <AdminExpensesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <AdminRoute>
                <AdminLogsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <AdminRoute>
                <AdminTasksPage />
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notification */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            style: {
              background: '#22c55e',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}

export default App;
