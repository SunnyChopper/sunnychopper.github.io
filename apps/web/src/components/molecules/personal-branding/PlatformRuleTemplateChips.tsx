import { selectableChipClassName } from '@/pages/admin/personal-branding/personal-branding-ui';
import {
  PLATFORM_RULE_TEMPLATES,
  type PlatformRuleTemplateId,
} from '@/lib/personal-branding/platform-rule-templates';

export interface PlatformRuleTemplateChipsProps {
  selectedTemplateId: PlatformRuleTemplateId | null;
  onSelect: (id: PlatformRuleTemplateId) => void;
  disabled?: boolean;
}

export default function PlatformRuleTemplateChips({
  selectedTemplateId,
  onSelect,
  disabled = false,
}: PlatformRuleTemplateChipsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Start from a template</p>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Platform rule starter templates"
      >
        {PLATFORM_RULE_TEMPLATES.map((template) => {
          const isSelected = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(template.id)}
              className={selectableChipClassName(
                isSelected,
                'rounded-full px-3 py-1.5 text-left text-sm'
              )}
              aria-pressed={isSelected}
              title={template.description}
              aria-label={`${template.label}. ${template.description}`}
            >
              {template.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
