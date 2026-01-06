import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import AdminLayout from './components/templates/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import FocusModePage from './pages/admin/FocusModePage';
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
import { ADMIN_CHILD_ROUTES, ROUTES } from './routes';

function AppContent() {
  usePageTracking();
  useThemeInitializer();
  const navigate = useNavigate();

  // Handle GitHub Pages 404 redirect
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return (
    <ErrorBoundary>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.products} element={<ProductsPage />} />
      </Route>

      <Route path={ROUTES.admin.login} element={<LoginPage />} />

      <Route
        path={ROUTES.admin.focus}
        element={
          <ProtectedRoute>
            <FocusModePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.admin.base}
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.admin.dashboard} replace />} />
        <Route path={ADMIN_CHILD_ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ADMIN_CHILD_ROUTES.growthSystem} element={<GrowthSystemPage />} />
        <Route path={ADMIN_CHILD_ROUTES.tasks} element={<TasksPage />} />
        <Route path={ADMIN_CHILD_ROUTES.habits} element={<HabitsPage />} />
        <Route path={ADMIN_CHILD_ROUTES.metrics} element={<MetricsPage />} />
        <Route path={ADMIN_CHILD_ROUTES.goals} element={<GoalsPage />} />
        <Route path={ADMIN_CHILD_ROUTES.projects} element={<ProjectsPage />} />
        <Route path={ADMIN_CHILD_ROUTES.logbook} element={<LogbookPage />} />
        <Route path={ADMIN_CHILD_ROUTES.weeklyReview} element={<WeeklyReviewPage />} />
        <Route path={ADMIN_CHILD_ROUTES.assistant} element={<ChatbotPage />} />
        <Route path={ADMIN_CHILD_ROUTES.componentsDemo} element={<ComponentsDemoPage />} />
        <Route path={ADMIN_CHILD_ROUTES.settings} element={<SettingsPage />} />
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
