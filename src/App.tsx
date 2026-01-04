import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import AdminLayout from './components/templates/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';
import GrowthSystemPage from './pages/admin/GrowthSystemPage';
import ChatbotPage from './pages/admin/ChatbotPage';
import ComponentsDemoPage from './pages/admin/ComponentsDemoPage';
import TasksPage from './pages/admin/TasksPageAdvanced';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Loader from './components/molecules/Loader';
import { usePageTracking } from './hooks/usePageTracking';
import { useThemeInitializer } from './hooks/useTheme';
import ErrorBoundary from './components/shared/ErrorBoundary';

function AppContent() {
  usePageTracking();
  useThemeInitializer();

  return (
    <ErrorBoundary>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Route>

      <Route path="/admin/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="growth-system" element={<GrowthSystemPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="habits" element={<div className="p-8">Habits Page - Coming Soon</div>} />
        <Route path="metrics" element={<div className="p-8">Metrics Page - Coming Soon</div>} />
        <Route path="goals" element={<div className="p-8">Goals Page - Coming Soon</div>} />
        <Route path="projects" element={<div className="p-8">Projects Page - Coming Soon</div>} />
        <Route path="logbook" element={<div className="p-8">Logbook Page - Coming Soon</div>} />
        <Route path="assistant" element={<ChatbotPage />} />
        <Route path="components-demo" element={<ComponentsDemoPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </ErrorBoundary>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Loader isLoading={isLoading} />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
}

export default App;
