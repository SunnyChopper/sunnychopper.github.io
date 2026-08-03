interface ShowAnswersToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ShowAnswersToggle({ checked, onChange, disabled = false }: ShowAnswersToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Show answers"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 shrink-0"
    >
      <span>Show answers</span>
      <span
        aria-hidden
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
