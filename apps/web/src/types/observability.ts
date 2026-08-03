/** Usage & observability API types (camelCase from `/observability/*`). */

export interface ObservabilityBurnSummary {
  todayCostUsd: number;
  last7dCostUsd: number;
  totalTokens: number;
  failedExecutions: number;
  avgLatencyMs: number | null;
  totalCalls: number;
  /** Executions with token usage but no resolved USD rate (not counted in cost totals). */
  unpricedExecutionCount?: number;
}

export interface ObservabilityBurnPoint {
  bucketStart: string;
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

export interface ObservabilityBurnTimeseries {
  points: ObservabilityBurnPoint[];
}

export interface ObservabilityBreakdownRow {
  key: string;
  totalCostUsd: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  callCount: number;
}

export interface ObservabilityBurnBreakdown {
  rows: ObservabilityBreakdownRow[];
  groupBy: string;
}

export interface ObservabilityExecutionRow {
  id: string;
  occurredAt: string;
  module: string;
  feature?: string | null;
  provider: string;
  model: string;
  status: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cachedTokens?: number | null;
  cacheCreationTokens?: number | null;
  totalCostUsd?: number | null;
  latencyMs?: number | null;
  responsePreview?: string | null;
  threadId?: string | null;
  runId?: string | null;
  requestId?: string | null;
  providerRequestId?: string | null;
}

export interface ObservabilityExecutionDetail extends ObservabilityExecutionRow {
  promptPayloadJson?: unknown;
  promptText?: string | null;
  responseRawText?: string | null;
  partialResponseText?: string | null;
  requestMetadataJson?: unknown;
  retryPayloadJson?: unknown;
  pricingSnapshotJson?: unknown;
  errorMessage?: string | null;
  stackTrace?: string | null;
  ttftMs?: number | null;
  inputCostUsd?: number | null;
  outputCostUsd?: number | null;
}

export interface ObservabilityExecutionsPage {
  data: ObservabilityExecutionRow[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ObservabilityHealthSummary {
  totalRuns: number;
  failureCount: number;
  lastFailureAt?: string | null;
}

export interface ObservabilityHealthRow {
  rowId: string;
  jobName: string;
  jobType: string;
  lastStatus: string;
  lastStartedAt: string;
  lastFinishedAt?: string | null;
  durationMs?: number | null;
  errorMessage?: string | null;
  stackTrace?: string | null;
  threadId?: string | null;
  runId?: string | null;
  correlationId?: string | null;
}

export interface ObservabilityHealthMatrix {
  rows: ObservabilityHealthRow[];
}

export interface ObservabilityRetryQueued {
  queued: boolean;
  message: string;
}

export type CostGuardrailScopeType = 'module' | 'feature';
export type CostGuardrailPeriod = 'daily' | 'weekly';

export interface CostGuardrailRuleInput {
  id?: string;
  enabled: boolean;
  scopeType: CostGuardrailScopeType;
  module: string;
  feature?: string | null;
  period: CostGuardrailPeriod;
  limitUsd: number;
  autoThrottle: boolean;
}

export interface CostGuardrailRuleStatus extends CostGuardrailRuleInput {
  id: string;
  spentUsd: number;
  remainingUsd: number;
  exceeded: boolean;
  utilizationPct: number;
  approaching: boolean;
  periodStart: string | null;
  periodEnd: string | null;
  throttledFeatures: string[];
}

export interface CostGuardrailSpendSpike {
  active: boolean;
  message?: string | null;
  bucketStart?: string | null;
  multiplier?: number | null;
  topFeature?: string | null;
}

export interface CostGuardrailBanner {
  active: boolean;
  messages: string[];
}

export interface CostGuardrailStatus {
  rules: CostGuardrailRuleStatus[];
  banner: CostGuardrailBanner;
  throttleAllowlist: string[];
  overrides: Record<string, { forceEnabledUntil?: string; manualPaused?: boolean }>;
  spendSpike?: CostGuardrailSpendSpike | null;
}
