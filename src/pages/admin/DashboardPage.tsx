import { useTasks, useHabits, useMetrics, useGoals, useProjects, useLogbook } from '../../hooks/useGrowthSystem';
import { CheckSquare, Calendar, TrendingUp, Target, FolderKanban, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AIInsightsWidget } from '../../components/organisms/AIInsightsWidget';
import { DailyPlanningAssistant } from '../../components/organisms/DailyPlanningAssistant';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  link: string;
  description: string;
}

const StatCard = ({ title, value, icon, link, description }: StatCardProps) => {
  return (
    <Link
      to={link}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { metrics } = useMetrics();
  const { goals } = useGoals();
  const { projects } = useProjects();
  const { entries } = useLogbook();

  const activeTasks = tasks.filter((t) => t.status !== 'Done' && t.status !== 'Cancelled');
  const activeHabits = habits.filter((h) => h.frequency === 'Daily');
  const activeGoals = goals.filter((g) => g.status === 'Active');
  const activeProjects = projects.filter((p) => p.status === 'Active');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Growth System Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and manage your personal growth journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Active Tasks"
          value={activeTasks.length}
          icon={<CheckSquare size={24} />}
          link="/admin/tasks"
          description={`${tasks.length} total tasks`}
        />
        <StatCard
          title="Active Habits"
          value={activeHabits.length}
          icon={<Calendar size={24} />}
          link="/admin/habits"
          description={`${habits.length} total habits`}
        />
        <StatCard
          title="Metrics Tracked"
          value={metrics.length}
          icon={<TrendingUp size={24} />}
          link="/admin/metrics"
          description="Key performance indicators"
        />
        <StatCard
          title="Active Goals"
          value={activeGoals.length}
          icon={<Target size={24} />}
          link="/admin/goals"
          description={`${goals.length} total goals`}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          icon={<FolderKanban size={24} />}
          link="/admin/projects"
          description={`${projects.length} total projects`}
        />
        <StatCard
          title="Journal Entries"
          value={entries.length}
          icon={<BookOpen size={24} />}
          link="/admin/logbook"
          description="Daily reflections"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DailyPlanningAssistant />
        <AIInsightsWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Recent Tasks</h2>
          {activeTasks.length > 0 ? (
            <div className="space-y-2">
              {activeTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'P1' ? 'bg-red-500' :
                    task.priority === 'P2' ? 'bg-orange-500' :
                    task.priority === 'P3' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No active tasks</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Active Projects</h2>
          {activeProjects.length > 0 ? (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{project.name}</p>
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No active projects</p>
          )}
        </div>
      </div>
    </div>
  );
}
