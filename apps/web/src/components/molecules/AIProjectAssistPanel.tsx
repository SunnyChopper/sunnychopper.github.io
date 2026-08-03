import { useEffect, useState } from 'react';
import { Sparkles, Wand2, X, Check, AlertCircle, Plus, NotebookPen, Pin } from 'lucide-react';
import { llmService } from '@/services/llm.service';
import { llmConfig } from '@/lib/llm';
import type { Project, Task, CreateTaskInput } from '@/types/growth-system';
import type {
  GeneratedProjectTask,
  ProjectHealthOutput,
  ProjectHealthPriorityAction,
  ProjectRiskOutput,
  ProjectTaskGenOutput,
} from '@/types/llm';
import Button from '@/components/atoms/Button';
import { AIFeatureModelRecovery } from '@/components/molecules/AIFeatureModelRecovery';
import { AIProjectAssistLoadingSkeleton } from '@/components/molecules/AIProjectAssistLoadingSkeleton';
import type { AIFeature } from '@/lib/llm/config/feature-types';
import {
  AI_PROJECT_ASSIST_PANEL_ID,
  aiProjectAssistPanelShellClassName,
  type AIProjectToolMode,
} from '@/lib/projects/ai-project-tools-surfaces';
import { getDateUrgency } from '@/utils/project-summary';
import { cn } from '@/lib/utils';

function riskSeverityFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score <= 3) return 'low';
  if (score <= 6) return 'medium';
  return 'high';
}

function generatedTaskToCreateInput(task: GeneratedProjectTask, project: Project): CreateTaskInput {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    area: project.area,
    projectIds: [project.id],
    size: Math.max(1, Math.round(task.estimatedHours)),
    notes: `Category: ${task.category}`,
  };
}

function formatOverallHealthLabel(overallHealth: ProjectHealthOutput['overallHealth']): string {
  switch (overallHealth) {
    case 'atRisk':
      return 'At risk';
    default:
      return overallHealth.charAt(0).toUpperCase() + overallHealth.slice(1);
  }
}

function overallHealthBadgeClass(overallHealth: ProjectHealthOutput['overallHealth']): string {
  switch (overallHealth) {
    case 'excellent':
    case 'good':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    case 'atRisk':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
    case 'critical':
    default:
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  }
}

const MODE_FEATURE: Record<AIProjectToolMode, AIFeature> = {
  health: 'projectHealth',
  generate: 'projectTaskGen',
  risks: 'projectRisk',
};

interface AIProjectAssistPanelProps {
  mode: AIProjectToolMode;
  project: Project;
  tasks: Task[];
  onClose: () => void;
  onCreateTasks?: (tasks: CreateTaskInput[]) => void;
  onCreateTaskFromAction?: (action: ProjectHealthPriorityAction) => void;
  onLogActivityFromAction?: (action: ProjectHealthPriorityAction) => void;
  onRequestGenerateTasks?: () => void;
  onWeeklyRiskPinChange?: (pinned: boolean) => Promise<boolean>;
  labelledBy?: string;
}

export function AIProjectAssistPanel({
  mode,
  project,
  tasks,
  onClose,
  onCreateTasks,
  onCreateTaskFromAction,
  onLogActivityFromAction,
  onRequestGenerateTasks,
  onWeeklyRiskPinChange,
  labelledBy,
}: AIProjectAssistPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [healthResult, setHealthResult] = useState<ProjectHealthOutput | null>(null);
  const [tasksResult, setTasksResult] = useState<ProjectTaskGenOutput | null>(null);
  const [risksResult, setRisksResult] = useState<ProjectRiskOutput | null>(null);
  const [modelNotFound, setModelNotFound] = useState<{
    feature: AIFeature;
    model?: string;
  } | null>(null);

  const isConfigured = llmConfig.isConfigured();
  const activeFeature = MODE_FEATURE[mode];

  useEffect(() => {
    setHealthResult(null);
    setTasksResult(null);
    setRisksResult(null);
    setError(null);
    setModelNotFound(null);
  }, [mode]);

  const applyResponseError = (response: {
    success: boolean;
    error: string | null;
    errorCode?: string;
    errorModel?: string;
  }) => {
    if (response.success) {
      setModelNotFound(null);
      return false;
    }
    if (response.errorCode === 'MODEL_NOT_FOUND') {
      setModelNotFound({
        feature: activeFeature,
        model: response.errorModel,
      });
      setError(null);
      return true;
    }
    setModelNotFound(null);
    setError(response.error || 'Request failed');
    return true;
  };

  const handleAnalyzeHealth = async () => {
    if (tasks.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await llmService.analyzeProjectHealth(project, tasks);

    if (response.success && response.data) {
      setHealthResult(response.data);
      setModelNotFound(null);
    } else if (!applyResponseError(response)) {
      setError(response.error || 'Failed to analyze project health');
    }
    setIsLoading(false);
  };

  const handleGenerateTasks = async () => {
    setIsLoading(true);
    setError(null);

    const response = await llmService.generateProjectTasks(project, tasks);

    if (response.success && response.data) {
      setTasksResult(response.data);
      setModelNotFound(null);
    } else if (!applyResponseError(response)) {
      setError(response.error || 'Failed to generate tasks');
    }
    setIsLoading(false);
  };

  const handleIdentifyRisks = async () => {
    setIsLoading(true);
    setError(null);

    const response = await llmService.identifyProjectRisks(project, tasks);

    if (response.success && response.data) {
      setRisksResult(response.data);
      setModelNotFound(null);
    } else if (!applyResponseError(response)) {
      setError(response.error || 'Failed to identify risks');
    }
    setIsLoading(false);
  };

  const handleWeeklyRiskPinToggle = async () => {
    if (!onWeeklyRiskPinChange || pinBusy) return;
    const nextPinned = !project.weeklyRiskAssessmentPinned;
    setPinBusy(true);
    setError(null);
    try {
      const ok = await onWeeklyRiskPinChange(nextPinned);
      if (!ok) {
        setError('Could not update weekly pin. You may already have five pinned projects.');
      }
    } finally {
      setPinBusy(false);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'health':
        return 'Project Health Analysis';
      case 'generate':
        return 'Generate Tasks';
      case 'risks':
        return 'Risk Assessment';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'health':
        return 'AI will analyze your project health based on task progress and status.';
      case 'generate':
        return 'AI will suggest additional tasks needed to complete this project.';
      case 'risks':
        return 'AI will identify potential risks and blockers for this project.';
    }
  };

  const getModeCtaLabel = () => {
    switch (mode) {
      case 'health':
        return 'Analyze';
      case 'generate':
        return 'Generate';
      case 'risks':
        return 'Assess';
    }
  };

  const getLoadingStatusMessage = () => {
    switch (mode) {
      case 'health':
        return 'Analyzing project health…';
      case 'generate':
        return 'Generating task suggestions…';
      case 'risks':
        return 'Assessing project risks…';
    }
  };

  const handleInvoke = () => {
    switch (mode) {
      case 'health':
        handleAnalyzeHealth();
        break;
      case 'generate':
        handleGenerateTasks();
        break;
      case 'risks':
        handleIdentifyRisks();
        break;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
      case 'moderate':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    }
  };

  const factorCardClass = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
  };

  const modeHasResult =
    (mode === 'health' && healthResult !== null) ||
    (mode === 'generate' && tasksResult !== null) ||
    (mode === 'risks' && risksResult !== null);

  const hasNoTasks = tasks.length === 0;
  const showHealthZeroTaskSoftFail =
    mode === 'health' &&
    hasNoTasks &&
    !isLoading &&
    !error &&
    !modelNotFound &&
    healthResult === null;

  const showIdleCta =
    !isLoading && !error && !modelNotFound && !modeHasResult && !(mode === 'health' && hasNoTasks);

  if (!isConfigured) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              AI Not Configured
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Go to Settings to configure your LLM connection.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-3 text-sm text-amber-700 dark:text-amber-300 hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  const dateUrgency = getDateUrgency(project.targetEndDate, {
    hideWhenComplete:
      project.status === 'Completed' ||
      project.status === 'Cancelled' ||
      project.status === 'Archived',
  });
  const showAbandonedRiskBanner =
    healthResult?.overallHealth === 'critical' && Boolean(dateUrgency?.dimCard);

  return (
    <div
      id={AI_PROJECT_ASSIST_PANEL_ID}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className={cn(aiProjectAssistPanelShellClassName)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-gray-900 dark:text-white">{getModeTitle()}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 rounded transition-colors"
          aria-label="Close AI project tools"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{getModeDescription()}</p>

      {mode === 'risks' && onWeeklyRiskPinChange ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900/30">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Weekly review ritual
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Auto-run Risk Assessment when your weekly review generates (max 5 pins).
            </p>
          </div>
          <Button
            type="button"
            variant={project.weeklyRiskAssessmentPinned ? 'primary' : 'secondary'}
            size="sm"
            disabled={pinBusy}
            onClick={handleWeeklyRiskPinToggle}
            className={
              project.weeklyRiskAssessmentPinned ? 'bg-amber-600 hover:bg-amber-700' : undefined
            }
          >
            <Pin className="mr-1 h-4 w-4" />
            {project.weeklyRiskAssessmentPinned ? 'Pinned' : 'Pin for weekly review'}
          </Button>
        </div>
      ) : null}

      {showHealthZeroTaskSoftFail ? (
        <div className="rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Health analysis needs at least one linked task. Generate first tasks to get a meaningful
            score and factors.
          </p>
          <Button
            onClick={() => onRequestGenerateTasks?.()}
            variant="primary"
            size="sm"
            className="mt-3 bg-amber-600 hover:bg-amber-700"
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Generate first tasks
          </Button>
        </div>
      ) : showIdleCta ? (
        <Button
          onClick={handleInvoke}
          variant="primary"
          size="sm"
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Wand2 className="w-4 h-4 mr-1" />
          {getModeCtaLabel()}
        </Button>
      ) : null}

      {isLoading ? (
        <AIProjectAssistLoadingSkeleton mode={mode} statusMessage={getLoadingStatusMessage()} />
      ) : null}

      {modelNotFound ? (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AIFeatureModelRecovery
            feature={modelNotFound.feature}
            failedModel={modelNotFound.model}
            onRetry={handleInvoke}
            onDismiss={() => setModelNotFound(null)}
          />
        </div>
      ) : null}

      {error && !modelNotFound ? (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      ) : null}

      {mode === 'health' && healthResult ? (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Health score
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${overallHealthBadgeClass(
                    healthResult.overallHealth
                  )}`}
                >
                  {formatOverallHealthLabel(healthResult.overallHealth)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  Trajectory: {healthResult.trajectory}
                </span>
              </div>
              <span className={`text-3xl font-bold ${getHealthColor(healthResult.healthScore)}`}>
                {healthResult.healthScore}%
              </span>
            </div>
          </div>

          {showAbandonedRiskBanner ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              Stale / Abandoned risk — target date is far past with incomplete work remaining.
            </div>
          ) : null}

          {healthResult.healthFactors.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Health factors
              </span>
              {healthResult.healthFactors.map((factor, i) => (
                <div key={i} className={`p-3 rounded-lg border ${factorCardClass(factor.status)}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {factor.factorName}
                    </p>
                    <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                      {factor.status} · impact {factor.impact}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {healthResult.positiveIndicators.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                What&apos;s going well
              </span>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {healthResult.positiveIndicators.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {healthResult.concerns.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Concerns</span>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {healthResult.concerns.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {healthResult.priorityActions.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Priority actions
              </span>
              <ul className="space-y-2">
                {healthResult.priorityActions.map((action, i) => {
                  const isCreateTask = action.kind === 'createTask';
                  const canAct = isCreateTask
                    ? Boolean(onCreateTaskFromAction)
                    : Boolean(onLogActivityFromAction);

                  return (
                    <li
                      key={i}
                      className="flex flex-col gap-2 rounded-lg border border-amber-200/80 bg-white p-3 dark:border-amber-800/80 dark:bg-gray-800 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">{action.text}</p>
                      {canAct ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0 self-start"
                          onClick={() =>
                            isCreateTask
                              ? onCreateTaskFromAction?.(action)
                              : onLogActivityFromAction?.(action)
                          }
                        >
                          {isCreateTask ? (
                            <>
                              <Plus className="mr-1 h-4 w-4" />
                              Create task
                            </>
                          ) : (
                            <>
                              <NotebookPen className="mr-1 h-4 w-4" />
                              Log activity
                            </>
                          )}
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : null}

      {mode === 'generate' && tasksResult ? (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Suggested tasks
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {tasksResult.recommendedStart}
            </p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Est. total hours: {tasksResult.estimatedTotalHours}</span>
              <span>Critical path (indices): {tasksResult.criticalPath.join(', ') || '—'}</span>
            </div>
          </div>

          {tasksResult.executionPhases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tasksResult.executionPhases.map((phase, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200"
                >
                  {phase}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {tasksResult.tasks.map((task, i) => (
              <div key={i} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {task.priority} · ~{task.estimatedHours}h · {task.category}
                  {task.dependencies?.length ? ` · deps: [${task.dependencies.join(', ')}]` : ''}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => {
                const inputs = tasksResult.tasks.map((t) => generatedTaskToCreateInput(t, project));
                onCreateTasks?.(inputs);
                onClose();
              }}
              variant="primary"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              Create All Tasks
            </Button>
          </div>
        </div>
      ) : null}

      {mode === 'risks' && risksResult ? (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Overall risk level
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risksResult.overallRiskLevel)}`}
              >
                {risksResult.overallRiskLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {risksResult.topPriorityRisk}
            </p>
          </div>

          {risksResult.risks.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Identified risks
              </span>
              {risksResult.risks.map((risk, i) => {
                const severity = riskSeverityFromScore(risk.riskScore);
                return (
                  <div key={i} className={`p-3 rounded-lg border ${getRiskColor(severity)}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {risk.riskTitle}
                      </p>
                      <span className="text-xs uppercase whitespace-nowrap">
                        score {risk.riskScore} · {severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {risk.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs uppercase text-gray-500 dark:text-gray-400">
                      <span>{risk.category}</span>
                      <span>
                        P×I: {risk.probability} / {risk.impact}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-sm mt-2 text-gray-600 dark:text-gray-400 space-y-1">
                      {risk.mitigationStrategies.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ul>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      <strong>Contingency:</strong> {risk.contingencyPlan}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {risksResult.riskMitigationRoadmap.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Mitigation roadmap
              </span>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {risksResult.riskMitigationRoadmap.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
