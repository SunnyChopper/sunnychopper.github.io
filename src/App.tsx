import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Loader from './components/molecules/Loader';
import DashboardRedirect from './components/routing/DashboardRedirect';
import ErrorBoundary from './components/shared/ErrorBoundary';
import AdminLayout from './components/templates/AdminLayout';
import MainLayout from './components/templates/MainLayout';
import { BackendStatusProvider } from './contexts/BackendStatusContext';
import { KnowledgeVaultProvider } from './contexts/KnowledgeVault';
import { ModeProvider } from './contexts/Mode';
import { usePageTracking } from './hooks/usePageTracking';
import { useThemeInitializer } from './hooks/useTheme';
import ChatbotPage from './pages/admin/ChatbotPage';
import ComponentsDemoPage from './pages/admin/ComponentsDemoPage';
import ConceptColliderPage from './pages/admin/ConceptColliderPage';
import CourseDetailPage from './pages/admin/CourseDetailPage';
import CourseGeneratorPage from './pages/admin/CourseGeneratorPage';
import CoursesPage from './pages/admin/CoursesPage';
import DashboardPage from './pages/admin/DashboardPage';
import FlashcardsPage from './pages/admin/FlashcardsPage';
import FocusModePage from './pages/admin/FocusModePage';
import GoalsPage from './pages/admin/GoalsPage';
import GrowthSystemPage from './pages/admin/GrowthSystemPage';
import HabitsPage from './pages/admin/HabitsPage';
import HobbyQuestsPage from './pages/admin/HobbyQuestsPage';
import KnowledgeVaultPage from './pages/admin/KnowledgeVaultPage';
import LogbookPage from './pages/admin/LogbookPage';
import LoginPage from './pages/admin/LoginPage';
import MediaBacklogPage from './pages/admin/MediaBacklogPage';
import MetricsPage from './pages/admin/MetricsPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import RewardsStorePage from './pages/admin/RewardsStorePage';
import RewardStudioPage from './pages/admin/RewardStudioPage';
import SettingsPage from './pages/admin/SettingsPage';
import SkillTreePage from './pages/admin/SkillTreePage';
import StudySessionPage from './pages/admin/StudySessionPage';
import StudyStatisticsPage from './pages/admin/StudyStatisticsPage';
import TasksPage from './pages/admin/TasksPage';
import WeeklyReviewPage from './pages/admin/WeeklyReviewPage';
import ZenDashboardPage from './pages/admin/ZenDashboardPage';
import MarkdownViewerPage from './pages/admin/MarkdownViewerPage';
import ToolsOverviewPage from './pages/admin/ToolsOverviewPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProductsPage from './pages/ProductsPage';
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
          <Route path={ADMIN_CHILD_ROUTES.knowledgeVaultCourses} element={<CoursesPage />} />
          <Route path="knowledge-vault/courses/new" element={<CourseGeneratorPage />} />
          <Route path="knowledge-vault/courses/:courseId" element={<CourseDetailPage />} />
          <Route
            path="knowledge-vault/courses/:courseId/:lessonId"
            element={<CourseDetailPage />}
          />
          <Route path={ADMIN_CHILD_ROUTES.knowledgeVaultSkillTree} element={<SkillTreePage />} />
          <Route path={ADMIN_CHILD_ROUTES.knowledgeVaultFlashcards} element={<FlashcardsPage />} />
          <Route
            path={ADMIN_CHILD_ROUTES.knowledgeVaultCollider}
            element={<ConceptColliderPage />}
          />
          <Route path="knowledge-vault/study" element={<StudySessionPage />} />
          <Route path="knowledge-vault/statistics" element={<StudyStatisticsPage />} />
          <Route path={ADMIN_CHILD_ROUTES.tools} element={<ToolsOverviewPage />} />
          <Route path={ADMIN_CHILD_ROUTES.markdownViewer} element={<MarkdownViewerPage />} />
          <Route path={ADMIN_CHILD_ROUTES.markdownViewerFile} element={<MarkdownViewerPage />} />
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
      <BackendStatusProvider>
        <ModeProvider>
          <KnowledgeVaultProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </KnowledgeVaultProvider>
        </ModeProvider>
      </BackendStatusProvider>
    </>
  );
}

export default App;
