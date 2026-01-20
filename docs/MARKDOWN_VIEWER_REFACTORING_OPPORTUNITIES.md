# MarkdownViewer Refactoring Opportunities

## Executive Summary

This document identifies code duplication and abstraction opportunities in the MarkdownViewer component stack. The analysis covers `MarkdownViewer.tsx`, `MarkdownViewerPage.tsx`, and related hooks/services.

**Total Duplication Identified:**

- ~200+ lines of duplicated code patterns
- 8 major abstraction opportunities
- 5 utility functions that should be extracted

---

## 1. Query Invalidation Patterns

### Current Duplication

**Location:** `MarkdownViewer.tsx` (multiple locations), `MarkdownViewerPage.tsx`

**Pattern:** Repeated query invalidation sequences appear in:

- `handleSave` (lines 204-208, 255, 269, 289)
- `handleRename` (lines 335-338, 368-371)
- `handleDelete` (lines 432-436)
- `EditFileMetadataModal.onSave` (lines 755-759, 769-777)
- `MarkdownViewerPage.handleDeleteConfirm` (lines 206-208)
- `MarkdownViewerPage.handleCreateFolder` (lines 73-74)
- `MarkdownViewerPage.EditFileMetadataModal.onSave` (lines 381-385)

**Example:**

```typescript
// Repeated 8+ times across files
queryClient.invalidateQueries({ queryKey: ['markdown-file', filePath] });
queryClient.invalidateQueries({ queryKey: ['markdown-files'] });
queryClient.invalidateQueries({ queryKey: queryKeys.markdownFiles.tree() });
queryClient.invalidateQueries({ queryKey: ['markdown-tags'] });
queryClient.invalidateQueries({ queryKey: ['markdown-categories'] });
```

### Proposed Abstraction

**Create:** `src/lib/markdown/query-invalidation.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';

/**
 * Invalidate all markdown-related queries
 */
export function invalidateMarkdownQueries(
  queryClient: QueryClient,
  options?: {
    filePath?: string;
    includeTags?: boolean;
    includeCategories?: boolean;
  }
) {
  const { filePath, includeTags = false, includeCategories = false } = options || {};

  if (filePath) {
    queryClient.invalidateQueries({ queryKey: ['markdown-file', filePath] });
  }
  queryClient.invalidateQueries({ queryKey: ['markdown-files'] });
  queryClient.invalidateQueries({ queryKey: queryKeys.markdownFiles.tree() });

  if (includeTags) {
    queryClient.invalidateQueries({ queryKey: ['markdown-tags'] });
  }
  if (includeCategories) {
    queryClient.invalidateQueries({ queryKey: ['markdown-categories'] });
  }
}

/**
 * Invalidate queries after file operations
 */
export function invalidateAfterFileOperation(
  queryClient: QueryClient,
  filePath?: string,
  includeMetadata = false
) {
  invalidateMarkdownQueries(queryClient, {
    filePath,
    includeTags: includeMetadata,
    includeCategories: includeMetadata,
  });
}
```

**Impact:** Reduces ~60 lines of duplication, ensures consistency

---

## 2. Success/Error Message Handling

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 140-150, 170-179, 219-226, 252-259, 286-293, 305-311)

**Pattern:** Repeated success message + navigation pattern:

```typescript
setIsSaving(false);
setSaveSuccess('File saved locally'); // or 'File saved successfully'
queryClient.invalidateQueries({ queryKey: queryKeys.markdownFiles.tree() });
setTimeout(() => {
  navigate(ROUTES.admin.markdownViewer);
}, 1000);
```

### Proposed Abstraction

**Create:** `src/hooks/useFileOperationFeedback.ts`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes';

export function useFileOperationFeedback() {
  const navigate = useNavigate();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const showSuccessAndNavigate = (message: string, delay = 1000) => {
    setSaveSuccess(message);
    setTimeout(() => {
      navigate(ROUTES.admin.markdownViewer);
      setSaveSuccess(null);
    }, delay);
  };

  const showError = (message: string) => {
    setSaveError(message);
  };

  const clearMessages = () => {
    setSaveError(null);
    setSaveSuccess(null);
  };

  return {
    saveError,
    saveSuccess,
    showSuccessAndNavigate,
    showError,
    clearMessages,
    setSaveError,
    setSaveSuccess,
  };
}
```

**Impact:** Reduces ~40 lines, standardizes feedback UX

---

## 3. File Path Encoding/Decoding

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 341-345, 374-378), `MarkdownViewerPage.tsx` (lines 54-58, 103-107, 153-158, 169-174)

**Pattern:** Repeated encoding/decoding:

```typescript
const encodedPath = encodeURIComponent(filePath);
navigate(
  generatePath(ROUTES.admin.markdownViewerFile, {
    filePath: encodedPath,
  })
);
```

### Proposed Abstraction

**Create:** `src/lib/markdown/navigation-utils.ts`

```typescript
import { generatePath } from 'react-router-dom';
import { ROUTES } from '@/routes';

/**
 * Navigate to a markdown file
 */
export function navigateToMarkdownFile(
  navigate: (path: string) => void,
  filePath: string,
  options?: { reader?: boolean }
) {
  const encodedPath = encodeURIComponent(filePath);
  const path = generatePath(ROUTES.admin.markdownViewerFile, {
    filePath: encodedPath,
  });
  const url = options?.reader ? `${path}?reader=true` : path;
  navigate(url);
}

/**
 * Get encoded file path for navigation
 */
export function getEncodedFilePath(filePath: string): string {
  return encodeURIComponent(filePath);
}
```

**Impact:** Reduces ~20 lines, ensures consistent navigation

---

## 4. Local File Result Detection

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 166, 248, 264)

**Pattern:** Repeated check for local file results:

```typescript
const isLocalFileResult = result.data?.id?.startsWith('local-');
```

### Proposed Abstraction

**Add to:** `src/lib/markdown/file-utils.ts`

```typescript
/**
 * Check if a file result is a local-only file
 */
export function isLocalFileResult(file: MarkdownFile | undefined): boolean {
  return file?.id?.startsWith('local-') ?? false;
}
```

**Impact:** Reduces ~5 lines, improves readability

---

## 5. File Deletion Logic

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 400-453), `MarkdownViewerPage.tsx` (lines 177-224)

**Pattern:** Nearly identical deletion logic:

1. Get file ID from tree
2. Purge from localStorage
3. Delete from backend (if ID exists)
4. Invalidate queries
5. Navigate away

**Difference:** Only navigation logic differs slightly

### Proposed Abstraction

**Create:** `src/hooks/useFileDeletion.ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { purgeLocalFile } from '@/hooks/useLocalFiles';
import { useMarkdownFiles } from '@/hooks/useMarkdownFiles';
import { useFileTree } from '@/hooks/useFileTree';
import { invalidateAfterFileOperation } from '@/lib/markdown/query-invalidation';
import { ROUTES } from '@/routes';

export function useFileDeletion() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { deleteFile } = useMarkdownFiles();
  const { findNodeByPath } = useFileTree();

  const deleteFileWithCleanup = async (
    filePath: string,
    options?: {
      navigateAfter?: boolean;
      navigateTo?: string;
    }
  ) => {
    // Get file ID from tree
    const fileNode = findNodeByPath(filePath);
    const fileId = fileNode?.metadata?.id;

    // Step 1: Purge from localStorage
    purgeLocalFile(filePath);

    // Step 2: Delete from backend if ID exists
    if (fileId) {
      try {
        await deleteFile(filePath, fileId);
      } catch (error) {
        console.warn('Backend deletion failed:', error);
        // Continue even if backend deletion fails
      }
    }

    // Step 3: Invalidate queries
    await invalidateAfterFileOperation(queryClient, filePath);

    // Step 4: Navigate if requested
    if (options?.navigateAfter) {
      navigate(options.navigateTo || ROUTES.admin.markdownViewer);
    }
  };

  return { deleteFileWithCleanup };
}
```

**Impact:** Reduces ~80 lines of duplication

---

## 6. Save Operation with Local Fallback

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 113-313)

**Pattern:** Complex save logic with multiple branches:

- Local-only file save
- Regular file save
- Backend unavailable handling
- Success/error messaging
- Navigation

**Issues:**

- 200+ lines in single function
- Multiple nested try-catch blocks
- Repeated success/error patterns
- Complex conditional logic

### Proposed Abstraction

**Create:** `src/hooks/useFileSave.ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { useMarkdownFiles } from '@/hooks/useMarkdownFiles';
import { useMarkdownFile } from '@/hooks/useMarkdownFile';
import {
  getLocalFile,
  updateLocalFile,
  deleteLocalFile,
  isLocalOnlyFile,
} from '@/hooks/useLocalFiles';
import { isBackendUnavailable } from '@/services/markdown-files.service';
import { isLocalFileResult } from '@/lib/markdown/file-utils';
import { invalidateAfterFileOperation } from '@/lib/markdown/query-invalidation';
import { markdownFilesService } from '@/services/markdown-files.service';

export function useFileSave(filePath: string | undefined) {
  const queryClient = useQueryClient();
  const { createFile, updateFile } = useMarkdownFiles();
  const { isLocalOnly } = useMarkdownFile(filePath);

  const saveFile = async (content: string) => {
    if (!filePath) throw new Error('No file path provided');

    if (isLocalOnlyFile(filePath)) {
      return await saveLocalOnlyFile(filePath, content);
    } else {
      return await saveRegularFile(filePath, content);
    }
  };

  const saveLocalOnlyFile = async (filePath: string, content: string) => {
    // Update localStorage first
    updateLocalFile(filePath, content);
    const localFile = getLocalFile(filePath);

    try {
      const result = await createFile({ path: filePath, content });

      if (!result.success && isBackendUnavailable(result.error)) {
        return { success: true, local: true };
      }

      if (isLocalFileResult(result.data)) {
        return { success: true, local: true };
      }

      // Backend save succeeded
      deleteLocalFile(filePath);

      // Save metadata if present
      if (localFile?.tags || localFile?.category) {
        try {
          await markdownFilesService.updateFileMetadata(
            filePath,
            localFile.tags || [],
            localFile.category || ''
          );
        } catch (error) {
          console.warn('Failed to save metadata:', error);
        }
      }

      await invalidateAfterFileOperation(queryClient, filePath, true);
      return { success: true, local: false };
    } catch (error) {
      if (isBackendUnavailable(error)) {
        return { success: true, local: true };
      }
      throw error;
    }
  };

  const saveRegularFile = async (filePath: string, content: string) => {
    const result = await updateFile({ filePath, content });

    if (result && 'success' in result && result.success) {
      if (isLocalFileResult(result.data)) {
        return { success: true, local: true };
      }

      // Backend save succeeded - clean up local file if exists
      const localFile = getLocalFile(filePath);
      if (localFile && !localFile.syncedToBackend) {
        deleteLocalFile(filePath);
      }

      await invalidateAfterFileOperation(queryClient, filePath);
      return { success: true, local: false };
    }

    // Handle error case
    const error = result && 'error' in result ? result.error : null;
    if (isBackendUnavailable(error)) {
      return { success: true, local: true };
    }

    throw new Error(error?.message || 'Failed to save file');
  };

  return { saveFile };
}
```

**Impact:** Reduces ~150 lines, improves testability, separates concerns

---

## 7. Metadata Update Pattern

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 748-782), `MarkdownViewerPage.tsx` (lines 373-391)

**Pattern:** Repeated metadata update logic:

```typescript
if (isLocalOnlyFile(filePath)) {
  updateLocalFileMetadata(filePath, tags, category);
  // Invalidate queries
} else {
  const result = await markdownFilesService.updateFileMetadata(...);
  if (result.success) {
    // Invalidate queries
  } else {
    throw new Error(...);
  }
}
```

### Proposed Abstraction

**Create:** `src/hooks/useFileMetadata.ts`

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { updateLocalFileMetadata, isLocalOnlyFile } from '@/hooks/useLocalFiles';
import { markdownFilesService } from '@/services/markdown-files.service';
import { invalidateAfterFileOperation } from '@/lib/markdown/query-invalidation';

export function useFileMetadata() {
  const queryClient = useQueryClient();

  const updateMetadata = async (filePath: string, tags: string[], category: string) => {
    if (isLocalOnlyFile(filePath)) {
      updateLocalFileMetadata(filePath, tags, category);
      await invalidateAfterFileOperation(queryClient, filePath);
    } else {
      const result = await markdownFilesService.updateFileMetadata(filePath, tags, category);
      if (result.success) {
        await invalidateAfterFileOperation(queryClient, filePath, true);
      } else {
        throw new Error(result.error?.message || 'Failed to update metadata');
      }
    }
  };

  return { updateMetadata };
}
```

**Impact:** Reduces ~30 lines, standardizes metadata handling

---

## 8. File Rename Logic

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 316-398)

**Pattern:** Complex rename logic with local vs regular file handling

### Proposed Abstraction

**Create:** `src/hooks/useFileRename.ts`

```typescript
import { useNavigate } from 'react-router-dom';
import { useMarkdownFiles } from '@/hooks/useMarkdownFiles';
import { useMarkdownFile } from '@/hooks/useMarkdownFile';
import { getLocalFile, deleteLocalFile, isLocalOnlyFile } from '@/hooks/useLocalFiles';
import { navigateToMarkdownFile } from '@/lib/markdown/navigation-utils';
import { invalidateAfterFileOperation } from '@/lib/markdown/query-invalidation';
import { useQueryClient } from '@tanstack/react-query';

export function useFileRename(filePath: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createFile, deleteFile } = useMarkdownFiles();
  const { isLocalOnly } = useMarkdownFile(filePath);

  const renameFile = async (newPath: string) => {
    if (!filePath) throw new Error('No file path provided');

    const content = isLocalOnly
      ? getLocalFile(filePath)?.content || ''
      : // Get from file hook
        '';

    if (isLocalOnlyFile(filePath)) {
      await createFile({ path: newPath, content });
      deleteLocalFile(filePath);
    } else {
      await createFile({ path: newPath, content });
      await deleteFile(filePath);
    }

    // Invalidate queries
    await invalidateAfterFileOperation(queryClient, filePath);
    await invalidateAfterFileOperation(queryClient, newPath);

    // Navigate to new file
    navigateToMarkdownFile(navigate, newPath);
  };

  return { renameFile };
}
```

**Impact:** Reduces ~50 lines, simplifies rename logic

---

## 9. Modal State Management

### Current Duplication

**Location:** `MarkdownViewer.tsx` (lines 47-49), `MarkdownViewerPage.tsx` (lines 28-31)

**Pattern:** Multiple boolean state variables for modals:

```typescript
const [showRenameModal, setShowRenameModal] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [showMetadataModal, setShowMetadataModal] = useState(false);
```

### Proposed Abstraction

**Create:** `src/hooks/useModalState.ts`

```typescript
import { useState } from 'react';

type ModalType = 'rename' | 'delete' | 'metadata' | null;

export function useModalState() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return {
    activeModal,
    openModal,
    closeModal,
    isRenameOpen: activeModal === 'rename',
    isDeleteOpen: activeModal === 'delete',
    isMetadataOpen: activeModal === 'metadata',
  };
}
```

**Impact:** Reduces state management complexity, prevents multiple modals open

---

## 10. Error Message Extraction

### Current Duplication

**Location:** Multiple locations

**Pattern:** Repeated error message extraction:

```typescript
const errorMessage = err instanceof Error ? err.message : 'Failed to...';
```

### Proposed Abstraction

**Add to:** `src/lib/react-query/error-utils.ts` (or create new file)

```typescript
/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return defaultMessage;
}
```

**Impact:** Standardizes error handling

---

## Summary of Proposed Changes

### New Files to Create

1. `src/lib/markdown/query-invalidation.ts` - Query invalidation utilities
2. `src/lib/markdown/navigation-utils.ts` - Navigation utilities
3. `src/hooks/useFileOperationFeedback.ts` - Success/error feedback
4. `src/hooks/useFileDeletion.ts` - File deletion logic
5. `src/hooks/useFileSave.ts` - File save logic
6. `src/hooks/useFileMetadata.ts` - Metadata update logic
7. `src/hooks/useFileRename.ts` - File rename logic
8. `src/hooks/useModalState.ts` - Modal state management

### Files to Update

1. `src/lib/markdown/file-utils.ts` - Add `isLocalFileResult` helper
2. `src/lib/react-query/error-utils.ts` - Add `extractErrorMessage` helper
3. `src/components/organisms/MarkdownViewer.tsx` - Refactor to use new hooks
4. `src/pages/admin/MarkdownViewerPage.tsx` - Refactor to use new hooks

### Estimated Impact

- **Lines Reduced:** ~400+ lines of duplication
- **Maintainability:** Significantly improved
- **Testability:** Much easier to test isolated hooks
- **Consistency:** Standardized patterns across codebase
- **Type Safety:** Better TypeScript support with dedicated hooks

---

## Implementation Priority

### High Priority (Quick Wins)

1. Query invalidation utilities (#1)
2. Navigation utilities (#3)
3. Error message extraction (#10)
4. Local file result detection (#4)

### Medium Priority (Significant Impact)

5. File deletion hook (#5)
6. Metadata update hook (#7)
7. Modal state management (#9)

### Low Priority (Complex Refactoring)

8. File save hook (#6) - Requires careful testing
9. File rename hook (#8) - Requires careful testing
10. Success/error feedback hook (#2) - Nice to have

---

## Testing Considerations

Each new hook/utility should have:

- Unit tests for core logic
- Integration tests for React Query interactions
- Error handling tests
- Edge case coverage (local files, backend unavailable, etc.)

---

## Migration Strategy

1. **Phase 1:** Create utility functions (query invalidation, navigation, error utils)
2. **Phase 2:** Create simple hooks (metadata, deletion)
3. **Phase 3:** Refactor MarkdownViewer to use new hooks incrementally
4. **Phase 4:** Refactor MarkdownViewerPage
5. **Phase 5:** Create complex hooks (save, rename)
6. **Phase 6:** Final cleanup and optimization

---

## Notes

- All abstractions maintain backward compatibility during migration
- Hooks follow React Query patterns for consistency
- Error handling is preserved in all abstractions
- Local file fallback logic is maintained throughout
