import { z } from 'zod';

export const AreaSchema = z.enum([
  'Health',
  'Wealth',
  'Love',
  'Happiness',
  'Operations',
  'DayJob',
]);

export const SubCategorySchema = z.enum([
  'Physical',
  'Mental',
  'Spiritual',
  'Nutrition',
  'Sleep',
  'Exercise',
  'Income',
  'Expenses',
  'Investments',
  'Debt',
  'NetWorth',
  'Romantic',
  'Family',
  'Friends',
  'Social',
  'Joy',
  'Gratitude',
  'Purpose',
  'Peace',
  'Productivity',
  'Organization',
  'Systems',
  'Habits',
  'Career',
  'Skills',
  'Projects',
  'Performance',
]);

export const PrioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);

export const TaskStatusSchema = z.enum([
  'NotStarted',
  'InProgress',
  'Blocked',
  'OnHold',
  'Done',
  'Cancelled',
]);

export const ProjectStatusSchema = z.enum([
  'Planning',
  'Active',
  'OnHold',
  'Completed',
  'Cancelled',
]);

export const GoalStatusSchema = z.enum([
  'Planning',
  'Active',
  'OnTrack',
  'AtRisk',
  'Achieved',
  'Abandoned',
]);

export const ConfidenceSchema = z.number().min(0).max(1);

export const TimeHorizonSchema = z.enum(['Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily']);
