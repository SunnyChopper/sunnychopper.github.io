import {
  assistantSettingsDirtyBarButtonClassName,
  assistantSettingsDirtyBarClassName,
} from '@/components/molecules/settings/assistant-settings-surfaces';

export interface AssistantSettingsDirtyBarProps {
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export function AssistantSettingsDirtyBar({
  saving,
  onDiscard,
  onSave,
}: AssistantSettingsDirtyBarProps) {
  return (
    <div
      className={assistantSettingsDirtyBarClassName}
      data-testid="assistant-settings-dirty-bar"
      role="region"
      aria-label="Unsaved assistant settings"
    >
      <span className="mr-auto min-w-0 text-sm text-amber-700 dark:text-amber-300">
        Unsaved changes
      </span>
      <button
        type="button"
        onClick={onDiscard}
        disabled={saving}
        aria-label="Discard unsaved assistant settings changes"
        className={`${assistantSettingsDirtyBarButtonClassName} border border-gray-300/80 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600/80 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/80`}
      >
        Discard
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        aria-label={saving ? 'Saving assistant settings' : 'Save all assistant settings'}
        className={`${assistantSettingsDirtyBarButtonClassName} bg-blue-600 px-4 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500`}
      >
        {saving ? 'Saving…' : 'Save all settings'}
      </button>
    </div>
  );
}
