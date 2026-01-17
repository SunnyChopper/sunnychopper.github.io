---
description: "USE WHEN fetching, caching, and mutating server data with React Query."
globs: ""
alwaysApply: false
---

# React Query Patterns

Standards for server state management with TanStack Query.

## Basic Query

```tsx
import { useQuery } from '@tanstack/react-query';

function TaskList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getAll(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <TaskListContent tasks={data} />;
}
```

## Query Keys

```tsx
// Simple key
queryKey: ['tasks']

// With parameters
queryKey: ['tasks', { status: 'active' }]
queryKey: ['task', taskId]
queryKey: ['tasks', projectId, { status, priority }]

// Hierarchical keys for cache invalidation
queryKey: ['projects', projectId, 'tasks']
// Invalidate all project tasks: ['projects', projectId, 'tasks']
// Invalidate all projects: ['projects']
```

## Mutations

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateTaskButton() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newTask: CreateTaskInput) => tasksService.create(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ title: 'New Task' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Creating...' : 'Create Task'}
    </button>
  );
}
```

## Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateTask,
  onMutate: async (updatedTask) => {
    await queryClient.cancelQueries({ queryKey: ['tasks'] });

    const previousTasks = queryClient.getQueryData(['tasks']);

    queryClient.setQueryData(['tasks'], (old: Task[]) =>
      old.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );

    return { previousTasks };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['tasks'], context?.previousTasks);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  },
});
```

## Dependent Queries

```tsx
// Second query depends on first
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

const { data: projects } = useQuery({
  queryKey: ['projects', user?.id],
  queryFn: () => fetchProjects(user!.id),
  enabled: !!user?.id,
});
```

## Pagination

```tsx
function PaginatedList() {
  const [page, setPage] = useState(1);

  const { data, isPlaceholderData } = useQuery({
    queryKey: ['tasks', { page }],
    queryFn: () => fetchTasks({ page, limit: 10 }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <TaskList tasks={data?.items} />
      <Pagination
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        isLoading={isPlaceholderData}
      />
    </>
  );
}
```

## Infinite Scroll

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['tasks'],
  queryFn: ({ pageParam = 0 }) => fetchTasks({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});

const allTasks = data?.pages.flatMap(page => page.items) ?? [];
```

## Query Configuration

```tsx
// Global defaults in QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Per-query overrides
useQuery({
  queryKey: ['realtime-data'],
  queryFn: fetchRealtime,
  staleTime: 0,
  refetchInterval: 10000,
});
```

## Error Handling

```tsx
const { error, isError } = useQuery({
  queryKey: ['tasks'],
  queryFn: fetchTasks,
});

if (isError) {
  return (
    <div className="text-red-600">
      {error instanceof Error ? error.message : 'An error occurred'}
    </div>
  );
}
```

## Prefetching

```tsx
// Prefetch on hover
const queryClient = useQueryClient();

<Link
  to={`/task/${taskId}`}
  onMouseEnter={() => {
    queryClient.prefetchQuery({
      queryKey: ['task', taskId],
      queryFn: () => fetchTask(taskId),
    });
  }}
>
  View Task
</Link>
```
