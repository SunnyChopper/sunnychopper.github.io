import type { Area, Priority, Project, ProjectStatus, SubCategory } from '@/types/growth-system';
import type { ProjectDto } from '@/types/api/projects.dto';

export type ProjectAdapterInput = ProjectDto | Partial<Project>;

/**
 * Normalizes priority value to ensure it's a valid Priority type.
 */
export function normalizePriority(priority: string | null | undefined): Priority {
  const validPriorities: Priority[] = ['P1', 'P2', 'P3', 'P4'];
  if (priority && validPriorities.includes(priority as Priority)) {
    return priority as Priority;
  }
  return 'P3';
}

/**
 * Normalizes a project object by converting status and area from API format to frontend format
 * and ensuring priority is valid.
 */
const hasSnakeCaseFields = (value: ProjectAdapterInput): value is ProjectDto =>
  'start_date' in value ||
  'target_end_date' in value ||
  'actual_end_date' in value ||
  'sub_category' in value ||
  'user_id' in value ||
  'created_at' in value ||
  'updated_at' in value;

export function normalizeProject(project: ProjectAdapterInput): Project {
  // Cast to ProjectDto to access all possible fields (snake_case, camelCase, and legacy)
  const dto = project as ProjectDto;

  const startDate = hasSnakeCaseFields(project)
    ? (dto.start_date ?? dto.startDate ?? null)
    : (dto.startDate ?? null);
  const endDate = hasSnakeCaseFields(project)
    ? (dto.target_end_date ?? dto.targetEndDate ?? dto.endDate ?? null)
    : (dto.targetEndDate ?? dto.endDate ?? null);
  const completedDate = hasSnakeCaseFields(project)
    ? (dto.actual_end_date ?? dto.actualEndDate ?? dto.completedDate ?? null)
    : (dto.actualEndDate ?? dto.completedDate ?? null);
  const subCategory = (
    hasSnakeCaseFields(project)
      ? (project.sub_category ?? project.subCategory ?? null)
      : (project.subCategory ?? null)
  ) as SubCategory | null;

  return {
    id: project.id as string,
    name: project.name as string,
    description: (project.description ?? null) as string | null,
    area: (project.area ?? 'Operations') as Area,
    subCategory,
    priority: normalizePriority(project.priority as string | null | undefined),
    status: (project.status ?? 'Planning') as ProjectStatus,
    impact: (project.impact ?? 0) as number,
    startDate,
    endDate,
    completedDate,
    notes: (project.notes ?? null) as string | null,
    userId: (hasSnakeCaseFields(project)
      ? (project.user_id ?? project.userId ?? '')
      : (project.userId ?? '')) as string,
    createdAt: (hasSnakeCaseFields(project)
      ? (project.created_at ?? project.createdAt ?? '')
      : (project.createdAt ?? '')) as string,
    updatedAt: (hasSnakeCaseFields(project)
      ? (project.updated_at ?? project.updatedAt ?? '')
      : (project.updatedAt ?? '')) as string,
  };
}
