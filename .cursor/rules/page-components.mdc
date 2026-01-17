---
description: "Standards for page-level components and route handlers."
globs: "src/pages/**/*.tsx"
alwaysApply: false
---

# Page Components

Standards for page-level components that serve as route destinations.

## Page Responsibilities

1. **Layout composition** - arrange organisms into page layout
2. **Data orchestration** - fetch data and pass to children
3. **Route params** - handle URL parameters
4. **Page-level state** - manage page-specific state
5. **SEO/meta** - set page title, description

## Standard Page Structure

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import TaskList from '../../components/organisms/TaskList';
import TaskEditPanel from '../../components/organisms/TaskEditPanel';
import { tasksService } from '../../services/growth-system/tasks.service';
import type { Task } from '../../types/growth-system';

export default function TasksPage() {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Data fetching
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksService.getTasks(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => refetch(),
  });

  // Handlers
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setShowEditPanel(true);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowEditPanel(true);
  };

  // Page loading state
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and track progress
          </p>
        </div>
      </div>

      {/* Main content */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        error={error}
        onTaskSelect={handleTaskSelect}
        onTaskCreate={handleCreateTask}
      />

      {/* Side panel */}
      {showEditPanel && (
        <TaskEditPanel
          task={selectedTask}
          onClose={() => setShowEditPanel(false)}
          onSave={async (data) => {
            await createMutation.mutateAsync(data);
            setShowEditPanel(false);
          }}
        />
      )}
    </div>
  );
}
```

## Page Header Pattern

Every page should have a consistent header:

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
      Page Title
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">
      Brief description of what this page is for
    </p>
  </div>

  {/* Primary page action */}
  <Button onClick={handlePrimaryAction}>
    <Plus size={20} className="mr-2" />
    Create New
  </Button>
</div>
```

## Data Fetching in Pages

```tsx
// Use React Query for data fetching
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['entityType', userId],
  queryFn: () => service.getAll(userId),
});

// Handle loading at page level
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader />
    </div>
  );
}

// Handle errors at page level
if (error) {
  return (
    <div className="text-center py-12">
      <p className="text-red-600">Failed to load data</p>
      <Button onClick={() => refetch()} className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
```

## Required Page Elements

- Page title (h1)
- Page description
- Loading state
- Error state with retry
- Empty state with call-to-action
- Proper spacing (space-y-6 standard)

## Do Not

- Fetch data in multiple places on one page
- Skip loading/error states
- Put complex logic directly in pages (extract to hooks)
- Forget dark mode on page-level elements
- Use inline styles
