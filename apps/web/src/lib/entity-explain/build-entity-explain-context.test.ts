import { describe, expect, it } from 'vitest';
import {
  buildEntityExplainContext,
  buildEntityExplainWireMessage,
  displayTextForEntityExplainMessage,
} from '@/lib/entity-explain/build-entity-explain-context';
import { ENTITY_EXPLAIN_SOURCE } from '@/lib/entity-explain/types';
import type { ContentVariant } from '@/types/api/personal-branding.dto';
import type { Goal, Project, Task } from '@/types/growth-system';

const baseTask: Task = {
  id: 'task-1',
  title: 'Ship entity explain',
  description: 'Wire assistant from cards',
  extendedDescription: null,
  area: 'Day Job',
  subCategory: null,
  priority: 'P1',
  status: 'In Progress',
  size: 3,
  dueDate: '2026-07-25',
  scheduledDate: null,
  completedDate: null,
  rolloverCount: 2,
  parentTaskId: null,
  notes: 'Blocked on review',
  isRecurring: false,
  recurrenceRule: null,
  pointValue: 5,
  pointsAwarded: false,
  projectIds: ['proj-1'],
  goalIds: ['goal-1'],
  userId: 'user-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
};

const baseGoal: Goal = {
  id: 'goal-1',
  title: 'Launch assistant polish',
  description: 'Make entities conversational',
  area: 'Day Job',
  subCategory: null,
  timeHorizon: 'Quarterly',
  priority: 'P1',
  status: 'Active',
  startDate: '2026-07-01',
  targetDate: '2026-09-30',
  completedDate: null,
  successCriteria: [],
  progressConfig: null,
  parentGoalId: null,
  lastActivityAt: '2026-07-20T00:00:00.000Z',
  notes: null,
  userId: 'user-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
};

const baseProject: Project = {
  id: 'proj-1',
  name: 'Personal OS',
  description: 'Life operating system',
  area: 'Day Job',
  subCategory: null,
  priority: 'P1',
  status: 'Active',
  impact: 5,
  startDate: '2026-01-01',
  targetEndDate: '2026-12-31',
  actualEndDate: null,
  notes: null,
  goalIds: ['goal-1'],
  userId: 'user-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
};

const baseVariant: ContentVariant = {
  id: 'var-1',
  sourceContentId: 'node-1',
  jobId: 'job-1',
  brandProfileId: 'profile-1',
  platform: 'linkedin',
  title: 'Why systems beat goals',
  body: 'Most people optimize for goals when they should optimize for systems.',
  status: 'generated',
  distributionStatus: 'DRAFT',
  generationAttempt: 1,
  characterCount: 72,
  critiqueHistory: [],
  referencedContentIds: [],
  cached: false,
  userId: 'user-1',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
};

describe('buildEntityExplainContext', () => {
  it('builds task metadata and chips', () => {
    const ctx = buildEntityExplainContext({ entityType: 'task', entity: baseTask });
    expect(ctx.threadTitle).toBe('Explain: Ship entity explain');
    expect(ctx.metadata.taskId).toBe('task-1');
    expect(ctx.metadata.source).toBe(ENTITY_EXPLAIN_SOURCE);
    expect(ctx.suggestionChips).toContain('Why is this still open?');
    expect(ctx.contextMarkdown).toContain('Rollover count');
    expect(ctx.ltmPrimingQuery).toContain('Ship entity explain');
    expect(ctx.headerMeta?.status).toBe('In Progress');
    expect(ctx.headerMeta?.projectLine).toBe('1 linked project');
  });

  it('builds task headerMeta with project names from enrichment', () => {
    const ctx = buildEntityExplainContext({
      entityType: 'task',
      entity: baseTask,
      taskEnrichment: { projectNames: ['Personal OS', 'Side Quest'] },
    });
    expect(ctx.headerMeta?.projectLine).toBe('Personal OS · Side Quest');
  });

  it('truncates long project name lists in headerMeta', () => {
    const ctx = buildEntityExplainContext({
      entityType: 'task',
      entity: baseTask,
      taskEnrichment: { projectNames: ['Alpha', 'Beta', 'Gamma'] },
    });
    expect(ctx.headerMeta?.projectLine).toBe('Alpha · Beta +1');
  });

  it('builds goal context with linked counts', () => {
    const ctx = buildEntityExplainContext({
      entityType: 'goal',
      entity: baseGoal,
      goalEnrichment: {
        linkedCounts: { tasks: 3, metrics: 1, habits: 0, projects: 2 },
        progressPercent: 42,
        daysRemaining: 14,
        momentum: 'active',
      },
    });
    expect(ctx.metadata.goalId).toBe('goal-1');
    expect(ctx.contextMarkdown).toContain('tasks 3');
    expect(ctx.bannerSummary).toContain('42%');
    expect(ctx.headerMeta?.status).toBe('Active');
    expect(ctx.headerMeta?.projectLine).toBe('42% progress');
  });

  it('builds project context with progress', () => {
    const ctx = buildEntityExplainContext({
      entityType: 'project',
      entity: baseProject,
      projectEnrichment: {
        taskCount: 10,
        completedTaskCount: 4,
        linkedGoalCount: 1,
        progressPercent: 40,
      },
    });
    expect(ctx.metadata.projectId).toBe('proj-1');
    expect(ctx.contextMarkdown).toContain('Personal OS');
    expect(ctx.suggestionChips[0]).toContain('critical path');
  });

  it('builds content variant without entity id metadata', () => {
    const ctx = buildEntityExplainContext({
      entityType: 'contentVariant',
      entity: baseVariant,
    });
    expect(ctx.metadata.taskId).toBeUndefined();
    expect(ctx.metadata.goalId).toBeUndefined();
    expect(ctx.metadata.projectId).toBeUndefined();
    expect(ctx.contextMarkdown).toContain('linkedin');
    expect(ctx.suggestionChips).toContain('Is this ready to publish?');
  });
});

describe('buildEntityExplainWireMessage', () => {
  it('appends question after context block', () => {
    const ctx = buildEntityExplainContext({ entityType: 'task', entity: baseTask });
    const wire = buildEntityExplainWireMessage(ctx, 'Why is this still open?');
    expect(wire).toContain('# Task context');
    expect(wire).toContain('## Question');
    expect(wire.endsWith('Why is this still open?')).toBe(true);
  });
});

describe('displayTextForEntityExplainMessage', () => {
  it('shows only the question in the UI transcript', () => {
    const ctx = buildEntityExplainContext({ entityType: 'task', entity: baseTask });
    const content = buildEntityExplainWireMessage(ctx, 'Smallest next step?');
    const display = displayTextForEntityExplainMessage({
      id: 'm1',
      threadId: 't1',
      role: 'user',
      content,
      metadata: { source: ENTITY_EXPLAIN_SOURCE },
      createdAt: '2026-07-23T00:00:00.000Z',
    });
    expect(display).toBe('Smallest next step?');
  });
});
