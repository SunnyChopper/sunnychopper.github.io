import { useState, useEffect } from 'react';
import type { Project, UpdateProjectInput, Area, SubCategory, Priority, ProjectStatus } from '../../types/growth-system';
import Button from '../atoms/Button';

interface ProjectEditFormProps {
  project: Project;
  onSubmit: (id: string, input: UpdateProjectInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AREAS: Area[] = ['Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob'];
const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4'];
const STATUSES: ProjectStatus[] = ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'];

const SUBCATEGORIES: Record<Area, SubCategory[]> = {
  Health: ['Physical', 'Mental', 'Spiritual', 'Nutrition', 'Sleep', 'Exercise'],
  Wealth: ['Income', 'Expenses', 'Investments', 'Debt', 'NetWorth'],
  Love: ['Romantic', 'Family', 'Friends', 'Social'],
  Happiness: ['Joy', 'Gratitude', 'Purpose', 'Peace'],
  Operations: ['Productivity', 'Organization', 'Systems', 'Habits'],
  DayJob: ['Career', 'Skills', 'Projects', 'Performance'],
};

export function ProjectEditForm({ project, onSubmit, onCancel, isLoading }: ProjectEditFormProps) {
  const [formData, setFormData] = useState<UpdateProjectInput>({
    name: project.name,
    description: project.description || '',
    area: project.area,
    subCategory: project.subCategory || undefined,
    priority: project.priority,
    status: project.status,
    impact: project.impact,
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    notes: project.notes || '',
  });

  useEffect(() => {
    setFormData({
      name: project.name,
      description: project.description || '',
      area: project.area,
      subCategory: project.subCategory || undefined,
      priority: project.priority,
      status: project.status,
      impact: project.impact,
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      notes: project.notes || '',
    });
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: UpdateProjectInput = {
      ...formData,
      description: formData.description || undefined,
      subCategory: formData.subCategory || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      notes: formData.notes || undefined,
    };
    onSubmit(project.id, input);
  };

  const availableSubCategories = SUBCATEGORIES[formData.area || project.area];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter project name"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the project"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Area *
          </label>
          <select
            required
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: e.target.value as Area, subCategory: undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sub-Category
          </label>
          <select
            value={formData.subCategory || ''}
            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value as SubCategory || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            {availableSubCategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Impact Score (1-10)
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.impact}
          onChange={(e) => setFormData({ ...formData, impact: parseInt(e.target.value) || 5 })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or details"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
