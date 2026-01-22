import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type {
  CreateGoalInput,
  Area,
  SubCategory,
  TimeHorizon,
  Priority,
  GoalStatus,
  SuccessCriterion,
} from '@/types/growth-system';
import Button from '@/components/atoms/Button';
import {
  AREAS,
  AREA_LABELS,
  GOAL_STATUSES,
  GOAL_STATUS_LABELS,
  GOAL_TIME_HORIZONS,
  PRIORITIES,
} from '@/constants/growth-system';

interface GoalCreateFormProps {
  onSubmit: (input: CreateGoalInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GoalCreateForm({ onSubmit, onCancel, isLoading }: GoalCreateFormProps) {
  const [formData, setFormData] = useState<CreateGoalInput>({
    title: '',
    description: '',
    area: 'Health',
    timeHorizon: 'Quarterly',
    priority: 'P2',
    status: 'Planning',
    successCriteria: [] as string[],
  });

  const [criterionInput, setCriterionInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addCriterion = () => {
    if (criterionInput.trim()) {
      const currentCriteria = Array.isArray(formData.successCriteria)
        ? typeof formData.successCriteria[0] === 'string'
          ? (formData.successCriteria as string[])
          : (formData.successCriteria as SuccessCriterion[]).map((c) => c.text)
        : [];
      setFormData({
        ...formData,
        successCriteria: [...currentCriteria, criterionInput.trim()] as string[],
      });
      setCriterionInput('');
    }
  };

  const removeCriterion = (index: number) => {
    const currentCriteria = Array.isArray(formData.successCriteria)
      ? typeof formData.successCriteria[0] === 'string'
        ? (formData.successCriteria as string[])
        : (formData.successCriteria as SuccessCriterion[]).map((c) => c.text)
      : [];
    setFormData({
      ...formData,
      successCriteria: currentCriteria.filter((_, i) => i !== index) as string[],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Run a marathon"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your goal..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Area *
          </label>
          <select
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value as Area })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {AREA_LABELS[area]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sub-Category
          </label>
          <input
            type="text"
            value={formData.subCategory || ''}
            onChange={(e) =>
              setFormData({ ...formData, subCategory: e.target.value as SubCategory })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Horizon *
          </label>
          <select
            value={formData.timeHorizon}
            onChange={(e) =>
              setFormData({ ...formData, timeHorizon: e.target.value as TimeHorizon })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {GOAL_TIME_HORIZONS.map((horizon) => (
              <option key={horizon} value={horizon}>
                {horizon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as GoalStatus })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GOAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {GOAL_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Date
          </label>
          <input
            type="date"
            value={formData.targetDate || ''}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Success Criteria
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={criterionInput}
            onChange={(e) => setCriterionInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add a success criterion..."
          />
          <Button type="button" variant="secondary" size="sm" onClick={addCriterion}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.successCriteria && formData.successCriteria.length > 0 && (
          <div className="space-y-2">
            {formData.successCriteria.map((criterion, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {typeof criterion === 'string' ? criterion : criterion.text}
                </span>
                <button
                  type="button"
                  onClick={() => removeCriterion(index)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
