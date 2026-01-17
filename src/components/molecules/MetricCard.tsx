import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import type { Metric, MetricLog } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';
import { StatusBadge } from '../atoms/StatusBadge';
import { MetricProgressRing } from './MetricProgressRing';
import { MetricSparkline } from './MetricSparkline';
import { MetricHeatmapPreview } from './MetricHeatmapPreview';
import { getTrendData, calculateProgress } from '../../utils/metric-analytics';
import { SUBCATEGORY_LABELS } from '../../constants/growth-system';

interface MetricCardProps {
  metric: Metric;
  logs?: MetricLog[];
  onClick: (metric: Metric) => void;
  onQuickLog?: (metric: Metric) => void;
}

export function MetricCard({ metric, logs = [], onClick, onQuickLog }: MetricCardProps) {
  const latestLog = logs.length > 0 ? logs[0] : null;
  const currentValue = latestLog?.value || 0;

  const trend = useMemo(() => {
    if (logs.length < 2) return null;
    return getTrendData(logs, metric);
  }, [logs, metric]);

  const progress = useMemo(() => {
    return calculateProgress(currentValue, metric.targetValue, metric.direction);
  }, [currentValue, metric.targetValue, metric.direction]);

  const getStatus = () => {
    if (!metric.targetValue) return 'No Target';
    if (progress.isOnTrack) return 'On Track';
    if (progress.percentage >= 50) return 'At Risk';
    return 'Stalled';
  };

  const status = getStatus();
  const statusColors = {
    'On Track': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'At Risk': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    Stalled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'No Target': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  };

  const getVelocityIcon = () => {
    if (!trend) return null;
    if (trend.acceleration > 0.1) {
      return <ArrowUp className="w-3 h-3 text-green-600 dark:text-green-400" />;
    } else if (trend.acceleration < -0.1) {
      return <ArrowDown className="w-3 h-3 text-red-600 dark:text-red-400" />;
    }
    return null;
  };

  const unit = metric.unit === 'custom' ? metric.customUnit || '' : metric.unit;

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer"
      onClick={() => onClick(metric)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {metric.name}
          </h3>
          {metric.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {metric.description}
            </p>
          )}
        </div>
        <div
          className={`px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${statusColors[status as keyof typeof statusColors]}`}
        >
          {status}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-4">
        <AreaBadge area={metric.area} />
        {metric.subCategory && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {SUBCATEGORY_LABELS[metric.subCategory]}
          </span>
        )}
      </div>

      {/* Progress Ring and Current Value */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentValue.toFixed(metric.unit === 'dollars' ? 0 : 1)}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-400">{unit}</span>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.isImproving ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.isImproving
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {trend.changePercent >= 0 ? '+' : ''}
                  {trend.changePercent.toFixed(1)}%
                </span>
                {getVelocityIcon()}
              </div>
            )}
          </div>
          {latestLog && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(latestLog.loggedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {metric.targetValue && (
          <div className="flex-shrink-0">
            <MetricProgressRing
              metric={metric}
              currentValue={currentValue}
              size="sm"
              showLabel={true}
              showTarget={false}
            />
          </div>
        )}
      </div>

      {/* Sparkline Chart */}
      {logs.length > 0 && (
        <div className="mb-4">
          <MetricSparkline
            logs={logs}
            days={30}
            height={40}
            width={280}
            color="blue"
            showPoints={false}
          />
        </div>
      )}

      {/* Heatmap Preview */}
      {logs.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Logging Activity</div>
          <MetricHeatmapPreview logs={logs} months={6} size="sm" />
        </div>
      )}

      {/* Target Info */}
      {metric.targetValue && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Target className="w-4 h-4" />
          <span>
            Target: {metric.targetValue.toFixed(metric.unit === 'dollars' ? 0 : 1)} {unit} (
            {metric.direction})
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <StatusBadge status={metric.status} size="sm" />
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{metric.source}</span>
        </div>
      </div>

      {/* Quick Log Button */}
      {onQuickLog && metric.status === 'Active' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickLog(metric);
          }}
          className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Log Value
        </button>
      )}
    </div>
  );
}
