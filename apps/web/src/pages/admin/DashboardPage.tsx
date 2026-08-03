import { useState, useMemo } from 'react';
import { useGrowthSystemDashboard } from '@/hooks/useGrowthSystemDashboard';
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  Target,
  FolderKanban,
  BookOpen,
  Heart,
  Film,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardStatCard } from '@/components/molecules/dashboard/DashboardStatCard';
import { dashboardKpiGridClassName } from '@/components/molecules/dashboard/dashboard-stat-card-surfaces';
import { PageContainer } from '@/components/templates/PageContainer';
import { AIInsightsWidget } from '@/components/organisms/AIInsightsWidget';
import { AmbientPresenceStrip } from '@/components/organisms/assistant/AmbientPresenceStrip';
import { HealthActionWidget } from '@/components/organisms/HealthActionWidget';
import { StaleVelocityAdvisoryCard } from '@/components/molecules/StaleVelocityAdvisoryCard';
import { DailyPlanningAssistant } from '@/components/organisms/DailyPlanningAssistant';
import { MorningLaunchpad } from '@/components/organisms/MorningLaunchpad';
import { DailyRecoveryDialog } from '@/components/organisms/fitness/DailyRecoveryDialog';
import { GoalsDashboardWidget } from '@/components/organisms/GoalsDashboardWidget';
import { useMode } from '@/contexts/Mode';
import { ROUTES } from '@/routes';
import { useBackendStatus } from '@/contexts/BackendStatusContext';
import {
  formatHiddenActiveProjectsLabel,
  getActiveProjectsWidgetView,
} from '@/lib/growth-system/dashboard-active-projects';
import type { Task } from '@/types/growth-system';

export default function DashboardPage() {
  const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
  const [quickRecoveryOpen, setQuickRecoveryOpen] = useState(false);
  const [topTasksForDay, setTopTasksForDay] = useState<Task[]>([]);
  const { isLeisureMode } = useMode();
  const { status: backendStatus } = useBackendStatus();

  const {
    tasks,
    goals,
    projects,
    habits,
    metrics,
    logbookEntries: entries,
    isLoading: dashboardLoading,
    isError: dashboardError,
  } = useGrowthSystemDashboard();

  // Check if any data source has a network error
  // Only show error if we have a genuine error (not just during initial load)
  const hasNetworkError =
    dashboardError ||
    (!backendStatus.isOnline && backendStatus.lastError && !backendStatus.isChecking);

  const activeTasks = tasks.filter(
    (t) => t.status !== 'Done' && t.status !== 'Cancelled' && t.status !== 'Backlog'
  );
  const activeHabits = habits.filter((h) => h.frequency === 'Daily');
  const activeGoals = goals.filter((g) => g.status === 'Active');

  const { activeProjects, visibleActiveProjects, hiddenActiveProjectCount } = useMemo(
    () => getActiveProjectsWidgetView(projects),
    [projects]
  );
  const hiddenActiveProjectsLabel = formatHiddenActiveProjectsLabel(hiddenActiveProjectCount);

  // Calculate simple progress for goals (for dashboard widget)
  const goalsProgress = useMemo(() => {
    const progressMap = new Map<string, number>();
    goals.forEach((goal) => {
      if (Array.isArray(goal.successCriteria)) {
        if (typeof goal.successCriteria[0] === 'string') {
          const completed = (goal.successCriteria as unknown as string[]).filter((c) =>
            c.includes('✓')
          ).length;
          const total = goal.successCriteria.length;
          progressMap.set(goal.id, total > 0 ? Math.round((completed / total) * 100) : 0);
        } else {
          const completed = goal.successCriteria.filter((c: any) => c.isCompleted).length;
          const total = goal.successCriteria.length;
          progressMap.set(goal.id, total > 0 ? Math.round((completed / total) * 100) : 0);
        }
      }
    });
    return progressMap;
  }, [goals]);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isLeisureMode ? 'Leisure Dashboard' : 'Personal OS Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isLeisureMode
            ? 'Relax, recharge, and enjoy your personal time'
            : 'Track your progress and run your Personal OS'}
        </p>
      </div>

      {hasNetworkError && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Backend connection unavailable
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Unable to load data from the backend server. Statistics may be incomplete. Please
                check the connection status banner at the top of the page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={dashboardKpiGridClassName}>
        {!isLeisureMode && (
          <>
            <DashboardStatCard
              title="Active Tasks"
              value={activeTasks.length}
              icon={<CheckSquare size={24} />}
              link={ROUTES.admin.tasks}
              description={dashboardError ? 'Connection error' : `${tasks.length} total tasks`}
              isLoading={dashboardLoading}
            />
            <DashboardStatCard
              title="Metrics Tracked"
              value={metrics.length}
              icon={<TrendingUp size={24} />}
              link={ROUTES.admin.metrics}
              description={dashboardError ? 'Connection error' : 'Key performance indicators'}
              isLoading={dashboardLoading}
            />
            <DashboardStatCard
              title="Active Goals"
              value={activeGoals.length}
              icon={<Target size={24} />}
              link={ROUTES.admin.goals}
              description={dashboardError ? 'Connection error' : `${goals.length} total goals`}
              isLoading={dashboardLoading}
            />
            <DashboardStatCard
              title="Active Projects"
              value={activeProjects.length}
              icon={<FolderKanban size={24} />}
              link={ROUTES.admin.projects}
              description={
                dashboardError ? 'Connection error' : `${projects.length} total projects`
              }
              isLoading={dashboardLoading}
            />
          </>
        )}
        <DashboardStatCard
          title="Active Habits"
          value={activeHabits.length}
          icon={<Calendar size={24} />}
          link={ROUTES.admin.habits}
          description={dashboardError ? 'Connection error' : `${habits.length} total habits`}
          isLoading={dashboardLoading}
        />
        <DashboardStatCard
          title="Journal Entries"
          value={entries.length}
          icon={<BookOpen size={24} />}
          link={ROUTES.admin.logbook}
          description={dashboardError ? 'Connection error' : 'Daily reflections'}
          isLoading={dashboardLoading}
        />
        {isLeisureMode && (
          <>
            <DashboardStatCard
              title="Recovery Score"
              value={85}
              icon={<Heart size={24} />}
              link={ROUTES.admin.dashboard}
              description="Well-being indicator"
            />
            <DashboardStatCard
              title="Media Backlog"
              value={0}
              icon={<Film size={24} />}
              link={ROUTES.admin.mediaBacklog}
              description="Movies, shows & books"
            />
            <DashboardStatCard
              title="Hobby Quests"
              value={0}
              icon={<Star size={24} />}
              link={ROUTES.admin.hobbyQuests}
              description="Personal interests"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyPlanningAssistant
          onTopTasksChange={setTopTasksForDay}
          onStartDay={() => setIsLaunchpadOpen(true)}
        />
        {!isLeisureMode && (
          <GoalsDashboardWidget
            goals={goals}
            goalsProgress={goalsProgress}
            isLoading={dashboardLoading}
          />
        )}
        <HealthActionWidget />
        <AmbientPresenceStrip
          surface="dashboard"
          onQuickRecovery={() => setQuickRecoveryOpen(true)}
        />
        <AIInsightsWidget />
        {!isLeisureMode && <StaleVelocityAdvisoryCard />}
      </div>

      <MorningLaunchpad
        isOpen={isLaunchpadOpen}
        onClose={() => setIsLaunchpadOpen(false)}
        topTasks={topTasksForDay}
      />

      <DailyRecoveryDialog
        isOpen={quickRecoveryOpen}
        onClose={() => setQuickRecoveryOpen(false)}
        quickMode
      />

      {!isLeisureMode ? (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Projects</h2>
            {!dashboardLoading && !dashboardError && activeProjects.length > 0 ? (
              <Link
                to={ROUTES.admin.projects}
                className="text-xs font-medium accent-text-600 dark:accent-text-400 hover:underline shrink-0"
              >
                View all projects
              </Link>
            ) : null}
          </div>
          {dashboardError ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-amber-500 dark:text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-amber-600 dark:text-amber-400">Unable to load projects</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Backend connection unavailable
              </p>
            </div>
          ) : dashboardLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse flex items-start justify-between gap-3"
                >
                  <div className="h-4 flex-1 max-w-[72%] bg-gray-200 dark:bg-gray-600 rounded" />
                  <div className="h-3 w-14 shrink-0 bg-gray-200 dark:bg-gray-600 rounded mt-0.5" />
                </div>
              ))}
            </div>
          ) : activeProjects.length > 0 ? (
            <div className="space-y-2">
              {visibleActiveProjects.map((project) => (
                <div key={project.id} className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {project.name}
                    </p>
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
              {hiddenActiveProjectCount > 0 ? (
                <div className="pt-1 flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {hiddenActiveProjectsLabel}
                  </p>
                  <Link
                    to={ROUTES.admin.projects}
                    className="text-xs font-medium accent-text-600 dark:accent-text-400 hover:underline"
                  >
                    View all projects
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
              No active projects
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Recovery Activities
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
              Time to relax and recharge
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Leisure Suggestions
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">
              Explore your hobbies and interests
            </p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
