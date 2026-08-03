import { TASK_STATUSES } from '@/constants/growth-system';
import { ROUTES } from '@/routes';
import type { TaskStatus } from '@/types/growth-system';

export type TasksEnergyTagFilter = 'any' | 'untagged';

export type TasksDeepLinkParams = {
  status?: TaskStatus;
  energyTag?: TasksEnergyTagFilter;
  view?: 'list';
  hasDeepLinkParams: boolean;
};

const TASK_STATUS_SET = new Set<string>(TASK_STATUSES);

function isTaskStatus(value: string | null): value is TaskStatus {
  return value !== null && TASK_STATUS_SET.has(value);
}

export function parseTasksDeepLinkParams(
  searchParams: URLSearchParams | string
): TasksDeepLinkParams {
  const sp =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams.startsWith('?') ? searchParams.slice(1) : searchParams)
      : searchParams;

  const statusRaw = sp.get('status');
  const status = isTaskStatus(statusRaw) ? statusRaw : undefined;
  const energyTagRaw = sp.get('energyTag');
  const energyTag: TasksEnergyTagFilter | undefined =
    energyTagRaw === 'untagged' ? 'untagged' : undefined;
  const view = sp.get('view') === 'list' ? 'list' : undefined;
  const hasDeepLinkParams = Boolean(status || energyTag || view);

  return { status, energyTag, view, hasDeepLinkParams };
}

export function tasksUntaggedCompletedHref(): string {
  const q = new URLSearchParams({ status: 'Done', energyTag: 'untagged', view: 'list' });
  return `${ROUTES.admin.tasks}?${q.toString()}`;
}
