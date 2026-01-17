---
description: "USE WHEN integrating with Supabase for database, auth, and storage operations."
globs: ""
alwaysApply: false
---

# Supabase Patterns

Standards for Supabase integration in frontend applications.

## Client Setup

```tsx
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## Query Patterns

```tsx
// Get all records
const { data, error } = await supabase
  .from('tasks')
  .select('*');

// Get single record (use maybeSingle for 0 or 1 result)
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('id', taskId)
  .maybeSingle();

// Select specific columns
const { data } = await supabase
  .from('tasks')
  .select('id, title, status');

// With relations
const { data } = await supabase
  .from('tasks')
  .select(`
    *,
    project:projects(id, name),
    assignee:users(id, name, avatar_url)
  `);
```

## Filtering

```tsx
// Equality
.eq('status', 'active')

// Not equal
.neq('status', 'deleted')

// In array
.in('status', ['pending', 'in_progress'])

// Pattern matching
.ilike('title', '%search%')

// Range
.gte('priority', 3)
.lte('priority', 5)

// Is null
.is('deleted_at', null)

// Combine filters
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('project_id', projectId)
  .in('status', ['pending', 'in_progress'])
  .order('created_at', { ascending: false });
```

## Insert/Update/Delete

```tsx
// Insert
const { data, error } = await supabase
  .from('tasks')
  .insert({ title: 'New Task', status: 'pending' })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'completed' })
  .eq('id', taskId)
  .select()
  .single();

// Upsert
const { data, error } = await supabase
  .from('tasks')
  .upsert({ id: taskId, title: 'Updated Title' })
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

## Authentication

```tsx
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen to auth changes (avoid async callbacks directly)
supabase.auth.onAuthStateChange((event, session) => {
  // Use sync callback, wrap async in IIFE if needed
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  }
});
```

## Service Pattern

```tsx
// services/tasks.service.ts
import { supabase } from '@/lib/supabase';
import type { Task, CreateTaskInput } from '@/types';

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

## Real-time Subscriptions

```tsx
useEffect(() => {
  const subscription = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new as Task, ...prev]);
        }
        if (payload.eventType === 'UPDATE') {
          setTasks(prev =>
            prev.map(t => t.id === payload.new.id ? payload.new as Task : t)
          );
        }
        if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Error Handling

```tsx
try {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data;
} catch (error) {
  if (error.code === 'PGRST116') {
    // No rows returned
    return null;
  }
  console.error('Supabase error:', error);
  throw error;
}
```
