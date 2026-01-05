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
import TasksPage from './pages/admin/TasksPageAdvancedV2';
import ProjectsPage from './pages/admin/ProjectsPage';
import GoalsPage from './pages/admin/GoalsPage';
import MetricsPage from './pages/admin/MetricsPage';
import HabitsPage from './pages/admin/HabitsPage';
import LogbookPage from './pages/admin/LogbookPage';
import WeeklyReviewPage from './pages/admin/WeeklyReviewPage';
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
        <Route path="habits" element={<HabitsPage />} />
        <Route path="metrics" element={<MetricsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="logbook" element={<LogbookPage />} />
        <Route path="weekly-review" element={<WeeklyReviewPage />} />
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
