import { Link } from 'react-router-dom';

import { plannerMutedClassName } from '@/lib/planner/planner-surfaces';
import { ROUTES } from '@/routes';

/** Muted Plan Day drawer footer — calendar connect hint via Settings. */
export function PlannerCalendarOverlay() {
  return (
    <p
      className={`text-[11px] leading-snug ${plannerMutedClassName}`}
      title="Busy/free blocks appear on planner days when Google Calendar is synced."
    >
      Calendar sync — connect Google in{' '}
      <Link to={ROUTES.admin.settings} className="text-blue-600 dark:text-blue-400 hover:underline">
        Settings
      </Link>
      .
    </p>
  );
}
