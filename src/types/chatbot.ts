export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeLeafMessageId?: string;
}

export interface StatusEntry {
  stage:
    | 'planning'
    | 'runningTools'
    | 'responding'
    | 'persisting'
    | 'awaitingApproval'
    | 'approvalResolved';
  message?: string;
  startedAt: number;
  /** When stage is awaitingApproval, matches WsToolApprovalRequiredPayload.approvalId */
  approvalId?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  /** Persisted execution trace steps for assistant messages (from messageComplete). */
  executionSteps?: StatusEntry[];
  /** Persisted tool call input/output for expandable trace when response is done. */
  toolCallDetails?: WsToolCallCompletePayload[];
  clientStatus?: 'sending' | 'failed';
  clientError?: string;
  clientMessageId?: string;
  metadata?: {
    taskId?: string;
    goalId?: string;
    projectId?: string;
    action?: string;
    webSearch?: boolean;
    searchQuery?: string;
    editedFromMessageId?: string;
  };
  createdAt: string;
  parentId?: string;
}

export interface MessageTreeResponse {
  rootKey: string;
  nodes: ChatMessage[];
  childrenByParentId: Record<string, string[]>;
  leafIds: string[];
}

export interface CreateThreadRequest {
  title?: string;
}

export interface CreateMessageRequest {
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  metadata?: ChatMessage['metadata'];
  parentId?: string;
}

export interface EditMessageRequest {
  content: string;
  metadata?: ChatMessage['metadata'];
}

export interface UpdateThreadRequest {
  id: string;
  title: string;
}

export interface WsUserMessagePayload {
  threadId: string;
  content?: string;
  parentId?: string | null;
  metadata?: ChatMessage['metadata'];
  messageId?: string;
}

export interface WsCancelRunPayload {
  runId: string;
}

export interface WsRunStartedPayload {
  runId: string;
  threadId: string;
  assistantMessageId: string;
  userMessageId: string;
}

export interface WsAssistantDeltaPayload {
  runId: string;
  threadId: string;
  delta: string;
}

export interface WsThinkingDeltaPayload {
  runId: string;
  threadId: string;
  delta: string;
}

export interface WsStatusUpdatePayload {
  runId: string;
  threadId: string;
  stage: 'planning' | 'runningTools' | 'responding' | 'persisting';
  message?: string;
}

export interface WsToolCallCompletePayload {
  runId: string;
  threadId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  status: string;
  durationMs?: number;
  error?: string;
  result?: unknown;
}

export interface WsToolApprovalRequiredPayload {
  runId: string;
  threadId: string;
  approvalId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  description: string;
}

export interface WsToolApprovalResponsePayload {
  runId: string;
  approvalId: string;
  decision: 'approve' | 'reject';
}

export interface WsMessageCompletePayload {
  runId: string;
  threadId: string;
  message: ChatMessage;
  /** Present when older turns were summarized for model context limits. */
  contextSummaryApplied?: boolean;
}

export interface WsThreadUpdatedPayload {
  threadId: string;
  title: string;
  updatedAt: string;
}

export interface WsRunErrorPayload {
  runId: string;
  threadId: string;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
