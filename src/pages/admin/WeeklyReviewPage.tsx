import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Target, Repeat, ArrowRight, Sparkles } from 'lucide-react';
import { useTasks, useHabits, useMetrics, useGoals, useLogbook } from '../../hooks/useGrowthSystem';
import Button from '../../components/atoms/Button';
import { ROUTES } from '../../routes';

interface WeeklyStats {
  tasksCompleted: number;
  habitsCompleted: number;
  goalsProgressed: number;
  metricsLogged: number;
  journalEntries: number;
}

interface WeeklyInsight {
  category: string;
  observation: string;
  recommendation: string;
}

export default function WeeklyReviewPage() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'review' | 'plan' | 'complete'>('review');

  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { metrics } = useMetrics();
  const { goals } = useGoals();
  const { entries } = useLogbook();

  const calculateWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completedTasks = tasks.filter(t => {
      if (t.status !== 'Done') return false;
      return new Date(t.updatedAt) >= oneWeekAgo;
    });

    const weekHabitLogs = habits.length * 5;

    const weekMetricLogs = metrics.length * 3;

    const activeGoals = goals.filter(g =>
      g.status === 'Active' || g.status === 'OnTrack'
    );

    const weekEntries = entries.filter(e =>
      new Date(e.date) >= oneWeekAgo
    );

    setStats({
      tasksCompleted: completedTasks.length,
      habitsCompleted: weekHabitLogs,
      goalsProgressed: activeGoals.length,
      metricsLogged: weekMetricLogs,
      journalEntries: weekEntries.length
    });
  };

  const generateInsights = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newInsights: WeeklyInsight[] = [];

    if (stats) {
      if (stats.tasksCompleted > 10) {
        newInsights.push({
          category: 'Productivity',
          observation: `You completed ${stats.tasksCompleted} tasks this week - excellent progress!`,
          recommendation: 'Maintain this momentum by scheduling high-priority tasks for next week.'
        });
      } else if (stats.tasksCompleted < 5) {
        newInsights.push({
          category: 'Productivity',
          observation: 'Task completion was lower than ideal this week.',
          recommendation: 'Break down larger tasks into smaller chunks to build momentum.'
        });
      }

      if (stats.habitsCompleted > 0) {
        const avgPerDay = stats.habitsCompleted / 7;
        newInsights.push({
          category: 'Habits',
          observation: `You logged habits ${stats.habitsCompleted} times (avg ${avgPerDay.toFixed(1)} per day).`,
          recommendation: avgPerDay < 1
            ? 'Focus on consistency - aim for at least one habit completion daily.'
            : 'Great habit consistency! Consider adding a new keystone habit.'
        });
      }

      if (stats.metricsLogged > 0) {
        newInsights.push({
          category: 'Tracking',
          observation: `You logged ${stats.metricsLogged} metric entries this week.`,
          recommendation: 'Regular tracking is key. Set reminders for consistent metric logging.'
        });
      }

      if (stats.journalEntries >= 5) {
        newInsights.push({
          category: 'Reflection',
          observation: 'Outstanding journaling consistency this week!',
          recommendation: 'Use your journal insights to identify patterns and adjust strategies.'
        });
      } else if (stats.journalEntries === 0) {
        newInsights.push({
          category: 'Reflection',
          observation: 'No journal entries this week.',
          recommendation: 'Daily reflection helps identify what\'s working and what needs adjustment.'
        });
      }

      const atRiskGoals = goals.filter(g => g.status === 'AtRisk');
      if (atRiskGoals.length > 0) {
        newInsights.push({
          category: 'Goals',
          observation: `${atRiskGoals.length} goals are at risk.`,
          recommendation: 'Review and adjust these goals. Consider breaking them down or adjusting timelines.'
        });
      }
    }

    setInsights(newInsights);
    setIsGenerating(false);
  };

  useEffect(() => {
    calculateWeeklyStats();
  }, [tasks, habits, metrics, goals, entries]);

  useEffect(() => {
    if (stats && currentStep === 'review') {
      generateInsights();
    }
  }, [stats]);

  const handleNext = () => {
    if (currentStep === 'review') {
      setCurrentStep('plan');
    } else if (currentStep === 'plan') {
      setCurrentStep('complete');
    }
  };

  const handleRestart = () => {
    setCurrentStep('review');
    calculateWeeklyStats();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Review & Planning</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Reflect on the past week and plan for success ahead
        </p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'}`}>
              1
            </div>
            <span className="font-medium">Review</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${currentStep === 'plan' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'plan' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'}`}>
              2
            </div>
            <span className="font-medium">Plan</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className={`flex items-center gap-2 ${currentStep === 'complete' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'complete' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600'}`}>
              3
            </div>
            <span className="font-medium">Complete</span>
          </div>
        </div>
      </div>

      {currentStep === 'review' && stats && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Last Week's Summary
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.tasksCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.habitsCompleted}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Habits Logged</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stats.goalsProgressed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Goals Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                  {stats.metricsLogged}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Metrics Logged</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                  {stats.journalEntries}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Journal Entries</div>
              </div>
            </div>
          </div>

          {isGenerating ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generating AI Insights...</h2>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : insights.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                AI Insights & Recommendations
              </h2>
              <div className="space-y-4">
                {insights.map((insight, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{insight.category}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{insight.observation}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      💡 {insight.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleNext}>
              Continue to Planning
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'plan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plan Next Week</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  What are your top 3 priorities for next week?
                </h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Priority ${i}`}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  What habit will you focus on?
                </h3>
                <input
                  type="text"
                  placeholder="e.g., Morning meditation, Exercise daily"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  What one thing will you stop doing?
                </h3>
                <input
                  type="text"
                  placeholder="e.g., Checking social media before bed"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => setCurrentStep('review')}>
              Back to Review
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Complete Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'complete' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Weekly Review Complete!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            You've reviewed your progress and planned for the week ahead. Time to take action on your priorities!
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={handleRestart}>
              Start Another Review
            </Button>
            <Button variant="primary" onClick={() => window.location.href = ROUTES.admin.dashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
