import { Children, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  proactiveSettingsActionsClassName,
  proactiveSettingsBenefitClassName,
  proactiveSettingsBodyClassName,
  proactiveSettingsCardClassForTone,
  proactiveSettingsTitleClassName,
  type ProactiveSettingsTone,
} from '@/lib/proactive/proactive-settings-surfaces';

export type ProactiveSettingsCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: ProactiveSettingsTone;
  className?: string;
};

export default function ProactiveSettingsCard({
  title,
  description,
  children,
  actions,
  tone = 'default',
  className,
}: ProactiveSettingsCardProps) {
  const body = Children.toArray(children);

  return (
    <div className={cn(proactiveSettingsCardClassForTone(tone), className)}>
      <h3 className={proactiveSettingsTitleClassName}>{title}</h3>
      <p className={proactiveSettingsBenefitClassName}>{description}</p>
      {body.length > 0 ? <div className={proactiveSettingsBodyClassName}>{children}</div> : null}
      {actions ? <div className={proactiveSettingsActionsClassName}>{actions}</div> : null}
    </div>
  );
}
