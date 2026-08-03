import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/atoms/Button';
import { executionLogPaginationBarClassName } from '@/lib/observability/execution-log-surfaces';

export type ExecutionLogPaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  hasMore: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export default function ExecutionLogPagination({
  page,
  total,
  pageSize,
  hasMore,
  isFetching,
  onPageChange,
}: ExecutionLogPaginationProps) {
  const totalPages = total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <nav className={executionLogPaginationBarClassName} aria-label="Execution log pagination">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Page {page}
          {total > 0 ? ` of ${totalPages}` : ''}
        </span>
        <span className="mx-2 text-gray-300 dark:text-gray-600" aria-hidden>
          ·
        </span>
        <span>
          {total === 0
            ? '0 rows'
            : `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${total.toLocaleString()}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={page <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!hasMore || isFetching}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
