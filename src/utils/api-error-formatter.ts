import type { ApiError } from '@/types/api-contracts';

/**
 * Formats API error messages for display to users
 * Handles validation errors with details arrays
 */
export function formatApiError(
  error:
    | {
        code?: string;
        message?: string;
        details?: Array<{ type?: string; loc?: string[]; msg?: string; input?: unknown }>;
      }
    | ApiError
    | undefined
): string {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // If there are validation details, format them into a user-friendly message
  if (error.details && Array.isArray(error.details) && error.details.length > 0) {
    const detailMessages = error.details
      .map((detail) => {
        // Extract field name from location array (e.g., ["body", "title"] -> "title")
        const field =
          detail.loc && Array.isArray(detail.loc) && detail.loc.length > 0
            ? detail.loc[detail.loc.length - 1]
            : 'field';
        // Capitalize first letter of field name
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
        return detail.msg ? `${fieldName}: ${detail.msg}` : `${fieldName} validation failed`;
      })
      .filter(Boolean);

    if (detailMessages.length > 0) {
      const baseMessage = error.message || 'Validation failed';
      return `${baseMessage}. ${detailMessages.join('. ')}`;
    }
  }

  // Fallback to error message or code
  return (
    error.message || (error as ApiError).code || 'An unexpected error occurred. Please try again.'
  );
}
