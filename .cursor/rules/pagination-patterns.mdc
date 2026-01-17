---
description: "USE WHEN implementing pagination controls and paginated data display."
globs: ""
alwaysApply: false
---

# Pagination Patterns

Standards for implementing pagination in lists and tables.

## Basic Pagination Component

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
```

## Pagination with Info

```tsx
interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

function PaginationInfo({ currentPage, pageSize, totalItems }: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Showing <span className="font-medium">{start}</span> to{' '}
      <span className="font-medium">{end}</span> of{' '}
      <span className="font-medium">{totalItems}</span> results
    </p>
  );
}
```

## Full Pagination Bar

```tsx
function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <PaginationInfo
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
      />

      <div className="flex items-center gap-4">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
```

## usePagination Hook

```tsx
interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

function usePagination({ initialPage = 1, initialPageSize = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    page,
    pageSize,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    offset: (page - 1) * pageSize,
  };
}
```

## Load More Pattern

```tsx
function LoadMoreList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tasks', page],
    queryFn: () => fetchTasks({ page, limit: 20 }),
  });

  const [allItems, setAllItems] = useState<Task[]>([]);

  useEffect(() => {
    if (data?.items) {
      setAllItems(prev => page === 1 ? data.items : [...prev, ...data.items]);
    }
  }, [data, page]);

  const hasMore = data && page < data.totalPages;

  return (
    <div>
      <TaskList tasks={allItems} />

      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isFetching}
          className="w-full py-3 mt-4 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
        >
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## URL-based Pagination

```tsx
function PaginatedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('size')) || 10;

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  const { data } = useQuery({
    queryKey: ['tasks', { page, pageSize }],
    queryFn: () => fetchTasks({ page, limit: pageSize }),
  });

  return (
    <>
      <TaskList tasks={data?.items || []} />
      <Pagination
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={handlePageChange}
      />
    </>
  );
}
```
