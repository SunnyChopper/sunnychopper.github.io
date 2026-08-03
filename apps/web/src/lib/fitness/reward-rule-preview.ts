import type {
  FitnessRewardAutoMetric,
  FitnessRewardCategory,
  FitnessRewardTriggerType,
} from '@/types/fitness';

export type RewardRulePreviewInput = {
  name: string;
  points: number;
  category: FitnessRewardCategory;
  target: string;
  triggerType: FitnessRewardTriggerType;
  autoMetric: FitnessRewardAutoMetric | '';
  cooldownHours: string;
  maxClaimsPerDay: string;
};

export function formatRewardRulePreview(form: RewardRulePreviewInput): string {
  const target = form.target.trim();
  const name = form.name.trim();

  let sentence = `Earn ${form.points} pts`;
  if (target) {
    sentence += ` for every ${target}`;
  } else if (name) {
    sentence += ` for ${name}`;
  }

  const parenthetical: string[] = [form.triggerType, form.category];
  if (form.triggerType === 'auto' && form.autoMetric) {
    parenthetical.push(form.autoMetric);
  }
  const maxPerDay = form.maxClaimsPerDay.trim();
  if (maxPerDay) {
    parenthetical.push(`max ${maxPerDay}/day`);
  }
  const cooldown = form.cooldownHours.trim();
  if (cooldown) {
    parenthetical.push(`${cooldown}h cooldown`);
  }

  return `${sentence} (${parenthetical.join(', ')})`;
}

export function hasAdvancedRuleValues(form: {
  target: string;
  triggerType: FitnessRewardTriggerType;
  cooldownHours: string;
  maxClaimsPerDay: string;
}): boolean {
  return (
    form.target.trim() !== '' ||
    form.triggerType === 'auto' ||
    form.cooldownHours.trim() !== '' ||
    form.maxClaimsPerDay.trim() !== ''
  );
}
