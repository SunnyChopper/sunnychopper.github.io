export function AssistantSettingsPageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assistant Settings</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Configure tool confirmations, default chat models, and background models for memory
        ingestion (short-term notes and thread summarization).
      </p>
    </div>
  );
}
