import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/templates/MainLayout';
import AdminLayout from './components/templates/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ZenDashboardPage from './pages/admin/ZenDashboardPage';
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
import MediaBacklogPage from './pages/admin/MediaBacklogPage';
import HobbyQuestsPage from './pages/admin/HobbyQuestsPage';
import RewardsStorePage from './pages/admin/RewardsStorePage';
import RewardStudioPage from './pages/admin/RewardStudioPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Loader from './components/molecules/Loader';
import { usePageTracking } from './hooks/usePageTracking';
import { useThemeInitializer } from './hooks/useTheme';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { ModeProvider } from './contexts/ModeContext';
import { KnowledgeVaultProvider } from './contexts/KnowledgeVaultContext';
import DashboardRedirect from './components/routing/DashboardRedirect';
import { ADMIN_CHILD_ROUTES, ROUTES } from './routes';
import KnowledgeVaultPage from './pages/admin/KnowledgeVaultPage';

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
        <Route index element={<DashboardRedirect />} />
        <Route path={ADMIN_CHILD_ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ADMIN_CHILD_ROUTES.zenDashboard} element={<ZenDashboardPage />} />
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
        <Route path={ADMIN_CHILD_ROUTES.mediaBacklog} element={<MediaBacklogPage />} />
        <Route path={ADMIN_CHILD_ROUTES.hobbyQuests} element={<HobbyQuestsPage />} />
        <Route path={ADMIN_CHILD_ROUTES.rewardsStore} element={<RewardsStorePage />} />
        <Route path={ADMIN_CHILD_ROUTES.rewardStudio} element={<RewardStudioPage />} />
        <Route path={ADMIN_CHILD_ROUTES.knowledgeVault} element={<KnowledgeVaultPage />} />
        <Route path={ADMIN_CHILD_ROUTES.knowledgeVaultLibrary} element={<KnowledgeVaultPage />} />
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
      <ModeProvider>
        <KnowledgeVaultProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </KnowledgeVaultProvider>
      </ModeProvider>
    </>
  );
}

export default App;
