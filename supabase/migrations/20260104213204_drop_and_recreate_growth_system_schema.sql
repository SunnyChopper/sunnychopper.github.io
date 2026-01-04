/*
  # Drop and Recreate Growth System Schema
  
  1. Drop all existing tables and relationships
  2. Recreate with complete schema matching TypeScript types
  3. Re-enable RLS with proper policies
*/

-- Drop existing tables in correct order (relationships first)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_threads CASCADE;
DROP TABLE IF EXISTS logbook_habits CASCADE;
DROP TABLE IF EXISTS logbook_tasks CASCADE;
DROP TABLE IF EXISTS goal_projects CASCADE;
DROP TABLE IF EXISTS goal_metrics CASCADE;
DROP TABLE IF EXISTS metric_history CASCADE;
DROP TABLE IF EXISTS habit_logs CASCADE;
DROP TABLE IF EXISTS logbook_entries CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS metrics CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS area CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS goal_status CASCADE;
DROP TYPE IF EXISTS metric_status CASCADE;
DROP TYPE IF EXISTS time_horizon CASCADE;
DROP TYPE IF EXISTS habit_type CASCADE;
DROP TYPE IF EXISTS habit_frequency CASCADE;
DROP TYPE IF EXISTS metric_direction CASCADE;
DROP TYPE IF EXISTS logbook_mood CASCADE;

-- Create custom types
CREATE TYPE area AS ENUM ('Health', 'Wealth', 'Love', 'Happiness', 'Operations', 'DayJob');
CREATE TYPE priority AS ENUM ('P1', 'P2', 'P3', 'P4');
CREATE TYPE task_status AS ENUM ('NotStarted', 'InProgress', 'Blocked', 'OnHold', 'Done', 'Cancelled');
CREATE TYPE project_status AS ENUM ('Planning', 'Active', 'OnHold', 'Completed', 'Cancelled');
CREATE TYPE goal_status AS ENUM ('Planning', 'Active', 'OnTrack', 'AtRisk', 'Achieved', 'Abandoned');
CREATE TYPE metric_status AS ENUM ('Active', 'Paused', 'Archived');
CREATE TYPE time_horizon AS ENUM ('Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily');
CREATE TYPE habit_type AS ENUM ('Build', 'Maintain', 'Reduce', 'Quit');
CREATE TYPE habit_frequency AS ENUM ('Daily', 'Weekly', 'Monthly', 'Custom');
CREATE TYPE metric_direction AS ENUM ('Higher', 'Lower', 'Target');
CREATE TYPE logbook_mood AS ENUM ('Low', 'Steady', 'High');

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  extended_description text,
  area area NOT NULL,
  sub_category text,
  priority priority DEFAULT 'P3',
  status task_status DEFAULT 'NotStarted',
  size integer,
  due_date timestamptz,
  scheduled_date timestamptz,
  completed_date timestamptz,
  notes text,
  is_recurring boolean DEFAULT false,
  recurrence_rule jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  area area NOT NULL,
  sub_category text,
  priority priority DEFAULT 'P3',
  status project_status DEFAULT 'Planning',
  impact integer DEFAULT 5,
  start_date timestamptz,
  end_date timestamptz,
  completed_date timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  area area NOT NULL,
  sub_category text,
  time_horizon time_horizon NOT NULL,
  priority priority DEFAULT 'P3',
  status goal_status DEFAULT 'Planning',
  target_date timestamptz,
  completed_date timestamptz,
  success_criteria jsonb DEFAULT '[]'::jsonb,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Metrics table
CREATE TABLE metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  area area NOT NULL,
  sub_category text,
  unit text DEFAULT 'count',
  custom_unit text,
  direction metric_direction DEFAULT 'Higher',
  target_value numeric,
  threshold_low numeric,
  threshold_high numeric,
  source text DEFAULT 'Manual',
  status metric_status DEFAULT 'Active',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics" ON metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own metrics" ON metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own metrics" ON metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Metric Logs table
CREATE TABLE metric_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id uuid NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  notes text,
  logged_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE metric_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metric logs" ON metric_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own metric logs" ON metric_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metric logs" ON metric_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own metric logs" ON metric_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Habits table
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  area area NOT NULL,
  sub_category text,
  habit_type habit_type NOT NULL,
  frequency habit_frequency DEFAULT 'Daily',
  daily_target integer,
  weekly_target integer,
  intent text,
  trigger text,
  action text,
  reward text,
  friction_up text,
  friction_down text,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits" ON habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habits" ON habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Habit Logs table
CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  amount integer,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own habit logs" ON habit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Logbook Entries table
CREATE TABLE logbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text,
  notes text,
  mood logbook_mood,
  energy integer CHECK (energy >= 1 AND energy <= 10),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE logbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logbook entries" ON logbook_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logbook entries" ON logbook_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own logbook entries" ON logbook_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own logbook entries" ON logbook_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Task Dependencies table
CREATE TABLE task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own task dependencies" ON task_dependencies FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_dependencies.task_id AND user_id = auth.uid())
);

-- Task-Project relationship table
CREATE TABLE task_projects (
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, project_id)
);

ALTER TABLE task_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own task-project links" ON task_projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_projects.task_id AND user_id = auth.uid())
);

-- Task-Goal relationship table
CREATE TABLE task_goals (
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, goal_id)
);

ALTER TABLE task_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own task-goal links" ON task_goals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM tasks WHERE id = task_goals.task_id AND user_id = auth.uid())
);

-- Project-Goal relationship table
CREATE TABLE project_goals (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, goal_id)
);

ALTER TABLE project_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project-goal links" ON project_goals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_goals.project_id AND user_id = auth.uid())
);

-- Goal-Metric relationship table
CREATE TABLE goal_metrics (
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  metric_id uuid NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (goal_id, metric_id)
);

ALTER TABLE goal_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goal-metric links" ON goal_metrics FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM goals WHERE id = goal_metrics.goal_id AND user_id = auth.uid())
);

-- Habit-Goal relationship table
CREATE TABLE habit_goals (
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (habit_id, goal_id)
);

ALTER TABLE habit_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own habit-goal links" ON habit_goals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM habits WHERE id = habit_goals.habit_id AND user_id = auth.uid())
);

-- Logbook-Task relationship table
CREATE TABLE logbook_tasks (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (logbook_entry_id, task_id)
);

ALTER TABLE logbook_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logbook-task links" ON logbook_tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM logbook_entries WHERE id = logbook_tasks.logbook_entry_id AND user_id = auth.uid())
);

-- Logbook-Project relationship table
CREATE TABLE logbook_projects (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (logbook_entry_id, project_id)
);

ALTER TABLE logbook_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logbook-project links" ON logbook_projects FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM logbook_entries WHERE id = logbook_projects.logbook_entry_id AND user_id = auth.uid())
);

-- Logbook-Goal relationship table
CREATE TABLE logbook_goals (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  goal_id uuid NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (logbook_entry_id, goal_id)
);

ALTER TABLE logbook_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logbook-goal links" ON logbook_goals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM logbook_entries WHERE id = logbook_goals.logbook_entry_id AND user_id = auth.uid())
);

-- Logbook-Habit relationship table
CREATE TABLE logbook_habits (
  logbook_entry_id uuid NOT NULL REFERENCES logbook_entries(id) ON DELETE CASCADE,
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (logbook_entry_id, habit_id)
);

ALTER TABLE logbook_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logbook-habit links" ON logbook_habits FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM logbook_entries WHERE id = logbook_habits.logbook_entry_id AND user_id = auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_area ON tasks(area);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_area ON projects(area);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_time_horizon ON goals(time_horizon);
CREATE INDEX idx_goals_area ON goals(area);

CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metric_logs_metric_id ON metric_logs(metric_id);
CREATE INDEX idx_metric_logs_logged_at ON metric_logs(logged_at);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_completed_at ON habit_logs(completed_at);

CREATE INDEX idx_logbook_entries_user_id ON logbook_entries(user_id);
CREATE INDEX idx_logbook_entries_date ON logbook_entries(date);

CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
