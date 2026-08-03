import type { ContentVariant } from '@/types/api/personal-branding.dto';
import type { Goal, Project, Task } from '@/types/growth-system';
import type { ChatMessage } from '@/types/chatbot';

export type ExplainableEntityType = 'task' | 'goal' | 'project' | 'contentVariant';

export type ExplainableEntity = Task | Goal | Project | ContentVariant;

export interface GoalExplainEnrichment {
  linkedCounts?: { tasks: number; metrics: number; habits: number; projects: number };
  progressPercent?: number;
  daysRemaining?: number | null;
  momentum?: 'active' | 'dormant';
}

export interface ProjectExplainEnrichment {
  taskCount?: number;
  completedTaskCount?: number;
  linkedGoalCount?: number;
  progressPercent?: number;
}

export interface TaskExplainEnrichment {
  projectNames?: string[];
}

export interface EntityExplainHeaderMeta {
  status?: string;
  projectLine?: string;
}

export interface EntityExplainRef {
  entityType: ExplainableEntityType;
  entity: ExplainableEntity;
  goalEnrichment?: GoalExplainEnrichment;
  projectEnrichment?: ProjectExplainEnrichment;
  taskEnrichment?: TaskExplainEnrichment;
}

export interface EntityExplainContext {
  threadTitle: string;
  entityLabel: string;
  bannerSummary: string;
  headerMeta?: EntityExplainHeaderMeta;
  contextMarkdown: string;
  ltmPrimingQuery: string;
  metadata: NonNullable<ChatMessage['metadata']>;
  suggestionChips: string[];
}

export const ENTITY_EXPLAIN_SOURCE = 'entityExplain' as const;

export const ENTITY_EXPLAIN_QUESTION_MARKER = '## Question\n\n';
