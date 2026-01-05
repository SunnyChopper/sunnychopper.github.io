import { useState } from 'react';
import type { Metric, CreateMetricLogInput } from '../../types/growth-system';
import Button from '../atoms/Button';

interface MetricLogFormProps {
  metric: Metric;
  onSubmit: (input: CreateMetricLogInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MetricLogForm({ metric, onSubmit, onCancel, isLoading }: MetricLogFormProps) {
  const [formData, setFormData] = useState<CreateMetricLogInput>({
    metricId: metric.id,
    value: 0,
    notes: '',
    loggedAt: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Metric
        </label>
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{metric.name}</p>
          {metric.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{metric.description}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Value * ({metric.unit === 'custom' ? metric.customUnit : metric.unit})
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {metric.targetValue && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Target: {metric.targetValue} {metric.unit === 'custom' ? metric.customUnit : metric.unit} ({metric.direction})
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          value={formData.loggedAt}
          onChange={(e) => setFormData({ ...formData, loggedAt: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional notes about this measurement..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Logging...' : 'Log Value'}
        </Button>
      </div>
    </form>
  );
}
