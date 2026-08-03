import type { ProactiveAutomation } from '@/types/api-contracts';

export interface AutomationCardStatus {
  badgeStatus: string;
  label: string;
  isError: boolean;
}

export function isAutomationInError(automation: ProactiveAutomation): boolean {
  const status = (automation.lastStatus ?? '').toLowerCase();
  return status === 'error' || Boolean(automation.lastErrorPreview?.trim());
}

export function resolveAutomationCardStatus(automation: ProactiveAutomation): AutomationCardStatus {
  const status = (automation.lastStatus ?? '').toLowerCase();

  if (isAutomationInError(automation)) {
    return { badgeStatus: 'Error', label: 'Error', isError: true };
  }

  if (status === 'success' || status === 'ok' || status === 'succeeded') {
    return { badgeStatus: 'Healthy', label: 'Healthy', isError: false };
  }

  if (status) {
    return {
      badgeStatus: status,
      label: automation.lastStatus ?? 'Unknown',
      isError: false,
    };
  }

  return { badgeStatus: 'Not run yet', label: 'Not run yet', isError: false };
}

export function automationsAllHealthy(automations: ProactiveAutomation[]): boolean {
  return (
    automations.length > 0 && automations.every((automation) => !isAutomationInError(automation))
  );
}
