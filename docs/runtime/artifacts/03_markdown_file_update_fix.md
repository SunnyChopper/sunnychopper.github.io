# Markdown File Update Fix - File ID Issue

**Date:** 2026-01-19  
**Status:** Fixed (Frontend Workaround) - Backend Fix Required

## Problem Description

When editing markdown files that were loaded from S3, changes were not persisting to the cloud. The system would fall back to saving files locally (localStorage), causing changes to disappear when the file was reopened.

### Symptoms

1. User edits a file from S3
2. Saves successfully (shows "File saved locally" banner)
3. File deselection triggers reload
4. Changes are lost (file reverts to S3 version)
5. Console shows CORS error on PUT request

### Root Cause

The backend's `/markdown-files/tree` endpoint returns `FileTreeNode` objects where the `metadata.id` field contains the **file path** instead of the actual **database UUID**.

When the frontend tries to update a file, it uses this path as the file ID:

```
PUT https://dev-api.sunnysingh.tech/markdown-files/Personal%20OS%20Enhancements.md
```

Instead of:

```
PUT https://dev-api.sunnysingh.tech/markdown-files/{uuid}
```

This causes a CORS error because:

- The path-based update endpoint is deprecated
- Backend may not have proper CORS configuration for path-based updates
- Frontend falls back to localStorage, causing changes to be lost on reload

## Frontend Fix (Implemented)

### Files Modified

1. **`src/hooks/useMarkdownFile.ts`**
   - Added validation to detect path-like file IDs
   - Updates tree cache with correct file metadata when file is loaded
   - Added safeguards in update mutation to reject path-based IDs
   - Enhanced error messages and logging

2. **`src/hooks/useFileTree.ts`**
   - Added validation when tree is loaded to warn about invalid file IDs
   - Logs warnings for any file IDs that look like paths

3. **`src/hooks/markdown/useFileSave.ts`** (Critical Fix)
   - Changed from using path-based `updateFile` to ID-based `updateFileById`
   - Gets file ID from tree before saving
   - Validates file ID is a proper UUID before making API call
   - Uses `markdownFilesService.updateFileById()` instead of deprecated path-based method
   - Updated metadata saving to use ID-based method

### How the Fix Works

1. **Detection:** When a file is opened, the system checks if the file ID looks like a path (contains `.md` or `/`)

2. **Fallback:** If the ID is invalid, it skips `getFileContent()` and falls back to `getFile(path)`

3. **Cache Update:** When `getFile()` returns the correct file metadata (with proper UUID), it updates the React Query tree cache with this correct metadata

4. **Save Flow Fix (Critical):**
   - `useFileSave` now gets the file ID from the tree via `findNodeByPath()`
   - Validates the ID is a proper UUID (not a path)
   - Calls `markdownFilesService.updateFileById(fileId, content)` directly
   - This bypasses the old path-based `updateFile({ filePath, content })` method

5. **Validation:** Before any update operation, validates that the file ID is a proper UUID, not a path

### Code Example

```typescript
// OLD CODE (useFileSave.ts - BEFORE FIX)
const saveRegularFile = async (filePath: string, content: string) => {
  // ❌ This used path-based update
  const result = await updateFile({ filePath, content });
  // This would call: PUT /markdown-files/Personal%20OS%20Enhancements.md
};

// NEW CODE (useFileSave.ts - AFTER FIX)
const saveRegularFile = async (filePath: string, content: string) => {
  // ✅ Get file ID from tree
  const fileNode = findNodeByPath(filePath);
  const fileId = fileNode?.metadata?.id;

  // Validate file ID
  if (!fileId || fileId.startsWith('local-') || fileId.endsWith('.md') || fileId.includes('/')) {
    throw new Error('Invalid file ID');
  }

  // ✅ Use ID-based update directly
  const result = await markdownFilesService.updateFileById(fileId, content);
  // This calls: PUT /markdown-files/file-01kfc8nxy6e606a28k1331521z
};

// Tree cache update after loading file (useMarkdownFile.ts)
if (treeQuery?.data && result.data.id) {
  const updateTreeWithCorrectId = (nodes: FileTreeNode[]): FileTreeNode[] => {
    return nodes.map((node) => {
      if (node.type === 'file' && node.path === filePath) {
        return { ...node, metadata: result.data };
      }
      // ... recursive update for folders
    });
  };
  queryClient.setQueryData(queryKeys.markdownFiles.tree(), {
    success: true,
    data: updateTreeWithCorrectId(treeQuery.data),
  });
}
```

## Backend Fix Required

The proper fix must be implemented on the backend:

### Issue

The `/markdown-files/tree` endpoint returns:

```json
{
  "tree": [
    {
      "type": "file",
      "name": "Personal OS Enhancements.md",
      "path": "Personal OS Enhancements.md",
      "metadata": {
        "id": "Personal OS Enhancements.md", // ❌ This should be UUID
        "path": "Personal OS Enhancements.md",
        "name": "Personal OS Enhancements.md"
        // ... other fields
      }
    }
  ]
}
```

### Required Fix

The `metadata.id` field must contain the database UUID:

```json
{
  "tree": [
    {
      "type": "file",
      "name": "Personal OS Enhancements.md",
      "path": "Personal OS Enhancements.md",
      "metadata": {
        "id": "550e8400-e29b-41d4-a716-446655440000", // ✅ UUID from database
        "path": "Personal OS Enhancements.md",
        "name": "Personal OS Enhancements.md"
        // ... other fields
      }
    }
  ]
}
```

### Backend Files to Check

1. **Tree Endpoint Handler:** Look for the handler that implements `GET /markdown-files/tree`
2. **File Serializer:** Check how `MarkdownFile` objects are being serialized
3. **Database Query:** Ensure the query selects the `id` column from the files table

### Example Backend Fix (Pseudocode)

```python
# Backend: Tree endpoint handler
def get_file_tree():
    # Query database for files
    files = db.query("""
        SELECT
            id,           -- ✅ Make sure this is selected
            path,
            name,
            size,
            created_at,
            updated_at,
            tags,
            category
        FROM markdown_files
        ORDER BY path
    """)

    # Build tree structure
    tree = build_tree_from_files(files)

    return {"tree": tree}

def build_tree_from_files(files):
    # ... tree building logic ...
    # Make sure to use file.id, not file.path
    node = {
        "type": "file",
        "name": file.name,
        "path": file.path,
        "metadata": {
            "id": file.id,         # ✅ Use database ID
            "path": file.path,
            "name": file.name,
            # ... other metadata
        }
    }
```

## Testing the Fix

### Frontend (Current Workaround)

1. Open the app and navigate to Markdown Viewer
2. Open the browser console
3. Select a file from the cloud
4. Check console for logs:
   - `[useFileTree] ⚠️  Backend returned file with path-like ID:` - Shows if tree has invalid IDs
   - `[useMarkdownFile] Loading file:` - Shows file ID being used
   - `[useMarkdownFile] Updated tree cache with correct file ID:` - Shows cache update
5. Edit and save the file
6. Check console for:
   - `[useMarkdownFile] Update attempt:` - Shows file ID being used for update
   - Should NOT see CORS errors
7. Reload the file - changes should persist

### Backend (After Fix)

1. Call `GET /markdown-files/tree` and verify all file IDs are UUIDs
2. Call `PUT /markdown-files/{uuid}` with a valid UUID - should work
3. Call `PUT /markdown-files/some-path.md` with a path - should return 404 or 400
4. Frontend should work seamlessly without workarounds

## Logging Output

### If Backend Returns Path-like IDs (Needs Backend Fix)

```
[useFileTree] ⚠️  Backend returned file with path-like ID:
  { path: "Personal OS Enhancements.md", id: "Personal OS Enhancements.md", expectedFormat: "UUID" }

[useMarkdownFile] Loading file:
  { filePath: "Personal OS Enhancements.md", fileId: "Personal OS Enhancements.md", hasFileNode: true }

[useMarkdownFile] File ID looks like a path, not a UUID. Skipping getFileContent: Personal OS Enhancements.md

[useMarkdownFile] Loaded from getFile:
  { id: "file-01kfc8nxy6e606a28k1331521z", path: "Personal OS Enhancements.md", name: "Personal OS Enhancements.md" }

[useMarkdownFile] Updated tree cache with correct file ID: file-01kfc8nxy6e606a28k1331521z

// When saving:
[useFileSave] saveRegularFile:
  { filePath: "Personal OS Enhancements.md", fileId: "file-01kfc8nxy6e606a28k1331521z", hasFileNode: true }

[MarkdownService] Updating file by ID: file-01kfc8nxy6e606a28k1331521z
[MarkdownService] File updated successfully: file-01kfc8nxy6e606a28k1331521z
```

### If Backend Returns Correct UUIDs (After Backend Fix)

```
[useMarkdownFile] Loading file:
  { filePath: "Personal OS Enhancements.md", fileId: "file-01kfc8nxy6e606a28k1331521z", hasFileNode: true }

[useMarkdownFile] Loaded from getFileContent with metadata:
  { id: "file-01kfc8nxy6e606a28k1331521z", path: "Personal OS Enhancements.md", ... }

// When saving (no tree cache update needed):
[useFileSave] saveRegularFile:
  { filePath: "Personal OS Enhancements.md", fileId: "file-01kfc8nxy6e606a28k1331521z", hasFileNode: true }

[MarkdownService] Updating file by ID: file-01kfc8nxy6e606a28k1331521z
[MarkdownService] File updated successfully: file-01kfc8nxy6e606a28k1331521z
```

## Notes

- This frontend fix is a **workaround** that patches the issue in the browser
- Each file must be opened once before it can be updated successfully
- The proper fix must be implemented on the backend
- Until the backend is fixed, files will show warnings in the console
- The workaround adds a small performance overhead (extra tree cache updates)

## Related Files

- Frontend Hooks:
  - `src/hooks/useMarkdownFile.ts` (file loading and ID-based updates)
  - `src/hooks/useFileTree.ts` (tree loading and validation)
  - `src/hooks/markdown/useFileSave.ts` (save operations - critical fix)
- Service: `src/services/markdown-files.service.ts`
- Types: `src/types/markdown-files.ts`
- Backend: (endpoint handlers for `/markdown-files/tree` and `/markdown-files/{id}`)

## Update History

- **2026-01-19 (Initial)**: Added validation and tree cache updates in `useMarkdownFile` and `useFileTree`
- **2026-01-19 (Final Fix)**: Fixed `useFileSave` to use ID-based updates instead of path-based updates
