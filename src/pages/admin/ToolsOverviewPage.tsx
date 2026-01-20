import { Link } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  Brain,
  Zap,
  Wrench,
  Layers,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { ROUTES } from '@/routes';

export default function ToolsOverviewPage() {
  const tools = [
    {
      title: 'Markdown Viewer',
      description:
        'A powerful markdown editor and viewer for managing your documentation, notes, and knowledge base. Organize files with folders, tags, and categories.',
      icon: <FileText size={24} />,
      link: ROUTES.admin.markdownViewer,
      color: 'blue',
    },
  ];

  const valueProps = [
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Centralized',
      description: 'All tools in one place',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Cost-Effective',
      description: 'Reduce subscription costs',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Enhanced',
      description: 'Richer context for AI',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Efficient',
      description: 'Faster workflows',
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-800 dark:via-blue-800 dark:to-indigo-800 p-8 md:p-12">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Tools</h1>
          </div>
          <p className="mb-6 text-lg text-blue-100 md:max-w-2xl">
            Centralized productivity tools that enhance your workflow, reduce costs, and build a
            comprehensive knowledge base for your AI assistant.
          </p>
          <div className="flex flex-wrap gap-3">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm"
              >
                <div className={`rounded-lg bg-gradient-to-br ${prop.gradient} p-1.5 text-white`}>
                  {prop.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{prop.title}</div>
                  <div className="text-xs text-blue-100">{prop.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Why Tools Section - Unique Flow Design */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Why Tools Exists</h2>

        <div className="relative">
          {/* Flow visualization */}
          <div className="space-y-6">
            <div className="group relative flex items-start gap-6 rounded-xl border-l-4 border-blue-500 bg-blue-50/50 p-6 transition-all hover:bg-blue-50 dark:border-blue-400 dark:bg-blue-900/10 dark:hover:bg-blue-900/20">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Consolidation
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Instead of juggling multiple separate tools with different interfaces and
                  authentication systems, Tools brings everything together in one cohesive
                  environment. No more context switching or data silos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Leads to
                </span>
              </div>
            </div>

            <div className="group relative flex items-start gap-6 rounded-xl border-l-4 border-green-500 bg-green-50/50 p-6 transition-all hover:bg-green-50 dark:border-green-400 dark:bg-green-900/10 dark:hover:bg-green-900/20">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Cost Efficiency
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Replace expensive SaaS subscriptions with integrated, self-hosted solutions. Save
                  money while gaining more control over your data and workflows.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
                <Sparkles className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enables
                </span>
              </div>
            </div>

            <div className="group relative flex items-start gap-6 rounded-xl border-l-4 border-purple-500 bg-purple-50/50 p-6 transition-all hover:bg-purple-50 dark:border-purple-400 dark:bg-purple-900/10 dark:hover:bg-purple-900/20">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Brain className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Richer AI Context
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When all your tools are integrated into Personal OS, your AI assistant has access
                  to a complete picture of your work, preferences, and knowledge. This enables more
                  accurate suggestions, better automation, and smarter assistance.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 dark:bg-gray-700">
                <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Results in
                </span>
              </div>
            </div>

            <div className="group relative flex items-start gap-6 rounded-xl border-l-4 border-orange-500 bg-orange-50/50 p-6 transition-all hover:bg-orange-50 dark:border-orange-400 dark:bg-orange-900/10 dark:hover:bg-orange-900/20">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                  Continuous Improvement
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  As you use Tools, your data accumulates and your AI context deepens. This creates
                  a compounding effect where the system becomes more valuable over time, learning
                  your patterns and preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="mt-8 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-lg bg-blue-500 p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="mb-2 font-bold text-blue-900 dark:text-blue-100">The Result</h4>
                <p className="text-gray-800 dark:text-gray-200">
                  A unified productivity ecosystem that reduces costs, eliminates context switching,
                  and provides your AI assistant with the rich context needed to truly understand
                  and assist with your work. Each tool you add makes the entire system more
                  powerful.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Tools Section */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Tools</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Click on any tool to get started
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.title}
              to={tool.link}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white shadow-lg transition-transform group-hover:scale-110">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>
              {/* Hover effect gradient */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 transition-all group-hover:from-blue-50/50 group-hover:to-indigo-50/50 dark:group-hover:from-blue-900/10 dark:group-hover:to-indigo-900/10" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
