$ErrorActionPreference = 'Stop'
Set-Location 'c:\Users\thesu\Desktop\Software\Repositories\personal-os\personal-os-web'

function Commit-Group($msg, $paths) {
  foreach ($p in $paths) {
    if (Test-Path $p) { git add -- $p }
  }
  $status = git diff --cached --name-only
  if (-not $status) { Write-Host "SKIP (empty): $msg"; return }
  git commit -m $msg
  Write-Host "OK: $msg"
}

# Never commit local noise
git reset HEAD -- 'apps/logs/frontend/app.jsonl' 2>$null
git reset HEAD -- 'apps/garden/tsconfig.tsbuildinfo' 2>$null
git reset HEAD -- 'commit-msg-web.txt' 2>$null
git reset HEAD -- 'test-results' 2>$null
git reset HEAD -- 'playwright-report' 2>$null

Commit-Group 'feat(ui): shared atoms, overlays, empty states, and form controls' @(
  'apps/web/src/components/atoms',
  'apps/web/src/components/molecules/Dialog.tsx',
  'apps/web/src/components/molecules/Dialog.test.tsx',
  'apps/web/src/components/molecules/EmptyState.tsx',
  'apps/web/src/components/molecules/EmptyState.test.tsx',
  'apps/web/src/components/molecules/empty-state',
  'apps/web/src/components/molecules/OverlayPortal.tsx',
  'apps/web/src/components/molecules/Toast.tsx',
  'apps/web/src/components/molecules/Toast.test.tsx',
  'apps/web/src/components/molecules/DropdownMenuButton.tsx',
  'apps/web/src/components/molecules/DropdownMenuButton.test.tsx',
  'apps/web/src/components/molecules/CollapsibleSection.tsx',
  'apps/web/src/components/molecules/FileUploadZone.tsx',
  'apps/web/src/components/molecules/MultiCombobox.tsx',
  'apps/web/src/components/molecules/MultiCombobox.test.tsx',
  'apps/web/src/components/molecules/ScaleSelector.tsx',
  'apps/web/src/components/molecules/ScaleSelector.test.tsx',
  'apps/web/src/components/molecules/InfoTip.tsx',
  'apps/web/src/lib/overlay-layer.ts',
  'apps/web/src/lib/forms',
  'apps/web/src/lib/upload-to-s3-with-progress.ts',
  'apps/web/src/lib/upload-to-s3-with-progress.test.ts',
  'apps/web/src/lib/throttled-progress.ts',
  'apps/web/src/lib/throttled-progress.test.ts',
  'apps/web/src/lib/markdown',
  '.cursor/rules/empty-states.mdc'
)

Commit-Group 'feat(chat): iMessage chat shell, composer, and transcript surfaces' @(
  'apps/web/src/components/atoms/chat',
  'apps/web/src/components/molecules/chat',
  'apps/web/src/components/organisms/AssistantChatTranscript.tsx',
  'apps/web/src/components/organisms/ChatComposer.tsx',
  'apps/web/src/components/organisms/ChatMessageRow.tsx',
  'apps/web/src/components/organisms/ChatMessageRowReasoning.test.tsx',
  'apps/web/src/components/organisms/ChatThreadList.tsx',
  'apps/web/src/components/templates/assistant',
  'apps/web/src/lib/chat',
  'apps/web/src/hooks/chatbot',
  'apps/web/src/hooks/useAssistantStreaming.ts',
  'apps/web/src/lib/assistant-stream-telemetry.ts',
  'apps/web/src/lib/assistant-stream-telemetry.test.ts',
  'apps/web/src/lib/websocket',
  'apps/web/src/pages/admin/ChatbotPage.tsx',
  'apps/web/src/services/chatbot.service.ts',
  'apps/web/src/services/assistant',
  'scripts/check-websocket-url-drift.mjs'
)

Commit-Group 'feat(assistant): knowledge surfaces, interventions, entity explain, and settings' @(
  'apps/web/src/components/molecules/assistant',
  'apps/web/src/components/molecules/AssistantKnowledgeSurfaceCard.tsx',
  'apps/web/src/components/molecules/AssistantKnowledgeSurfaceCard.test.tsx',
  'apps/web/src/components/molecules/AssistantKnowledgeSurfaceList.tsx',
  'apps/web/src/components/molecules/AssistantSpecialistBriefsList.tsx',
  'apps/web/src/components/molecules/AssistantExecutionTrace.tsx',
  'apps/web/src/components/molecules/CoachEscalationDecisionCard.tsx',
  'apps/web/src/components/molecules/EntityExplainButton.tsx',
  'apps/web/src/components/molecules/ModelPicker.tsx',
  'apps/web/src/components/molecules/ModelScoreChips.tsx',
  'apps/web/src/components/molecules/StaleEntityDecisionCard.tsx',
  'apps/web/src/components/molecules/settings',
  'apps/web/src/components/organisms/assistant',
  'apps/web/src/components/organisms/EntityExplainChatDrawer.tsx',
  'apps/web/src/components/organisms/settings',
  'apps/web/src/contexts/AmbientAskContext.tsx',
  'apps/web/src/contexts/EntityExplainChatContext.tsx',
  'apps/web/src/lib/entity-explain',
  'apps/web/src/lib/settings',
  'apps/web/src/types/knowledge-surface.ts',
  'apps/web/src/pages/admin/AssistantSettingsPage.tsx',
  'apps/web/src/pages/admin/InterventionsPage.tsx',
  'apps/web/src/pages/admin/__tests__/AssistantSettingsPage.chrome.test.tsx',
  'apps/web/src/pages/admin/__tests__/AssistantSettingsPage.defaultModels.test.tsx',
  'apps/web/src/pages/admin/__tests__/AssistantSettingsPage.polish.test.tsx',
  'apps/web/src/services/assistant-interventions.service.ts'
)

Commit-Group 'feat(growth-system): projects, goals, tasks, kanban, and progress UX' @(
  'apps/web/src/components/molecules/AIProjectAssistPanel.tsx',
  'apps/web/src/components/molecules/AIProjectAssistPanel.test.tsx',
  'apps/web/src/components/molecules/AIProjectAssistLoadingSkeleton.tsx',
  'apps/web/src/components/molecules/AIProjectAssistLoadingSkeleton.test.tsx',
  'apps/web/src/components/molecules/GoalCard.tsx',
  'apps/web/src/components/molecules/GoalProgressDashboard.tsx',
  'apps/web/src/components/molecules/GoalProgressWeightsFields.tsx',
  'apps/web/src/components/molecules/FocusGoalRow.tsx',
  'apps/web/src/components/molecules/FocusGoalRow.test.tsx',
  'apps/web/src/components/molecules/HabitVelocityInsightCallout.tsx',
  'apps/web/src/components/molecules/HabitVelocityInsightCallout.test.tsx',
  'apps/web/src/components/molecules/EnergyPatternInsightCallout.tsx',
  'apps/web/src/components/molecules/EnergyPatternInsightCallout.test.tsx',
  'apps/web/src/components/molecules/ImpactScoreSelector.tsx',
  'apps/web/src/components/molecules/KanbanCard.tsx',
  'apps/web/src/components/molecules/KanbanCardActionsMenu.tsx',
  'apps/web/src/components/molecules/KanbanCompactRow.tsx',
  'apps/web/src/components/molecules/KanbanProjectRollup.tsx',
  'apps/web/src/components/molecules/ProjectCard.tsx',
  'apps/web/src/components/molecules/ProjectCard.test.tsx',
  'apps/web/src/components/molecules/ProjectListItem.tsx',
  'apps/web/src/components/molecules/ProjectListItem.test.tsx',
  'apps/web/src/components/molecules/ProjectCompletedTasksSection.tsx',
  'apps/web/src/components/molecules/ProjectGoalContributionWeightField.tsx',
  'apps/web/src/components/molecules/ProjectGraphNode.tsx',
  'apps/web/src/components/molecules/ProjectGraphNode.test.tsx',
  'apps/web/src/components/molecules/ProjectsActiveFilterChips.tsx',
  'apps/web/src/components/molecules/ProjectsActiveFilterChips.test.tsx',
  'apps/web/src/components/molecules/ProjectsFiltersBar.tsx',
  'apps/web/src/components/molecules/PriorityLegendInfoTip.tsx',
  'apps/web/src/components/molecules/PriorityLegendInfoTip.test.tsx',
  'apps/web/src/components/molecules/TaskContextVibePills.tsx',
  'apps/web/src/components/molecules/TaskGraphNode.tsx',
  'apps/web/src/components/molecules/TaskGraphNode.test.tsx',
  'apps/web/src/components/molecules/TaskListItem.tsx',
  'apps/web/src/components/molecules/TaskListItem.test.tsx',
  'apps/web/src/components/molecules/TasksFiltersBar.tsx',
  'apps/web/src/components/molecules/TasksFiltersBar.test.tsx',
  'apps/web/src/components/molecules/GraphCanvasToolbar.tsx',
  'apps/web/src/components/molecules/project-status-badge-parity-fixture.ts',
  'apps/web/src/components/molecules/projects',
  'apps/web/src/components/organisms/AIInsightsWidget.tsx',
  'apps/web/src/components/organisms/AISuggestedTasks.tsx',
  'apps/web/src/components/organisms/AccumulatedTechDebt.tsx',
  'apps/web/src/components/organisms/BlockerResolution.tsx',
  'apps/web/src/components/organisms/CapacityDeScopeAdvisory.tsx',
  'apps/web/src/components/organisms/DailyPlanningAssistant.tsx',
  'apps/web/src/components/organisms/DependencyGraph.tsx',
  'apps/web/src/components/organisms/DependencyGraph.test.tsx',
  'apps/web/src/components/organisms/ImpactEffortMatrix.tsx',
  'apps/web/src/components/organisms/ImpactEffortMatrix.test.tsx',
  'apps/web/src/components/organisms/growth-system',
  'apps/web/src/components/organisms/timeline',
  'apps/web/src/components/organisms/__tests__/AccumulatedTechDebt.test.tsx',
  'apps/web/src/components/organisms/__tests__/AISuggestedTasks.test.tsx',
  'apps/web/src/lib/growth-system',
  'apps/web/src/lib/projects',
  'apps/web/src/lib/task-graph-utils.ts',
  'apps/web/src/hooks/growth-system',
  'apps/web/src/services/growth-system',
  'apps/web/src/types/growth-system.ts',
  'apps/web/src/types/project-health.ts',
  'apps/web/src/utils/goal-migration.ts',
  'apps/web/src/utils/goal-progress-weights.ts',
  'apps/web/src/utils/project-summary.ts',
  'apps/web/src/utils/project-summary.stale.test.ts',
  'apps/web/src/utils/project-summary.date-urgency.test.ts',
  'apps/web/src/utils/project-summary.progress-ring.test.ts',
  'apps/web/src/utils/timeline-bar-colors.ts',
  'apps/web/src/utils/timeline-bar-colors.test.ts',
  'apps/web/src/utils/timeline-bar-tooltip.ts',
  'apps/web/src/utils/timeline-bar-tooltip.test.ts',
  'apps/web/src/pages/admin/ProjectsPage.tsx',
  'apps/web/src/pages/admin/GoalsPage.tsx',
  'apps/web/src/pages/admin/TasksPage.tsx'
)

Commit-Group 'feat(fitness): recovery capacity hero, nutrition, and workout surfaces' @(
  'apps/web/src/components/molecules/fitness',
  'apps/web/src/components/organisms/fitness',
  'apps/web/src/components/molecules/AuraScatterChart.tsx',
  'apps/web/src/components/molecules/WalletWidget.tsx',
  'apps/web/src/components/molecules/WalletWidget.test.tsx',
  'apps/web/src/components/molecules/PointsEarnBurst.tsx',
  'apps/web/src/components/molecules/PointsEarnBurst.test.tsx',
  'apps/web/src/lib/fitness',
  'apps/web/src/lib/point-badge.ts',
  'apps/web/src/hooks/useFitness.ts',
  'apps/web/src/services/fitness.service.ts',
  'apps/web/src/types/fitness.ts',
  'apps/web/src/types/rewards.ts',
  'apps/web/src/pages/admin/HealthFitnessAuraPage.tsx',
  'apps/web/src/pages/admin/HealthFitnessOverviewPage.tsx',
  'apps/web/src/pages/admin/HealthFitnessRewardsPage.tsx',
  'apps/web/src/pages/admin/HealthFitnessWorkoutsPage.tsx',
  'apps/web/src/pages/admin/__tests__/HealthFitnessRewardsPage.test.tsx'
)

Commit-Group 'feat(knowledge-vault): notes, inbox, library, and course practice' @(
  'apps/web/src/components/molecules/knowledge-vault',
  'apps/web/src/components/molecules/MarkdownEditor.tsx',
  'apps/web/src/components/molecules/MarkdownEditorPreviewCopy.test.tsx',
  'apps/web/src/components/molecules/MarkdownEditorSmartPaste.test.tsx',
  'apps/web/src/components/molecules/MarkdownRenderer.tsx',
  'apps/web/src/components/molecules/NoteAIAssistPanel.tsx',
  'apps/web/src/components/molecules/__tests__/NoteAIAssistPanel.test.tsx',
  'apps/web/src/components/molecules/LibraryBulkActionsBar.tsx',
  'apps/web/src/components/molecules/LogbookLinkSuggestionsPanel.tsx',
  'apps/web/src/components/molecules/LogbookLinkedEntityAreaPicker.tsx',
  'apps/web/src/components/organisms/CoursePracticeSections.tsx',
  'apps/web/src/components/organisms/CourseStackCard.tsx',
  'apps/web/src/components/organisms/DocumentForm.tsx',
  'apps/web/src/components/organisms/FlashcardDeckCard.tsx',
  'apps/web/src/components/organisms/FlashcardDeckCreateDialog.tsx',
  'apps/web/src/components/organisms/__tests__/DocumentForm.test.tsx',
  'apps/web/src/components/organisms/__tests__/FlashcardDeckCreateDialog.test.tsx',
  'apps/web/src/components/organisms/__tests__/NoteFormEmptyMetadataGuidance.test.tsx',
  'apps/web/src/components/organisms/__tests__/NoteFormUnsavedGuard.test.tsx',
  'apps/web/src/components/organisms/__tests__/NoteFormUrlMetadata.test.tsx',
  'apps/web/src/components/organisms/__tests__/QuarantineZone.test.tsx',
  'apps/web/src/lib/knowledge-vault',
  'apps/web/src/hooks/useUrlMetadataPreview.ts',
  'apps/web/src/services/knowledge-vault',
  'apps/web/src/types/knowledge-vault.ts',
  'apps/web/src/pages/admin/InboxPage.tsx',
  'apps/web/src/pages/admin/KnowledgeVaultPage.tsx',
  'apps/web/src/pages/admin/FlashcardsPage.tsx',
  'apps/web/src/pages/admin/StudySessionPage.tsx'
)

Commit-Group 'feat(personal-branding): platform rules, content pipeline, and rolodex' @(
  'apps/web/src/components/molecules/personal-branding',
  'apps/web/src/components/organisms/personal-branding',
  'apps/web/src/lib/personal-branding',
  'apps/web/src/hooks/useContentStream.ts',
  'apps/web/src/hooks/useReconFeed.ts',
  'apps/web/src/hooks/personal-branding',
  'apps/web/src/services/personal-branding.service.ts',
  'apps/web/src/services/personal-branding.service.ideation.test.ts',
  'apps/web/src/services/branding-growth-loop.service.ts',
  'apps/web/src/types/api/personal-branding.dto.ts',
  'apps/web/src/pages/admin/personal-branding'
)

Commit-Group 'feat(observability): burn charts, execution detail, and cost guardrails' @(
  'apps/web/src/components/molecules/observability',
  'apps/web/src/components/organisms/observability',
  'apps/web/src/lib/observability',
  'apps/web/src/lib/observability-formatters.ts',
  'apps/web/src/services/observability.service.ts',
  'apps/web/src/types/observability.ts',
  'apps/web/src/pages/admin/ObservabilityPage.tsx',
  'apps/web/src/pages/admin/__tests__/ObservabilityPage.executionDetail.test.tsx'
)

Commit-Group 'feat(proactive): automation cards, run history, and settings surfaces' @(
  'apps/web/src/components/molecules/proactive',
  'apps/web/src/components/organisms/proactive',
  'apps/web/src/lib/proactive',
  'apps/web/src/hooks/useProactive.ts',
  'apps/web/src/services/proactive.service.ts',
  'apps/web/src/pages/admin/ProactiveAutomationsPage.tsx'
)

Commit-Group 'feat(planner): weekly review ritual, dashboard, and capacity UX' @(
  'apps/web/src/components/organisms/planner',
  'apps/web/src/components/organisms/widgets',
  'apps/web/src/components/molecules/PastReviewsDropdown.tsx',
  'apps/web/src/components/molecules/PastReviewsDropdown.test.tsx',
  'apps/web/src/components/molecules/VelocityChart.tsx',
  'apps/web/src/components/molecules/VelocityChart.test.tsx',
  'apps/web/src/components/molecules/WeeklyReviewAutoCompletedBadge.tsx',
  'apps/web/src/components/molecules/WeeklyReviewAutoCompletedBadge.test.tsx',
  'apps/web/src/components/molecules/WeeklyReviewHistoricalLockStrip.tsx',
  'apps/web/src/components/molecules/WeeklyReviewHistoricalLockStrip.test.tsx',
  'apps/web/src/components/molecules/WeeklyReviewWeekSwitchSkeleton.tsx',
  'apps/web/src/components/molecules/dashboard',
  'apps/web/src/components/organisms/__tests__/WeeklyDashboardGrid.test.tsx',
  'apps/web/src/components/organisms/__tests__/WeeklyDashboardSettingsDrawer.test.tsx',
  'apps/web/src/lib/planner',
  'apps/web/src/lib/weekly-review',
  'apps/web/src/types/planner.ts',
  'apps/web/src/types/weekly-dashboard.ts',
  'apps/web/src/utils/logbook-filters.test.ts',
  'apps/web/src/pages/admin/WeeklyReviewPage.tsx',
  'apps/web/src/pages/admin/__tests__/WeeklyReviewPageDraftState.test.tsx',
  'apps/web/src/pages/admin/__tests__/WeeklyReviewPageWeekSwitchSkeleton.test.tsx',
  'apps/web/src/pages/admin/__tests__/WeeklyReviewPageWowNarrative.test.tsx'
)

Commit-Group 'chore(frontend): shared types, telemetry, routes, and tooling' @(
  'apps/web/src/types/api-contracts.ts',
  'apps/web/src/types/llm.ts',
  'apps/web/src/lib/api-client.ts',
  'apps/web/src/lib/client-telemetry.ts',
  'apps/web/src/lib/client-telemetry.test.ts',
  'apps/web/src/lib/report-query-error.ts',
  'apps/web/src/lib/report-query-error.test.ts',
  'apps/web/src/lib/resolve-error-stack.ts',
  'apps/web/src/lib/vite-public-env.ts',
  'apps/web/src/lib/vite-public-env.test.ts',
  'apps/web/src/lib/react-query',
  'apps/web/src/lib/llm',
  'apps/web/src/hooks',
  'apps/web/src/contexts',
  'apps/web/src/constants',
  'apps/web/src/mocks',
  'apps/web/src/routes',
  'apps/web/src/routes.ts',
  'apps/web/src/App.tsx',
  'apps/web/src/main.tsx',
  'apps/web/package.json',
  'apps/web/tailwind.config.js',
  'apps/web/vite.config.ts',
  'bun.lock',
  'CLAUDE.md',
  'scripts'
)

# Sweep remaining source changes (exclude noise)
git add -A
git reset HEAD -- 'apps/logs/frontend/app.jsonl' 2>$null
git reset HEAD -- 'apps/garden/tsconfig.tsbuildinfo' 2>$null
git reset HEAD -- 'commit-msg-web.txt' 2>$null
git reset HEAD -- 'test-results' 2>$null
git reset HEAD -- 'playwright-report' 2>$null
git reset HEAD -- 'apps/web/test-results' 2>$null
git reset HEAD -- 'apps/web/playwright-report' 2>$null

$cached = git diff --cached --name-only
if ($cached) {
  git commit -m 'chore: include remaining frontend updates'
  Write-Host 'OK: remaining files'
} else {
  Write-Host 'No remaining staged files'
}

Write-Host '--- Remaining unstaged/untracked (should only be noise) ---'
git status --short
Write-Host '--- Recent commits ---'
git log --oneline -20
