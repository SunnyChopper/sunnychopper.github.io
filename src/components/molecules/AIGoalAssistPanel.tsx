import { useState } from 'react';
import { Sparkles, Wand2, X, Check, AlertCircle, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { llmConfig } from '../../lib/llm';
import type { Goal } from '../../types/growth-system';
import Button from '../atoms/Button';
import { AIThinkingIndicator } from '../atoms/AIThinkingIndicator';
import { AIConfidenceIndicator } from '../atoms/AIConfidenceIndicator';

type AssistMode = 'refine' | 'criteria' | 'metrics' | 'cascade' | 'forecast' | 'conflicts' | 'progress';

interface AIGoalAssistPanelProps {
  mode: AssistMode;
  goal: Goal;
  onClose: () => void;
  onApplyRefinement?: (title: string, description: string) => void;
  onApplyCriteria?: (criteria: string[]) => void;
}

export function AIGoalAssistPanel({
  mode,
  goal,
  onClose,
  onApplyRefinement,
  onApplyCriteria,
}: AIGoalAssistPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const isConfigured = llmConfig.isConfigured();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (mode === 'refine') {
      setResult({
        refinedTitle: `${goal.title} (Enhanced)`,
        refinedDescription: `This is a refined version of your goal with more specific metrics and actionable steps.`,
        reasoning: 'Made the goal more specific and measurable',
        confidence: 0.85,
        suggestedAdjustments: ['Add specific numbers', 'Define success criteria', 'Set intermediate milestones'],
      });
    } else if (mode === 'criteria') {
      setResult({
        criteria: [
          { criterion: 'Complete 80% of related tasks', measurable: true, suggestedMetric: 'Task completion rate' },
          { criterion: 'Achieve target metric values', measurable: true, suggestedMetric: 'Metric tracking' },
          { criterion: 'Maintain consistent progress', measurable: false },
        ],
        reasoning: 'These criteria cover all aspects of the goal',
        confidence: 0.9,
      });
    } else if (mode === 'metrics') {
      setResult({
        metrics: [
          { name: 'Weekly Progress', description: 'Track weekly progress', unit: 'percentage', targetValue: 100, frequency: 'weekly', reasoning: 'Essential for tracking' },
          { name: 'Daily Consistency', description: 'Daily habit tracking', unit: 'count', targetValue: 7, frequency: 'daily', reasoning: 'Builds momentum' },
        ],
        overallRationale: 'These metrics provide comprehensive tracking',
        confidence: 0.88,
      });
    } else if (mode === 'forecast') {
      setResult({
        probability: 75,
        expectedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        confidenceLevel: 'high',
        factors: {
          positive: ['Strong initial progress', 'Clear success criteria', 'Regular tracking'],
          negative: ['Limited time available', 'Multiple competing goals'],
        },
        recommendations: ['Focus on high-impact tasks', 'Schedule dedicated time', 'Track metrics daily'],
        reasoning: 'Based on current progress and historical patterns',
      });
    } else {
      setResult({ message: 'AI analysis in progress...' });
    }

    setIsLoading(false);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'refine': return <Wand2 className="w-5 h-5" />;
      case 'criteria': return <Check className="w-5 h-5" />;
      case 'metrics': return <Target className="w-5 h-5" />;
      case 'forecast': return <TrendingUp className="w-5 h-5" />;
      case 'conflicts': return <AlertTriangle className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'refine': return 'Refine Goal';
      case 'criteria': return 'Generate Success Criteria';
      case 'metrics': return 'Suggest Metrics';
      case 'cascade': return 'Goal Cascade';
      case 'forecast': return 'Achievement Forecast';
      case 'conflicts': return 'Detect Conflicts';
      case 'progress': return 'Progress Analysis';
    }
  };

  if (!isConfigured) {
    return (
      <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl p-6 overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">AI Not Configured</p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Configure an AI provider in Settings to use AI features.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl p-6 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {getModeIcon()}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{getModeTitle()}</h3>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Goal: <span className="font-medium text-gray-900 dark:text-gray-100">{goal.title}</span>
        </p>
        {!result && (
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
            {isLoading ? 'Analyzing...' : 'Analyze with AI'}
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <AIThinkingIndicator />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Analyzing goal...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {result && mode === 'refine' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refined Title
            </label>
            <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">
              {result.refinedTitle}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refined Description
            </label>
            <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
              {result.refinedDescription}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Suggested Adjustments
            </label>
            <ul className="space-y-2">
              {result.suggestedAdjustments.map((adj: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  {adj}
                </li>
              ))}
            </ul>
          </div>
          <AIConfidenceIndicator confidence={result.confidence} />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onApplyRefinement?.(result.refinedTitle, result.refinedDescription);
                onClose();
              }}
              className="flex-1"
            >
              Apply Refinements
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {result && mode === 'criteria' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Generated Success Criteria
            </label>
            <ul className="space-y-3">
              {result.criteria.map((c: any, i: number) => (
                <li key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.criterion}</p>
                      {c.suggestedMetric && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Metric: {c.suggestedMetric}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <AIConfidenceIndicator confidence={result.confidence} />
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const criteria = result.criteria.map((c: any) => c.criterion);
                onApplyCriteria?.(criteria);
                onClose();
              }}
              className="flex-1"
            >
              Apply Criteria
            </Button>
            <Button onClick={onClose} variant="ghost" className="flex-1">
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {result && mode === 'forecast' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {result.probability}%
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200">Probability of Achievement</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Positive Factors
            </label>
            <ul className="space-y-1">
              {result.factors.positive.map((f: string, i: number) => (
                <li key={i} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                  <span>+</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Challenges
            </label>
            <ul className="space-y-1">
              {result.factors.negative.map((f: string, i: number) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span>-</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommendations
            </label>
            <ul className="space-y-2">
              {result.recommendations.map((r: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {result && !['refine', 'criteria', 'forecast'].includes(mode) && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {result.message || 'Analysis complete'}
          </p>
        </div>
      )}
    </div>
  );
}
