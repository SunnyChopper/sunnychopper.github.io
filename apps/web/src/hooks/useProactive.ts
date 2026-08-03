import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { proactiveService } from '@/services/proactive.service';
import { queryKeys } from '@/lib/react-query/query-keys';
import type {
  NotificationWebhookConfig,
  ProactiveAutomation,
  ProactiveSuggestion,
  CoachEscalationNotificationsConfig,
  RecoveryNotificationsConfig,
  RecoveryMorningNudgeConfig,
  SetAmbientStrictPlanRequest,
  StaleEntityHunterPreferencesConfig,
} from '@/types/api-contracts';

import { unwrapApiData } from '@/lib/api-client/unwrap-api-response';

export function useProactiveAutomations() {
  return useQuery({
    queryKey: queryKeys.proactive.automations(),
    queryFn: async () => unwrapApiData(await proactiveService.getAutomations()),
  });
}

export function useProactiveSuggestions() {
  return useQuery({
    queryKey: queryKeys.proactive.suggestions(),
    queryFn: async () => unwrapApiData(await proactiveService.getSuggestions()),
  });
}

export function useProactiveAutomationRuns(automationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.proactive.automationRuns(automationId ?? ''),
    queryFn: async () => unwrapApiData(await proactiveService.getAutomationRuns(automationId!)),
    enabled: Boolean(automationId),
  });
}

export function useProactiveSettings() {
  const timeZone = useQuery({
    queryKey: queryKeys.preferences.timeZone(),
    queryFn: async () => unwrapApiData(await proactiveService.getTimeZone()),
  });
  const webhook = useQuery({
    queryKey: queryKeys.preferences.notificationWebhook(),
    queryFn: async () => unwrapApiData(await proactiveService.getNotificationWebhook()),
  });
  const recovery = useQuery({
    queryKey: queryKeys.preferences.recoveryNotifications(),
    queryFn: async () => unwrapApiData(await proactiveService.getRecoveryNotifications()),
  });
  const recoveryMorningNudge = useQuery({
    queryKey: queryKeys.preferences.recoveryMorningNudge(),
    queryFn: async () => unwrapApiData(await proactiveService.getRecoveryMorningNudge()),
  });
  const ambientStrictPlan = useQuery({
    queryKey: queryKeys.preferences.ambientStrictPlan(),
    queryFn: async () => unwrapApiData(await proactiveService.getAmbientStrictPlan()),
  });
  const coachEscalation = useQuery({
    queryKey: queryKeys.preferences.coachEscalationNotifications(),
    queryFn: async () => unwrapApiData(await proactiveService.getCoachEscalationNotifications()),
  });
  const staleEntityHunter = useQuery({
    queryKey: queryKeys.preferences.staleEntityHunter(),
    queryFn: async () => unwrapApiData(await proactiveService.getStaleEntityHunterPreferences()),
  });
  return {
    timeZone,
    webhook,
    recovery,
    recoveryMorningNudge,
    ambientStrictPlan,
    coachEscalation,
    staleEntityHunter,
  };
}

export function useProactiveMutations() {
  const queryClient = useQueryClient();

  const invalidateAutomations = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.proactive.automations() });
  const invalidateSuggestions = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.proactive.suggestions() });

  const createAutomation = useMutation({
    mutationFn: (body: Parameters<typeof proactiveService.createAutomation>[0]) =>
      proactiveService.createAutomation(body).then(unwrapApiData),
    onSuccess: invalidateAutomations,
  });

  const updateAutomation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof proactiveService.updateAutomation>[1];
    }) => proactiveService.updateAutomation(id, body).then(unwrapApiData),
    onSuccess: invalidateAutomations,
  });

  const deleteAutomation = useMutation({
    mutationFn: (id: string) => proactiveService.deleteAutomation(id).then(unwrapApiData),
    onSuccess: invalidateAutomations,
  });

  const resolveSuggestion = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof proactiveService.resolveSuggestion>[1];
    }) => proactiveService.resolveSuggestion(id, body).then(unwrapApiData),
    onSuccess: invalidateSuggestions,
  });

  const patchSuggestion = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof proactiveService.patchSuggestion>[1];
    }) => proactiveService.patchSuggestion(id, body).then(unwrapApiData),
    onSuccess: invalidateSuggestions,
  });

  const brainstormSuggestions = useMutation({
    mutationFn: (body?: Parameters<typeof proactiveService.brainstormSuggestions>[0]) =>
      proactiveService.brainstormSuggestions(body).then(unwrapApiData),
    onSuccess: invalidateSuggestions,
  });

  const setTimeZone = useMutation({
    mutationFn: (body: { timeZone: string }) =>
      proactiveService.setTimeZone(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.timeZone() });
    },
  });

  const setNotificationWebhook = useMutation({
    mutationFn: (body: NotificationWebhookConfig) =>
      proactiveService.setNotificationWebhook(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.notificationWebhook() });
    },
  });

  const setRecoveryNotifications = useMutation({
    mutationFn: (body: RecoveryNotificationsConfig) =>
      proactiveService.setRecoveryNotifications(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.recoveryNotifications() });
    },
  });

  const setRecoveryMorningNudge = useMutation({
    mutationFn: (body: RecoveryMorningNudgeConfig) =>
      proactiveService.setRecoveryMorningNudge(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.recoveryMorningNudge() });
    },
  });

  const clearAmbientStrictPlan = useMutation({
    mutationFn: () => proactiveService.setAmbientStrictPlan({ clear: true }).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.ambientStrictPlan() });
    },
  });

  const pauseAmbientStrictPlan = useMutation({
    mutationFn: (body: SetAmbientStrictPlanRequest) =>
      proactiveService.setAmbientStrictPlan(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.ambientStrictPlan() });
    },
  });

  const setCoachEscalationNotifications = useMutation({
    mutationFn: (body: CoachEscalationNotificationsConfig) =>
      proactiveService.setCoachEscalationNotifications(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.coachEscalationNotifications(),
      });
    },
  });

  const setStaleEntityHunterPreferences = useMutation({
    mutationFn: (body: StaleEntityHunterPreferencesConfig) =>
      proactiveService.setStaleEntityHunterPreferences(body).then(unwrapApiData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.staleEntityHunter() });
    },
  });

  const sendTestEmail = useMutation({
    mutationFn: () => proactiveService.sendTestEmail().then(unwrapApiData),
  });

  const sendTestWebhook = useMutation({
    mutationFn: () => proactiveService.sendTestWebhook().then(unwrapApiData),
  });

  const runAutomationDispatchTest = useMutation({
    mutationFn: (automationId: string) =>
      proactiveService.runAutomationDispatchTest(automationId).then(unwrapApiData),
  });

  return {
    createAutomation,
    updateAutomation,
    deleteAutomation,
    resolveSuggestion,
    patchSuggestion,
    brainstormSuggestions,
    setTimeZone,
    setNotificationWebhook,
    setRecoveryNotifications,
    setRecoveryMorningNudge,
    clearAmbientStrictPlan,
    pauseAmbientStrictPlan,
    setCoachEscalationNotifications,
    setStaleEntityHunterPreferences,
    sendTestEmail,
    sendTestWebhook,
    runAutomationDispatchTest,
    invalidateAutomations,
    invalidateSuggestions,
  };
}

export type { ProactiveAutomation, ProactiveSuggestion };
