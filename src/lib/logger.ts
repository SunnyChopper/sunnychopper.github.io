/**
 * Centralized logging service
 * Automatically handles DEV mode checks - logs only in development
 * Use this instead of console.log/warn/error throughout the codebase
 */

const isDev = import.meta.env.DEV;

/**
 * Logger interface matching console methods
 */
interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Create a logger with optional context prefix
 * @param context - Optional prefix for all log messages (e.g., '[ApiClient]')
 * @returns Logger instance
 */
export function createLogger(context?: string): Logger {
  const prefix = context ? `[${context}]` : '';

  return {
    log: (...args: unknown[]) => {
      if (isDev) {
        console.log(prefix, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (isDev) {
        console.warn(prefix, ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Always log errors, even in production
      console.error(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (isDev) {
        console.info(prefix, ...args);
      }
    },
    debug: (...args: unknown[]) => {
      if (isDev) {
        console.debug(prefix, ...args);
      }
    },
  };
}

/**
 * Default logger (no context prefix)
 */
export const logger = createLogger();

/**
 * Common logger instances with context
 * Import these directly for common use cases
 */
export const apiLogger = createLogger('ApiClient');
export const authLogger = createLogger('Auth');
export const llmLogger = createLogger('LLM');
