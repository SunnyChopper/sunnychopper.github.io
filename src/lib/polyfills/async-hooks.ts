/**
 * Polyfill for Node.js async_hooks module
 * Provides a minimal AsyncLocalStorage implementation for browser environments
 *
 * Note: This is a simplified polyfill. Full async context tracking is not possible
 * in browsers, so this uses a global store as a fallback.
 */

// Global store for async context (browser fallback)
const globalStore = new Map<symbol, unknown>();
let currentContext: symbol | null = null;

export class AsyncLocalStorage<T> {
  private readonly contextKey: symbol;

  constructor() {
    this.contextKey = Symbol('AsyncLocalStorage');
  }

  run<R>(store: T, callback: () => R): R {
    const previousContext = currentContext;
    currentContext = this.contextKey;
    globalStore.set(this.contextKey, store);
    try {
      return callback();
    } finally {
      if (previousContext === null) {
        globalStore.delete(this.contextKey);
        currentContext = null;
      } else {
        currentContext = previousContext;
      }
    }
  }

  getStore(): T | undefined {
    if (currentContext === this.contextKey) {
      return globalStore.get(this.contextKey) as T | undefined;
    }
    return undefined;
  }

  disable(): void {
    globalStore.delete(this.contextKey);
    if (currentContext === this.contextKey) {
      currentContext = null;
    }
  }

  enterWith(store: T): void {
    currentContext = this.contextKey;
    globalStore.set(this.contextKey, store);
  }

  exit(callback: () => void): void {
    const previousContext = currentContext;
    if (currentContext === this.contextKey) {
      globalStore.delete(this.contextKey);
      currentContext = null;
    }
    try {
      callback();
    } finally {
      if (previousContext) {
        currentContext = previousContext;
      }
    }
  }
}

// Export as default for CommonJS compatibility
export default {
  AsyncLocalStorage,
};

// Note: The class is already exported above with 'export class AsyncLocalStorage'
// This makes it available for both:
// - Named imports: import { AsyncLocalStorage } from 'async_hooks'
// - Namespace imports: import * as async_hooks from 'async_hooks'; async_hooks.AsyncLocalStorage
// - Default import: import async_hooks from 'async_hooks'; async_hooks.AsyncLocalStorage
