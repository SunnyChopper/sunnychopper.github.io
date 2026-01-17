---
description: 'USE WHEN implementing drag and drop functionality for lists, cards, or file uploads.'
globs: ''
alwaysApply: false
---

# Drag & Drop Patterns

Standards for implementing drag and drop interactions.

## Native HTML5 Drag & Drop

```tsx
interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}

function DraggableItem({ id, children, onDragStart, onDragEnd }: DraggableItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(id);
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
```

## Drop Zone

```tsx
function DropZone({ onDrop, children, acceptedTypes = ['text/plain'] }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('text/plain');
    onDrop(data);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'transition-colors rounded-lg border-2 border-dashed',
        isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600'
      )}
    >
      {children}
    </div>
  );
}
```

## Sortable List

```tsx
function SortableList({ items, onReorder }: SortableListProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (targetId: string) => {
    if (draggedId && draggedId !== targetId) {
      const newItems = [...items];
      const draggedIndex = items.findIndex((i) => i.id === draggedId);
      const targetIndex = items.findIndex((i) => i.id === targetId);

      newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, items[draggedIndex]);

      onReorder(newItems);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={() => handleDrop(item.id)}
          onDragEnd={() => {
            setDraggedId(null);
            setDragOverId(null);
          }}
          className={cn(
            'p-3 bg-white dark:bg-gray-800 rounded-lg border cursor-grab transition-all',
            draggedId === item.id && 'opacity-50',
            dragOverId === item.id && 'border-blue-500 scale-[1.02]'
          )}
        >
          <GripVertical className="w-4 h-4 text-gray-400 inline mr-2" />
          {item.title}
        </div>
      ))}
    </div>
  );
}
```

## File Drop Zone

```tsx
function FileDropZone({ onFilesDropped, accept }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    onFilesDropped(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesDropped(files);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors',
        isDragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
      )}
    >
      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p className="text-gray-600 dark:text-gray-400">
        Drag files here or <span className="text-blue-600">browse</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">{accept || 'Any file type'}</p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
```

## Kanban Column Drop

```tsx
function KanbanColumn({ status, tasks, onTaskDrop }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        onTaskDrop(taskId, status);
      }}
      className={cn(
        'flex-1 min-h-[200px] p-4 rounded-lg transition-colors',
        isDragOver
          ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
          : 'bg-gray-100 dark:bg-gray-800'
      )}
    >
      <h3 className="font-medium mb-4">{status}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
```

## Visual Feedback Classes

```tsx
// Dragging state
className = 'opacity-50 scale-95';

// Valid drop target
className = 'ring-2 ring-blue-500 bg-blue-50';

// Invalid drop target
className = 'ring-2 ring-red-500 bg-red-50';

// Drop indicator line
className = 'h-1 bg-blue-500 rounded-full';
```
