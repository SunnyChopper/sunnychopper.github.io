/*
  # Create Growth System Tables

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (text, default 'todo')
      - `priority` (text, default 'medium')
      - `due_date` (timestamptz, optional)
      - `project_id` (uuid, optional, foreign key)
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `habits`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `frequency` (text, default 'daily')
      - `streak` (integer, default 0)
      - `last_completed` (timestamptz, optional)
      - `target` (integer, required)
      - `category` (text, optional)
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `habit_logs`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, required, foreign key)
      - `completed_at` (timestamptz, required)
      - `notes` (text, optional)
      - `user_id` (uuid, required)

    - `metrics`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `current_value` (numeric, required)
      - `target_value` (numeric, required)
      - `unit` (text, required)
      - `category` (text, required)
      - `trend` (text, default 'stable')
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `metric_history`
      - `id` (uuid, primary key)
      - `metric_id` (uuid, required, foreign key)
      - `value` (numeric, required)
      - `recorded_at` (timestamptz, required)
      - `notes` (text, optional)

    - `goals`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `target_date` (timestamptz, required)
      - `progress` (numeric, default 0)
      - `status` (text, default 'planning')
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `goal_metrics` (junction table)
      - `goal_id` (uuid, foreign key)
      - `metric_id` (uuid, foreign key)

    - `goal_projects` (junction table)
      - `goal_id` (uuid, foreign key)
      - `project_id` (uuid, foreign key)

    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `status` (text, default 'planning')
      - `start_date` (timestamptz, optional)
      - `end_date` (timestamptz, optional)
      - `progress` (numeric, default 0)
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `logbook_entries`
      - `id` (uuid, primary key)
      - `date` (date, required)
      - `content` (text, required)
      - `mood` (text, optional)
      - `tags` (text[], default '{}')
      - `ai_analysis` (text, optional)
      - `user_id` (uuid, required)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `logbook_tasks` (junction table)
      - `logbook_entry_id` (uuid, foreign key)
      - `task_id` (uuid, foreign key)

    - `logbook_habits` (junction table)
      - `logbook_entry_id` (uuid, foreign key)
      - `habit_id` (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  project_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  frequency text NOT NULL DEFAULT 'daily',
  streak integer NOT NULL DEFAULT 0,
  last_completed timestamptz,
  target integer NOT NULL,
  category text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  user_id uuid NOT NULL
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own habit logs"
  ON habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  current_value numeric NOT NULL,
  target_value numeric NOT NULL,
  unit text NOT NULL,
  category text NOT NULL,
  trend text NOT NULL DEFAULT 'stable',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON metrics FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own metrics"
  ON metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own metrics"
  ON metrics FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own metrics"
  ON metrics FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create metric_history table
CREATE TABLE IF NOT EXISTS metric_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id uuid NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  notes text
);

ALTER TABLE metric_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view metric history for own metrics"
  ON metric_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM metrics
      WHERE metrics.id = metric_history.metric_id
      AND auth.uid()::text = metrics.user_id::text
    )
  );

CREATE POLICY "Users can insert metric history for own metrics"
  ON metric_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM metrics
      WHERE metrics.id = metric_history.metric_id
      AND auth.uid()::text = metrics.user_id::text
    )
  );

CREATE POLICY "Users can update metric history for own metrics"
  ON metric_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM metrics
      WHERE metrics.id = metric_history.metric_id
      AND auth.uid()::text = metrics.user_id::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM metrics
      WHERE metrics.id = metric_history.metric_id
      AND auth.uid()::text = metrics.user_id::text
    )
  );

CREATE POLICY "Users can delete metric history for own metrics"
  ON metric_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM metrics
      WHERE metrics.id = metric_history.metric_id
      AND auth.uid()::text = metrics.user_id::text
    )
  );

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning',
  start_date timestamptz,
  end_date timestamptz,
  progress numeric NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Add foreign key for tasks.project_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_project_id_fkey'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_date timestamptz NOT NULL,
  progress numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planning',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create goal_metrics junction table
CREATE TABLE IF NOT EXISTS goal_metrics (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  metric_id uuid NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, metric_id)
);

ALTER TABLE goal_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view goal_metrics for own goals"
  ON goal_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_metrics.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

CREATE POLICY "Users can insert goal_metrics for own goals"
  ON goal_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_metrics.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

CREATE POLICY "Users can delete goal_metrics for own goals"
  ON goal_metrics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_metrics.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

-- Create goal_projects junction table
CREATE TABLE IF NOT EXISTS goal_projects (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, project_id)
);

ALTER TABLE goal_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view goal_projects for own goals"
  ON goal_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_projects.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

CREATE POLICY "Users can insert goal_projects for own goals"
  ON goal_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_projects.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

CREATE POLICY "Users can delete goal_projects for own goals"
  ON goal_projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_projects.goal_id
      AND auth.uid()::text = goals.user_id::text
    )
  );

-- Create logbook_entries table
CREATE TABLE IF NOT EXISTS logbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  content text NOT NULL,
  mood text,
  tags text[] DEFAULT '{}',
  ai_analysis text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logbook entries"
  ON logbook_entries FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own logbook entries"
  ON logbook_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own logbook entries"
  ON logbook_entries FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own logbook entries"
  ON logbook_entries FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create logbook_tasks junction table
CREATE TABLE IF NOT EXISTS logbook_tasks (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (logbook_entry_id, task_id)
);

ALTER TABLE logbook_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logbook_tasks for own entries"
  ON logbook_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_tasks.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

CREATE POLICY "Users can insert logbook_tasks for own entries"
  ON logbook_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_tasks.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

CREATE POLICY "Users can delete logbook_tasks for own entries"
  ON logbook_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_tasks.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

-- Create logbook_habits junction table
CREATE TABLE IF NOT EXISTS logbook_habits (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  PRIMARY KEY (logbook_entry_id, habit_id)
);

ALTER TABLE logbook_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logbook_habits for own entries"
  ON logbook_habits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_habits.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

CREATE POLICY "Users can insert logbook_habits for own entries"
  ON logbook_habits FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_habits.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

CREATE POLICY "Users can delete logbook_habits for own entries"
  ON logbook_habits FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM logbook_entries
      WHERE logbook_entries.id = logbook_habits.logbook_entry_id
      AND auth.uid()::text = logbook_entries.user_id::text
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metric_history_metric_id ON metric_history(metric_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_logbook_entries_user_id ON logbook_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_logbook_entries_date ON logbook_entries(date);
