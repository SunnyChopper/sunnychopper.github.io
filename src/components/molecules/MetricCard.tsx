import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import type { Metric, MetricLog } from '../../types/growth-system';
import { AreaBadge } from '../atoms/AreaBadge';

interface MetricCardProps {
  metric: Metric;
  recentLogs?: MetricLog[];
  onClick: (metric: Metric) => void;
  onQuickLog?: (metric: Metric) => void;
}

export function MetricCard({ metric, recentLogs = [], onClick, onQuickLog }: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'Archived':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const latestLog = recentLogs[0];
  const previousLog = recentLogs[1];
  const trend = latestLog && previousLog ? latestLog.value - previousLog.value : 0;
  const trendPercentage = previousLog ? Math.abs((trend / previousLog.value) * 100) : 0;

  const getTrendIcon = () => {
    if (!latestLog || !previousLog) return null;
    if (metric.direction === 'Higher') {
      return trend > 0 ? <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
    if (metric.direction === 'Lower') {
      return trend < 0 ? <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
    }
    return null;
  };

  const isOnTrack = () => {
    if (!latestLog || !metric.targetValue) return null;
    if (metric.direction === 'Higher') {
      return latestLog.value >= metric.targetValue;
    }
    if (metric.direction === 'Lower') {
      return latestLog.value <= metric.targetValue;
    }
    if (metric.direction === 'Target') {
      const threshold = metric.targetValue * 0.1;
      return Math.abs(latestLog.value - metric.targetValue) <= threshold;
    }
    return null;
  };

  const trackStatus = isOnTrack();

  return (
    <div
      className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer"
    >
      <div onClick={() => onClick(metric)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {metric.name}
            </h3>
            {metric.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {metric.description}
              </p>
            )}
          </div>
          {trackStatus !== null && (
            <div className={`w-3 h-3 rounded-full ${trackStatus ? 'bg-green-500' : 'bg-yellow-500'} ml-2 flex-shrink-0`} />
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <AreaBadge area={metric.area} />
          {metric.subCategory && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {metric.subCategory}
            </span>
          )}
        </div>

        {latestLog && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {latestLog.value}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
                  {metric.unit === 'custom' ? metric.customUnit : metric.unit}
                </span>
              </div>
              {getTrendIcon()}
            </div>
            {previousLog && (
              <div className="flex items-center gap-2 text-sm">
                <span className={trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {trend > 0 ? '+' : ''}{trend.toFixed(1)} ({trendPercentage.toFixed(1)}%)
                </span>
                <span className="text-gray-500 dark:text-gray-400">from previous</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <Calendar className="w-3 h-3" />
              <span>{new Date(latestLog.loggedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {metric.targetValue && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Target className="w-4 h-4" />
            <span>Target: {metric.targetValue} {metric.unit === 'custom' ? metric.customUnit : metric.unit}</span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              ({metric.direction})
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
            {metric.status}
          </span>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {metric.source}
            </span>
          </div>
        </div>
      </div>

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
