/**
 * Whether to show raw assistant error text under the generic failure heading.
 */
export function shouldShowAssistantErrorDetails(messageText?: string): boolean {
  if (!messageText) {
    return false;
  }
  return messageText.trim().toLowerCase() !== 'failed to generate response';
}
