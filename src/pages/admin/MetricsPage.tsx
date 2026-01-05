import { useState, useEffect } from 'react';
import { Plus, Search, ArrowLeft, Edit2, Trash2, TrendingUp, Calendar, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Metric, MetricLog, CreateMetricInput, UpdateMetricInput, CreateMetricLogInput, FilterOptions } from '../../types/growth-system';
import { metricsService } from '../../services/growth-system/metrics.service';
import Button from '../../components/atoms/Button';
import { MetricCard } from '../../components/molecules/MetricCard';
import { MetricLogForm } from '../../components/molecules/MetricLogForm';
import { FilterPanel } from '../../components/molecules/FilterPanel';
import { MetricCreateForm } from '../../components/organisms/MetricCreateForm';
import { MetricEditForm } from '../../components/organisms/MetricEditForm';
import Dialog from '../../components/organisms/Dialog';
import { EmptyState } from '../../components/molecules/EmptyState';
import { AreaBadge } from '../../components/atoms/AreaBadge';
import { AIMetricAssistPanel } from '../../components/molecules/AIMetricAssistPanel';
import { llmConfig } from '../../lib/llm';

const STATUSES = ['Active', 'Paused', 'Archived'];

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricLogs, setMetricLogs] = useState<Map<string, MetricLog[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [metricToLog, setMetricToLog] = useState<Metric | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<Metric | null>(null);

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiMode, setAIMode] = useState<'patterns' | 'anomalies' | 'correlations' | 'targets' | 'health'>('patterns');
  const isAIConfigured = llmConfig.isConfigured();

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await metricsService.getAll();
      if (response.success && response.data) {
        setMetrics(response.data);
        response.data.forEach(metric => {
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
        setMetricLogs(prev => new Map(prev).set(metricId, response.data!));
      }
    } catch (error) {
      console.error('Failed to load metric logs:', error);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

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

  const filteredMetrics = metrics.filter((metric) => {
    const matchesSearch = !searchQuery || metric.name.toLowerCase().includes(searchQuery.toLowerCase()) || (metric.description && metric.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesArea = !filters.area || metric.area === filters.area;
    const matchesStatus = !filters.status || metric.status === filters.status;
    return matchesSearch && matchesArea && matchesStatus;
  });

  if (selectedMetric) {
    const logs = metricLogs.get(selectedMetric.id) || [];

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

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedMetric.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <AreaBadge area={selectedMetric.area} />
                  {selectedMetric.subCategory && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMetric.subCategory}
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedMetric.status === 'Active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    selectedMetric.status === 'Paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {selectedMetric.status}
                  </span>
                </div>
                {selectedMetric.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {selectedMetric.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                >
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

            <div className="grid grid-cols-3 gap-6 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unit</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMetric.unit === 'custom' ? selectedMetric.customUnit : selectedMetric.unit}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Direction</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMetric.direction}</div>
              </div>
              {selectedMetric.targetValue && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Target</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMetric.targetValue}</div>
                </div>
              )}
            </div>

            {isAIConfigured && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAIAssist(!showAIAssist)}
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  <Sparkles size={18} />
                  <span>AI Metric Tools</span>
                  {showAIAssist ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAIAssist && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setAIMode('patterns')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'patterns' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Pattern Recognition
                      </button>
                      <button onClick={() => setAIMode('anomalies')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'anomalies' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Anomaly Detection
                      </button>
                      <button onClick={() => setAIMode('correlations')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'correlations' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Correlations
                      </button>
                      <button onClick={() => setAIMode('targets')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'targets' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Target Recommendations
                      </button>
                      <button onClick={() => setAIMode('health')} className={`px-3 py-1.5 text-sm rounded-full transition ${aiMode === 'health' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        Health Analysis
                      </button>
                    </div>

                    <AIMetricAssistPanel
                      mode={aiMode}
                      metric={selectedMetric}
                      logs={logs}
                      onClose={() => setShowAIAssist(false)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Log History ({logs.length})
              </h2>
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
              <EmptyState
                title="No logs yet"
                description="Start tracking by logging your first value"
                actionLabel="Log Value"
                onAction={() => handleQuickLog(selectedMetric)}
              />
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {log.value}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedMetric.unit === 'custom' ? selectedMetric.customUnit : selectedMetric.unit}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(log.loggedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track and measure your progress
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Metric
          </Button>
        </div>

        <div className="mb-6">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableFilters={{
                statuses: STATUSES,
              }}
            />
          </div>

          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
                </div>
              </div>
            ) : filteredMetrics.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMetrics.map((metric) => (
                  <MetricCard
                    key={metric.id}
                    metric={metric}
                    recentLogs={metricLogs.get(metric.id)?.slice(0, 2)}
                    onClick={handleMetricClick}
                    onQuickLog={handleQuickLog}
                  />
                ))}
              </div>
            )}
          </div>
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
              <p className="font-semibold text-gray-900 dark:text-white">
                {metricToDelete.name}
              </p>
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
