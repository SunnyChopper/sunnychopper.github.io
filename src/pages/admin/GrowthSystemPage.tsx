import { Target, TrendingUp, CheckSquare, Calendar, FolderKanban, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const FeatureCard = ({ title, description, icon, link }: FeatureCardProps) => {
  return (
    <Link
      to={link}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default function GrowthSystemPage() {
  const features = [
    {
      title: 'Goals',
      description: 'Set and track long-term objectives with measurable outcomes and deadlines.',
      icon: <Target size={24} />,
      link: '/admin/goals',
    },
    {
      title: 'Projects',
      description: 'Manage complex initiatives with milestones, tasks, and progress tracking.',
      icon: <FolderKanban size={24} />,
      link: '/admin/projects',
    },
    {
      title: 'Tasks',
      description: 'Organize daily work with priorities, deadlines, and project associations.',
      icon: <CheckSquare size={24} />,
      link: '/admin/tasks',
    },
    {
      title: 'Habits',
      description: 'Build consistent routines with streak tracking and daily logging.',
      icon: <Calendar size={24} />,
      link: '/admin/habits',
    },
    {
      title: 'Metrics',
      description: 'Monitor key performance indicators with historical data and trends.',
      icon: <TrendingUp size={24} />,
      link: '/admin/metrics',
    },
    {
      title: 'Logbook',
      description: 'Maintain daily journal entries linked to your tasks, habits, and achievements.',
      icon: <BookOpen size={24} />,
      link: '/admin/logbook',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth System</h1>
        <p className="text-gray-600">
          A comprehensive framework for personal development and productivity
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            The Growth System is a holistic approach to personal development that integrates multiple
            productivity methodologies into a cohesive framework.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white/80 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Strategic Layer</h3>
              <p className="text-sm text-gray-600">
                Goals and Projects provide the big picture vision, defining what you want to achieve
                and how you'll get there.
              </p>
            </div>
            <div className="bg-white/80 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Tactical Layer</h3>
              <p className="text-sm text-gray-600">
                Tasks and Habits handle day-to-day execution, turning strategy into consistent action.
              </p>
            </div>
            <div className="bg-white/80 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Measurement Layer</h3>
              <p className="text-sm text-gray-600">
                Metrics track progress with quantifiable data, providing objective feedback on performance.
              </p>
            </div>
            <div className="bg-white/80 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Reflection Layer</h3>
              <p className="text-sm text-gray-600">
                Logbook captures daily insights and learning, connecting activities to outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Components</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}
