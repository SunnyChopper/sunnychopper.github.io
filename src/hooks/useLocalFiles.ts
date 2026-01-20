/**
 * Hook for managing local markdown files in localStorage
 * Local files are files that haven't been synced to the backend yet
 */

export interface LocalFile {
  path: string;
  content: string;
  tags?: string[];
  category?: string;
  syncedToBackend: boolean; // true if file has been successfully saved to backend
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'md_local_files';

/**
 * Get all local files from localStorage
 */
export function getAllLocalFiles(): LocalFile[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LocalFile[];
  } catch {
    return [];
  }
}

/**
 * Save all local files to localStorage
 */
function saveAllLocalFiles(files: LocalFile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (error) {
    console.error('Failed to save local files to localStorage:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Local storage quota exceeded. Please save or delete some local files.');
    }
    throw error;
  }
}

/**
 * Get a simple counter for new file names
 */
function getNextFileNumber(): number {
  const files = getAllLocalFiles();
  if (files.length === 0) return 1;

  // Simple counter - just use the number of files + 1
  // This is simpler than regex matching and works for any file name
  return files.length + 1;
}

/**
 * Create a new local file
 */
export function createLocalFile(): string {
  const number = getNextFileNumber();
  const path = `Untitled-${number}.md`;
  const now = new Date().toISOString();

  const newFile: LocalFile = {
    path,
    content: '',
    syncedToBackend: false,
    createdAt: now,
    updatedAt: now,
  };

  const files = getAllLocalFiles();
  files.push(newFile);
  saveAllLocalFiles(files);

  return path;
}

/**
 * Get a local file by path
 */
export function getLocalFile(path: string): LocalFile | null {
  const files = getAllLocalFiles();
  return files.find((file) => file.path === path) || null;
}

/**
 * Check if a file is local-only (exists in localStorage and not synced to backend)
 */
export function isLocalOnlyFile(path: string | undefined): boolean {
  if (!path) return false;
  const file = getLocalFile(path);
  return file !== null && !file.syncedToBackend;
}

/**
 * Mark a file as synced to backend
 */
export function markAsSynced(path: string): void {
  const files = getAllLocalFiles();
  const fileIndex = files.findIndex((file) => file.path === path);

  if (fileIndex !== -1) {
    files[fileIndex] = {
      ...files[fileIndex],
      syncedToBackend: true,
      updatedAt: new Date().toISOString(),
    };
    saveAllLocalFiles(files);

    // Dispatch custom event to notify file tree to refresh immediately
    window.dispatchEvent(new CustomEvent('localStorageFilesChanged'));
  }
}

/**
 * Update a local file's content
 */
export function updateLocalFile(path: string, content: string): void {
  const files = getAllLocalFiles();
  const fileIndex = files.findIndex((file) => file.path === path);

  if (fileIndex === -1) {
    // File doesn't exist, create it
    const now = new Date().toISOString();
    files.push({
      path,
      content,
      syncedToBackend: false,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Update existing file - keep syncedToBackend as false when updating locally
    files[fileIndex] = {
      ...files[fileIndex],
      content,
      syncedToBackend: false, // Ensure it stays false when updating locally
      updatedAt: new Date().toISOString(),
    };
  }

  saveAllLocalFiles(files);

  // Dispatch custom event to notify file tree to refresh immediately
  window.dispatchEvent(new CustomEvent('localStorageFilesChanged'));
}

/**
 * Update a local file's metadata (tags and category)
 */
export function updateLocalFileMetadata(path: string, tags: string[], category: string): void {
  const files = getAllLocalFiles();
  const fileIndex = files.findIndex((file) => file.path === path);

  if (fileIndex === -1) {
    // File doesn't exist, create it with metadata
    const now = new Date().toISOString();
    files.push({
      path,
      content: '',
      syncedToBackend: false,
      tags,
      category: category.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    // Update existing file metadata
    files[fileIndex] = {
      ...files[fileIndex],
      tags,
      category: category.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
  }

  saveAllLocalFiles(files);

  // Dispatch custom event to notify file tree to refresh immediately
  window.dispatchEvent(new CustomEvent('localStorageFilesChanged'));
}

/**
 * Delete a local file from localStorage
 * Also attempts to delete by matching partial paths for robustness
 */
export function deleteLocalFile(path: string): void {
  const files = getAllLocalFiles();

  // Filter out files matching the exact path OR files whose path ends with the given path
  // This handles cases where path might be just filename vs full path
  const filtered = files.filter((file) => {
    // Exact match
    if (file.path === path) return false;
    // Check if the stored path ends with the given path (for nested files)
    if (file.path.endsWith(`/${path}`)) return false;
    // Check if the given path ends with the stored path (for root-level files)
    if (path.endsWith(`/${file.path}`)) return false;
    return true;
  });

  saveAllLocalFiles(filtered);

  // Dispatch custom event to notify file tree to refresh immediately
  window.dispatchEvent(new CustomEvent('localStorageFilesChanged'));
}

/**
 * Force purge a file from localStorage by path - always removes it regardless of matching
 * Use this when you want guaranteed deletion
 */
export function purgeLocalFile(path: string): void {
  const files = getAllLocalFiles();
  const normalizedPath = path.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes

  // Filter out any file that matches the path in any way
  const filtered = files.filter((file) => {
    const normalizedFilePath = file.path.replace(/^\/+|\/+$/g, '');
    // Exact match
    if (normalizedFilePath === normalizedPath) return false;
    // Filename match
    if (normalizedFilePath.split('/').pop() === normalizedPath.split('/').pop()) return false;
    return true;
  });

  saveAllLocalFiles(filtered);

  // Dispatch custom event to notify file tree to refresh immediately
  window.dispatchEvent(new CustomEvent('localStorageFilesChanged'));
}

/**
 * React hook for managing local files
 */
export function useLocalFiles() {
  return {
    createLocalFile,
    getLocalFile,
    updateLocalFile,
    deleteLocalFile,
    purgeLocalFile,
    getAllLocalFiles,
    isLocalOnlyFile,
    markAsSynced,
    updateLocalFileMetadata,
  };
}
