import type { ContentVariant } from '@/types/api/personal-branding.dto';
import type { Goal, Project, Task } from '@/types/growth-system';
import type { ChatMessage } from '@/types/chatbot';
import {
  ENTITY_EXPLAIN_QUESTION_MARKER,
  ENTITY_EXPLAIN_SOURCE,
  type EntityExplainContext,
  type EntityExplainHeaderMeta,
  type EntityExplainRef,
  type ExplainableEntityType,
} from '@/lib/entity-explain/types';

const THREAD_TITLE_MAX = 60;
const BODY_TRUNCATE = 2800;
const NOTES_TRUNCATE = 800;

const SUGGESTION_CHIPS: Record<ExplainableEntityType, string[]> = {
  task: [
    'Why is this still open?',
    "What's the smallest next step?",
    'What should I drop or defer?',
  ],
  goal: ['Am I on track?', "What's blocking progress?", 'Which linked task matters most?'],
  project: [
    "What's the critical path?",
    'Why does this feel stalled?',
    'What can I finish this week?',
  ],
  contentVariant: [
    'Is this ready to publish?',
    "What's the weakest line?",
    'How should I revise for this platform?',
  ],
};

const ENTITY_LABELS: Record<ExplainableEntityType, string> = {
  task: 'Task',
  goal: 'Goal',
  project: 'Project',
  contentVariant: 'Content variant',
};

function truncate(value: string | null | undefined, max: number): string {
  const trimmed = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function threadTitleFrom(label: string): string {
  const base = `Explain: ${label}`;
  if (base.length <= THREAD_TITLE_MAX) return base;
  return `${base.slice(0, THREAD_TITLE_MAX - 1).trimEnd()}…`;
}

function listLine(label: string, value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  return `- **${label}:** ${value}`;
}

function joinLines(lines: Array<string | null | undefined>): string {
  return lines.filter(Boolean).join('\n');
}

function formatProjectLine(
  names: string[],
  linkedCount?: number,
  areaFallback?: string | null
): string | undefined {
  const filtered = names.filter(Boolean);
  if (filtered.length > 0) {
    if (filtered.length <= 2) return filtered.join(' · ');
    return `${filtered.slice(0, 2).join(' · ')} +${filtered.length - 2}`;
  }
  if (linkedCount && linkedCount > 0) {
    return `${linkedCount} linked project${linkedCount === 1 ? '' : 's'}`;
  }
  if (areaFallback) return areaFallback;
  return undefined;
}

function buildTaskHeaderMeta(
  task: Task,
  enrichment?: EntityExplainRef['taskEnrichment']
): EntityExplainHeaderMeta {
  return {
    status: task.status,
    projectLine: formatProjectLine(
      enrichment?.projectNames ?? [],
      task.projectIds.length,
      task.area
    ),
  };
}

function buildGoalHeaderMeta(
  goal: Goal,
  enrichment?: EntityExplainRef['goalEnrichment']
): EntityExplainHeaderMeta {
  const progress =
    enrichment?.progressPercent != null ? `${enrichment.progressPercent}% progress` : undefined;
  return {
    status: goal.status,
    projectLine: progress ?? goal.timeHorizon ?? goal.area,
  };
}

function buildProjectHeaderMeta(
  project: Project,
  enrichment?: EntityExplainRef['projectEnrichment']
): EntityExplainHeaderMeta {
  const taskLine =
    enrichment?.taskCount != null
      ? `${enrichment.completedTaskCount ?? 0}/${enrichment.taskCount} tasks`
      : undefined;
  return {
    status: project.status,
    projectLine: taskLine ?? project.area,
  };
}

function buildContentVariantHeaderMeta(variant: ContentVariant): EntityExplainHeaderMeta {
  return {
    status: variant.status,
    projectLine:
      [variant.platform, variant.distributionStatus].filter(Boolean).join(' · ') || undefined,
  };
}

function buildTaskContext(task: Task): { markdown: string; priming: string; banner: string } {
  const lines = [
    '# Task context',
    listLine('ID', task.id),
    listLine('Title', task.title),
    listLine('Status', task.status),
    listLine('Priority', task.priority),
    listLine('Area', task.area),
    listLine('Due date', task.dueDate),
    listLine('Scheduled date', task.scheduledDate),
    listLine('Story points', task.size),
    listLine('Rollover count', task.rolloverCount ?? 0),
    listLine('Project IDs', task.projectIds.length ? task.projectIds.join(', ') : null),
    listLine('Goal IDs', task.goalIds.length ? task.goalIds.join(', ') : null),
  ];
  const description = truncate(task.description ?? task.extendedDescription, NOTES_TRUNCATE);
  if (description) {
    lines.push('', '## Description', description);
  }
  const notes = truncate(task.notes, NOTES_TRUNCATE);
  if (notes) {
    lines.push('', '## Notes', notes);
  }
  const markdown = joinLines(lines);
  const priming = [task.title, task.status, task.area, task.priority, description]
    .filter(Boolean)
    .join(' ');
  const banner = [task.status, task.priority, task.dueDate ? `due ${task.dueDate}` : null]
    .filter(Boolean)
    .join(' · ');
  return { markdown, priming, banner };
}

function buildGoalContext(
  goal: Goal,
  enrichment?: EntityExplainRef['goalEnrichment']
): { markdown: string; priming: string; banner: string } {
  const linked = enrichment?.linkedCounts;
  const lines = [
    '# Goal context',
    listLine('ID', goal.id),
    listLine('Title', goal.title),
    listLine('Status', goal.status),
    listLine('Priority', goal.priority),
    listLine('Area', goal.area),
    listLine('Time horizon', goal.timeHorizon),
    listLine('Target date', goal.targetDate),
    listLine('Health', goal.health ?? null),
    listLine('Momentum', enrichment?.momentum ?? null),
    listLine('Days remaining', enrichment?.daysRemaining ?? null),
    listLine('Progress %', enrichment?.progressPercent ?? null),
    linked
      ? listLine(
          'Linked counts',
          `tasks ${linked.tasks}, metrics ${linked.metrics}, habits ${linked.habits}, projects ${linked.projects}`
        )
      : null,
  ];
  const description = truncate(goal.description, NOTES_TRUNCATE);
  if (description) {
    lines.push('', '## Description', description);
  }
  const notes = truncate(goal.notes, NOTES_TRUNCATE);
  if (notes) {
    lines.push('', '## Notes', notes);
  }
  const markdown = joinLines(lines);
  const priming = [goal.title, goal.status, goal.area, goal.timeHorizon, description]
    .filter(Boolean)
    .join(' ');
  const banner = [
    goal.status,
    goal.timeHorizon,
    enrichment?.progressPercent != null ? `${enrichment.progressPercent}%` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return { markdown, priming, banner };
}

function buildProjectContext(
  project: Project,
  enrichment?: EntityExplainRef['projectEnrichment']
): { markdown: string; priming: string; banner: string } {
  const lines = [
    '# Project context',
    listLine('ID', project.id),
    listLine('Name', project.name),
    listLine('Status', project.status),
    listLine('Priority', project.priority),
    listLine('Area', project.area),
    listLine('Start date', project.startDate),
    listLine('Target end date', project.targetEndDate),
    listLine('Stale', project.isStale ? 'yes' : null),
    listLine('Task count', enrichment?.taskCount ?? null),
    listLine('Completed tasks', enrichment?.completedTaskCount ?? null),
    listLine('Linked goals', enrichment?.linkedGoalCount ?? null),
    listLine('Progress %', enrichment?.progressPercent ?? null),
    listLine('Goal IDs', project.goalIds?.length ? project.goalIds.join(', ') : null),
  ];
  const description = truncate(project.description, NOTES_TRUNCATE);
  if (description) {
    lines.push('', '## Description', description);
  }
  const notes = truncate(project.notes, NOTES_TRUNCATE);
  if (notes) {
    lines.push('', '## Notes', notes);
  }
  const markdown = joinLines(lines);
  const priming = [project.name, project.status, project.area, project.priority, description]
    .filter(Boolean)
    .join(' ');
  const banner = [
    project.status,
    enrichment?.progressPercent != null ? `${enrichment.progressPercent}%` : null,
    enrichment?.taskCount != null
      ? `${enrichment.completedTaskCount ?? 0}/${enrichment.taskCount} tasks`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return { markdown, priming, banner };
}

function buildContentVariantContext(variant: ContentVariant): {
  markdown: string;
  priming: string;
  banner: string;
} {
  const lines = [
    '# Content pipeline variant context',
    listLine('Variant ID', variant.id),
    listLine('Title', variant.title),
    listLine('Platform', variant.platform),
    listLine('Status', variant.status),
    listLine('Distribution', variant.distributionStatus),
    listLine('Source content ID', variant.sourceContentId),
    listLine('Brand profile ID', variant.brandProfileId),
    listLine('Job ID', variant.jobId),
    listLine('Confidence', variant.confidence ?? null),
    listLine('Character count', variant.characterCount),
    listLine('Character limit', variant.characterLimit ?? null),
    listLine('Workbench draft ID', variant.createdDraftContentId ?? null),
    listLine('Sandbox', variant.sandboxContent?.title ?? null),
    listLine('Source title', variant.sourceContent?.title ?? null),
  ];
  const body = truncate(variant.body, BODY_TRUNCATE);
  if (body) {
    lines.push('', '## Body', body);
  }
  const latestCritique = variant.critiqueHistory?.[variant.critiqueHistory.length - 1]?.critique;
  if (latestCritique) {
    lines.push('', '## Latest critique', truncate(latestCritique, 600));
  }
  const markdown = joinLines(lines);
  const priming = [
    variant.title,
    variant.platform,
    variant.status,
    variant.distributionStatus,
    body,
  ]
    .filter(Boolean)
    .join(' ');
  const banner = [variant.platform, variant.status, variant.distributionStatus]
    .filter(Boolean)
    .join(' · ');
  return { markdown, priming, banner };
}

function entityTitle(ref: EntityExplainRef): string {
  if (ref.entityType === 'project') {
    return (ref.entity as Project).name;
  }
  if (ref.entityType === 'contentVariant') {
    return (ref.entity as ContentVariant).title;
  }
  return (ref.entity as Task | Goal).title;
}

export function buildEntityExplainContext(ref: EntityExplainRef): EntityExplainContext {
  const entityLabel = ENTITY_LABELS[ref.entityType];
  const title = entityTitle(ref);

  let built: { markdown: string; priming: string; banner: string };
  let headerMeta: EntityExplainHeaderMeta | undefined;
  const metadata: NonNullable<ChatMessage['metadata']> = {
    source: ENTITY_EXPLAIN_SOURCE,
    ltmPrimingQuery: '',
  };

  switch (ref.entityType) {
    case 'task': {
      built = buildTaskContext(ref.entity as Task);
      metadata.taskId = (ref.entity as Task).id;
      headerMeta = buildTaskHeaderMeta(ref.entity as Task, ref.taskEnrichment);
      break;
    }
    case 'goal': {
      built = buildGoalContext(ref.entity as Goal, ref.goalEnrichment);
      metadata.goalId = (ref.entity as Goal).id;
      headerMeta = buildGoalHeaderMeta(ref.entity as Goal, ref.goalEnrichment);
      break;
    }
    case 'project': {
      built = buildProjectContext(ref.entity as Project, ref.projectEnrichment);
      metadata.projectId = (ref.entity as Project).id;
      headerMeta = buildProjectHeaderMeta(ref.entity as Project, ref.projectEnrichment);
      break;
    }
    case 'contentVariant': {
      built = buildContentVariantContext(ref.entity as ContentVariant);
      headerMeta = buildContentVariantHeaderMeta(ref.entity as ContentVariant);
      break;
    }
    default:
      built = { markdown: '', priming: title, banner: '' };
  }

  metadata.ltmPrimingQuery = truncate(built.priming, 400);

  return {
    threadTitle: threadTitleFrom(title),
    entityLabel,
    bannerSummary: built.banner || title,
    headerMeta,
    contextMarkdown: built.markdown,
    ltmPrimingQuery: metadata.ltmPrimingQuery ?? title,
    metadata,
    suggestionChips: SUGGESTION_CHIPS[ref.entityType],
  };
}

export function buildEntityExplainWireMessage(
  context: EntityExplainContext,
  question: string
): string {
  const q = question.trim();
  return `${context.contextMarkdown}\n\n${ENTITY_EXPLAIN_QUESTION_MARKER}${q}`;
}

export function displayTextForEntityExplainMessage(message: ChatMessage): string {
  if (message.role !== 'user' || message.metadata?.source !== ENTITY_EXPLAIN_SOURCE) {
    return message.content;
  }
  const idx = message.content.indexOf(ENTITY_EXPLAIN_QUESTION_MARKER);
  if (idx >= 0) {
    return message.content.slice(idx + ENTITY_EXPLAIN_QUESTION_MARKER.length).trim();
  }
  return message.content;
}
