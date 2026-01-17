import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit2,
  Trash2,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Layers,
  Activity,
  Target,
  Grid3x3,
  Filter,
  X,
} from 'lucide-react';
import type {
  Metric,
  MetricLog,
  CreateMetricInput,
  UpdateMetricInput,
  CreateMetricLogInput,
  FilterOptions,
  Goal,
  Area,
} from '@/types/growth-system';
import { metricsService } from '@/services/growth-system/metrics.service';
import { goalsService } from '@/services/growth-system/goals.service';
import Button from '@/components/atoms/Button';
import { MetricCard } from '@/components/molecules/MetricCard';
import { MetricLogForm } from '@/components/molecules/MetricLogForm';
import { MetricDetailTabs } from '@/components/organisms/MetricDetailTabs';
import { MetricTimeSeriesChart } from '@/components/molecules/MetricTimeSeriesChart';
import { MetricLogHistory } from '@/components/molecules/MetricLogHistory';
import { MetricInsightsPanel } from '@/components/molecules/MetricInsightsPanel';
import { MetricMilestoneSystem } from '@/components/organisms/MetricMilestoneSystem';
import { MetricComparisonView } from '@/components/molecules/MetricComparisonView';
import { MetricPredictions } from '@/components/molecules/MetricPredictions';
import { GoalMetricLink } from '@/components/molecules/GoalMetricLink';
import { MetricCoaching } from '@/components/molecules/MetricCoaching';
import { MetricEmptyStates } from '@/components/molecules/MetricEmptyStates';
import { MetricProgressRing } from '@/components/molecules/MetricProgressRing';
import { calculateProgress, getTrendData, getPeriodComparison } from '@/utils/metric-analytics';
import { MetricCreateForm } from '@/components/organisms/MetricCreateForm';
import { MetricEditForm } from '@/components/organisms/MetricEditForm';
import Dialog from '@/components/organisms/Dialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AreaBadge } from '@/components/atoms/AreaBadge';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { llmConfig } from '@/lib/llm';
import { SUBCATEGORY_LABELS, AREAS, AREA_LABELS } from '@/constants/growth-system';
import {
  groupByArea,
  groupByStatus,
  groupByMomentum,
  sortByPriority,
  filterMetrics,
} from '@/utils/metric-grouping';

const STATUSES = ['Active', 'Paused', 'Archived'];

type ViewMode = 'grid' | 'list' | 'area' | 'status' | 'momentum' | 'priority';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricLogs, setMetricLogs] = useState<Map<string, MetricLog[]>>(new Map());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalMetrics, setGoalMetrics] = useState<Map<string, string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [metricToLog, setMetricToLog] = useState<Metric | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<Metric | null>(null);

  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'trends' | 'patterns' | 'correlations' | 'predictions' | 'goals' | 'history'
  >('overview');
  const isAIConfigured = llmConfig.isConfigured();

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await metricsService.getAll();
      if (response.success && response.data) {
        setMetrics(response.data);
        response.data.forEach((metric) => {
          loadMetricLogs(metric.id);
        });
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetricLogs = async (metricId: string) => {
    try {
      const response = await metricsService.getHistory(metricId);
      if (response.success && response.data) {
        setMetricLogs((prev) => new Map(prev).set(metricId, response.data!));
      }
    } catch (error) {
      console.error('Failed to load metric logs:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalsService.getAll();
      if (response.success && response.data) {
        setGoals(response.data);
        // Load goal-metric relationships
        const goalMetricMap = new Map<string, string[]>();
        for (const goal of response.data) {
          try {
            const metricResponse = await goalsService.getLinkedMetrics(goal.id);
            if (metricResponse.success && metricResponse.data) {
              goalMetricMap.set(
                goal.id,
                metricResponse.data.map((gm) => gm.metricId)
              );
            }
          } catch {
            // Ignore errors for individual goals
          }
        }
        setGoalMetrics(goalMetricMap);
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const handleCreateMetric = async (input: CreateMetricInput) => {
    setIsSubmitting(true);
    try {
      const response = await metricsService.create(input);
      if (response.success && response.data) {
        setMetrics([response.data, ...metrics]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to create metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMetric = async (id: string, input: UpdateMetricInput) => {
    setIsSubmitting(true);
    try {
      const response = await metricsService.update(id, input);
      if (response.success && response.data) {
        const updatedMetrics = metrics.map((m) => (m.id === id ? response.data! : m));
        setMetrics(updatedMetrics);
        if (selectedMetric && selectedMetric.id === id) {
          setSelectedMetric(response.data);
        }
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to update metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMetric = async () => {
    if (!metricToDelete) return;

    setIsSubmitting(true);
    try {
      const response = await metricsService.delete(metricToDelete.id);
      if (response.success) {
        const updatedMetrics = metrics.filter((m) => m.id !== metricToDelete.id);
        setMetrics(updatedMetrics);
        if (selectedMetric && selectedMetric.id === metricToDelete.id) {
          setSelectedMetric(null);
        }
        setMetricToDelete(null);
      }
    } catch (error) {
      console.error('Failed to delete metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogValue = async (input: CreateMetricLogInput) => {
    setIsSubmitting(true);
    try {
      const response = await metricsService.logValue(input);
      if (response.success && response.data) {
        loadMetricLogs(input.metricId);
        setIsLogDialogOpen(false);
        setMetricToLog(null);
      }
    } catch (error) {
      console.error('Failed to log value:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMetricClick = (metric: Metric) => {
    setSelectedMetric(metric);
  };

  const handleBackToGrid = () => {
    setSelectedMetric(null);
  };

  const handleQuickLog = (metric: Metric) => {
    setMetricToLog(metric);
    setIsLogDialogOpen(true);
  };

  const filteredMetrics = useMemo(() => {
    return filterMetrics(metrics, metricLogs, {
      area: filters.area,
      status: filters.status,
      momentum: filters.momentum,
      targetProximity: filters.targetProximity,
      loggingFrequency: filters.loggingFrequency,
      searchQuery,
    });
  }, [metrics, metricLogs, filters, searchQuery]);

  const activeFilterCount = [
    filters.area,
    filters.status,
    filters.momentum,
    filters.targetProximity,
    filters.loggingFrequency,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setFilters({});
  };

  const groupedMetrics = useMemo(() => {
    switch (viewMode) {
      case 'area':
        return groupByArea(filteredMetrics);
      case 'status':
        return groupByStatus(filteredMetrics, metricLogs);
      case 'momentum':
        return groupByMomentum(filteredMetrics, metricLogs);
      case 'priority':
        return {
          Priority: sortByPriority(filteredMetrics, metricLogs, goals, goalMetrics),
        };
      default:
        return { All: filteredMetrics };
    }
  }, [filteredMetrics, viewMode, metricLogs, goals, goalMetrics]);

  if (selectedMetric) {
    const logs = metricLogs.get(selectedMetric.id) || [];
    const latestLog = logs.length > 0 ? logs[0] : null;
    const currentValue = latestLog?.value || 0;
    const progress = calculateProgress(
      currentValue,
      selectedMetric.targetValue,
      selectedMetric.direction
    );
    const trend = getTrendData(logs, selectedMetric);
    const comparison = getPeriodComparison(logs, 'week');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Metrics
          </button>

          {/* Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedMetric.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <AreaBadge area={selectedMetric.area} />
                  {selectedMetric.subCategory && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {SUBCATEGORY_LABELS[selectedMetric.subCategory]}
                    </span>
                  )}
                  <StatusBadge status={selectedMetric.status} size="sm" />
                </div>
                {selectedMetric.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedMetric.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMetricToDelete(selectedMetric)}
                  className="hover:!bg-red-50 hover:!text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentValue.toFixed(selectedMetric.unit === 'dollars' ? 0 : 1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedMetric.unit === 'custom'
                    ? selectedMetric.customUnit
                    : selectedMetric.unit}
                </div>
              </div>
              {selectedMetric.targetValue && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {progress.percentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {progress.remaining?.toFixed(1) || 0} to target
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Logs</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logs.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {latestLog
                    ? `Last: ${new Date(latestLog.loggedAt).toLocaleDateString()}`
                    : 'No logs'}
                </div>
              </div>
              {trend && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trend</div>
                  <div
                    className={`text-2xl font-bold ${trend.isImproving ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {trend.changePercent >= 0 ? '+' : ''}
                    {trend.changePercent.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {trend.velocity > 0 ? 'Improving' : trend.velocity < 0 ? 'Declining' : 'Stable'}
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights Button */}
            {isAIConfigured && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowInsightsPanel(!showInsightsPanel)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>AI Insights</span>
                  {showInsightsPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            )}
          </div>

          {/* Tabbed Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <MetricDetailTabs activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Progress Ring */}
                  {selectedMetric.targetValue && (
                    <div className="flex justify-center">
                      <MetricProgressRing
                        metric={selectedMetric}
                        currentValue={currentValue}
                        size="lg"
                        showLabel={true}
                        showTarget={true}
                      />
                    </div>
                  )}

                  {/* Coaching */}
                  <MetricCoaching metric={selectedMetric} logs={logs} />

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {comparison && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {comparison.current.period}
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {comparison.current.average.toFixed(1)}
                        </div>
                        <div
                          className={`text-xs mt-1 ${comparison.isImproving ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {comparison.changePercent >= 0 ? '+' : ''}
                          {comparison.changePercent.toFixed(1)}% vs {comparison.previous.period}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Milestones Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Achievements
                    </h3>
                    <MetricMilestoneSystem metric={selectedMetric} logs={logs} />
                  </div>
                </div>
              )}

              {activeTab === 'trends' && (
                <MetricTimeSeriesChart
                  metric={selectedMetric}
                  logs={logs}
                  height={400}
                  showTarget={true}
                  showTrend={true}
                  showAnomalies={true}
                  showPrediction={true}
                  showComparison={true}
                />
              )}

              {activeTab === 'patterns' && (
                <div className="space-y-6">
                  <MetricInsightsPanel
                    metric={selectedMetric}
                    logs={logs}
                    onClose={() => setShowInsightsPanel(false)}
                  />
                </div>
              )}

              {activeTab === 'correlations' && (
                <MetricComparisonView
                  primaryMetric={selectedMetric}
                  primaryLogs={logs}
                  allMetrics={metrics}
                  allLogs={metricLogs}
                  onMetricSelect={handleMetricClick}
                />
              )}

              {activeTab === 'predictions' && (
                <MetricPredictions metric={selectedMetric} logs={logs} />
              )}

              {activeTab === 'goals' && (
                <div className="space-y-6">
                  <GoalMetricLink
                    metric={selectedMetric}
                    logs={logs}
                    onLinkChange={() => loadGoals()}
                  />
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Log History ({logs.length})
                    </h3>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleQuickLog(selectedMetric)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Log Value
                    </Button>
                  </div>
                  {logs.length === 0 ? (
                    <MetricEmptyStates
                      type="no_logs"
                      onLogValue={() => handleQuickLog(selectedMetric)}
                      metric={selectedMetric}
                    />
                  ) : (
                    <MetricLogHistory metric={selectedMetric} logs={logs} />
                  )}
                </div>
              )}
            </MetricDetailTabs>
          </div>

          {/* AI Insights Panel (Sidebar) */}
          {showInsightsPanel && (
            <MetricInsightsPanel
              metric={selectedMetric}
              logs={logs}
              onClose={() => setShowInsightsPanel(false)}
            />
          )}
        </div>

        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Metric"
          className="max-w-2xl"
        >
          <MetricEditForm
            metric={selectedMetric}
            onSubmit={handleUpdateMetric}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Metrics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and measure your progress</p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Metric
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search metrics..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Selector and Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('area')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'area'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Area
                </button>
                <button
                  onClick={() => setViewMode('status')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'status'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Status
                </button>
                <button
                  onClick={() => setViewMode('momentum')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'momentum'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Momentum
                </button>
                <button
                  onClick={() => setViewMode('priority')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    viewMode === 'priority'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  Priority
                </button>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Area
                </label>
                <select
                  value={filters.area || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, area: (e.target.value as Area) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Areas</option>
                  {AREAS.map((area) => (
                    <option key={area} value={area}>
                      {AREA_LABELS[area]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
              </div>
            </div>
          ) : filteredMetrics.length === 0 ? (
            metrics.length === 0 ? (
              <MetricEmptyStates
                type="no_metrics"
                onCreateMetric={() => setIsCreateDialogOpen(true)}
              />
            ) : (
              <EmptyState
                title="No metrics found"
                description={
                  searchQuery || filters.area || filters.status
                    ? 'Try adjusting your filters or search query'
                    : 'Get started by creating your first metric'
                }
                actionLabel="Create Metric"
                onAction={() => setIsCreateDialogOpen(true)}
              />
            )
          ) : (
            <div>
              {viewMode === 'list' ? (
                <div className="space-y-3">
                  {filteredMetrics.map((metric) => {
                    const logs = metricLogs.get(metric.id) || [];
                    return (
                      <div
                        key={metric.id}
                        onClick={() => handleMetricClick(metric)}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {metric.name}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {logs[0]?.value.toFixed(metric.unit === 'dollars' ? 0 : 1) || '0'}
                              </span>
                              <span>
                                {metric.unit === 'custom' ? metric.customUnit : metric.unit}
                              </span>
                              {logs[0] && (
                                <span className="text-xs">
                                  {new Date(logs[0].loggedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <AreaBadge area={metric.area} />
                            <StatusBadge status={metric.status} size="sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                Object.entries(groupedMetrics).map(([groupName, groupMetrics]) => (
                  <div key={groupName} className="mb-8">
                    {viewMode !== 'grid' && (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {groupName} ({groupMetrics.length})
                      </h2>
                    )}
                    <div
                      className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}
                    >
                      {groupMetrics.map((metric) => (
                        <MetricCard
                          key={metric.id}
                          metric={metric}
                          logs={metricLogs.get(metric.id) || []}
                          onClick={handleMetricClick}
                          onQuickLog={handleQuickLog}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Create New Metric"
        className="max-w-2xl"
      >
        <MetricCreateForm
          onSubmit={handleCreateMetric}
          onCancel={() => setIsCreateDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      <Dialog
        isOpen={isLogDialogOpen}
        onClose={() => {
          setIsLogDialogOpen(false);
          setMetricToLog(null);
        }}
        title="Log Metric Value"
        className="max-w-lg"
      >
        {metricToLog && (
          <MetricLogForm
            metric={metricToLog}
            logs={metricLogs.get(metricToLog.id) || []}
            onSubmit={handleLogValue}
            onCancel={() => {
              setIsLogDialogOpen(false);
              setMetricToLog(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Dialog>

      <Dialog
        isOpen={!!metricToDelete}
        onClose={() => setMetricToDelete(null)}
        title="Delete Metric"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this metric? This action cannot be undone.
          </p>
          {metricToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="font-semibold text-gray-900 dark:text-white">{metricToDelete.name}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setMetricToDelete(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteMetric}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Metric'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
