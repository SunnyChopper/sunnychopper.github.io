import { useState } from 'react';
import { Network, Plus, BookOpen, Code, Database, Cloud, Layers } from 'lucide-react';

interface SkillNode {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'general';
  level: number;
  learned: boolean;
  prerequisites: string[];
}

const SKILL_TREE_DATA: SkillNode[] = [
  { id: 'html', name: 'HTML', category: 'frontend', level: 1, learned: true, prerequisites: [] },
  { id: 'css', name: 'CSS', category: 'frontend', level: 1, learned: true, prerequisites: [] },
  { id: 'js', name: 'JavaScript', category: 'frontend', level: 1, learned: true, prerequisites: [] },
  { id: 'react', name: 'React', category: 'frontend', level: 2, learned: true, prerequisites: ['js'] },
  { id: 'typescript', name: 'TypeScript', category: 'frontend', level: 2, learned: true, prerequisites: ['js'] },
  { id: 'nextjs', name: 'Next.js', category: 'frontend', level: 3, learned: false, prerequisites: ['react'] },
  { id: 'nodejs', name: 'Node.js', category: 'backend', level: 2, learned: true, prerequisites: ['js'] },
  { id: 'python', name: 'Python', category: 'backend', level: 1, learned: false, prerequisites: [] },
  { id: 'sql', name: 'SQL', category: 'database', level: 1, learned: true, prerequisites: [] },
  { id: 'postgres', name: 'PostgreSQL', category: 'database', level: 2, learned: false, prerequisites: ['sql'] },
  { id: 'aws', name: 'AWS', category: 'devops', level: 2, learned: false, prerequisites: [] },
  { id: 'docker', name: 'Docker', category: 'devops', level: 2, learned: false, prerequisites: [] },
];

export default function SkillTreePage() {
  const [skills] = useState<SkillNode[]>(SKILL_TREE_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Skills', icon: Network },
    { id: 'frontend', name: 'Frontend', icon: Code },
    { id: 'backend', name: 'Backend', icon: Layers },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'devops', name: 'DevOps', icon: Cloud },
  ];

  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const groupedByLevel = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.level]) {
      acc[skill.level] = [];
    }
    acc[skill.level].push(skill);
    return acc;
  }, {} as Record<number, SkillNode[]>);

  const levels = Object.keys(groupedByLevel).sort((a, b) => parseInt(a) - parseInt(b));

  const getCategoryColor = (category: string) => {
    const colors = {
      frontend: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      backend: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
      database: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      devops: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
      general: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getLearnedCount = () => skills.filter(s => s.learned).length;
  const getTotalCount = () => skills.length;
  const getProgressPercentage = () => Math.round((getLearnedCount() / getTotalCount()) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Tree</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualize your technology stack and learning progress
          </p>
        </div>

        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
        >
          <Plus size={20} />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Progress</h2>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getProgressPercentage()}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {getLearnedCount()} of {getTotalCount()} skills mastered
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={18} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-12">
          {levels.map(level => (
            <div key={level}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold">
                  {level}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Level {level}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {level === '1' ? 'Fundamentals' : level === '2' ? 'Intermediate' : 'Advanced'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {groupedByLevel[parseInt(level)].map(skill => (
                  <div
                    key={skill.id}
                    className={`relative p-4 rounded-lg border-2 transition cursor-pointer ${
                      skill.learned
                        ? getCategoryColor(skill.category)
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {skill.learned && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="font-medium text-sm mb-1">{skill.name}</p>
                      <p className="text-xs opacity-75 capitalize">{skill.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <BookOpen size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Dynamic Skill Tree Coming Soon
            </h3>
            <p className="text-blue-800 dark:text-blue-400 text-sm">
              In the next update, your Skill Tree will automatically populate based on completed courses
              and lessons, showing prerequisites, recommended learning paths, and skill connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
