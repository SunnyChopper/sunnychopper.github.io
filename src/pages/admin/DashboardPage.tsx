import { useTasks, useHabits, useMetrics, useGoals, useProjects, useLogbook } from '../../hooks/useGrowthSystem';
import { CheckSquare, Calendar, TrendingUp, Target, FolderKanban, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{value}</h3>
      <p className="text-sm font-medium text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
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

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const activeHabits = habits.filter((h) => h.streak > 0);
  const activeGoals = goals.filter((g) => g.status === 'active');
  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth System Dashboard</h1>
        <p className="text-gray-600">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Tasks</h2>
          {activeTasks.length > 0 ? (
            <div className="space-y-2">
              {activeTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600 capitalize">{task.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">No active tasks</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Active Projects</h2>
          {activeProjects.length > 0 ? (
            <div className="space-y-2">
              {activeProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="p-2.5 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                    <span className="text-xs font-medium text-blue-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">No active projects</p>
          )}
        </div>
      </div>
    </div>
  );
}
