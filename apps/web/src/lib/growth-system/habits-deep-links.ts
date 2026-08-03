import { ROUTES } from '@/routes';

export function habitsDeepLinkHref(habitId: string): string {
  const q = new URLSearchParams({ habitId });
  return `${ROUTES.admin.habits}?${q.toString()}`;
}
