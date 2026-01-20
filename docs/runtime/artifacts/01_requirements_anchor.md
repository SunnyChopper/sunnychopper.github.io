# Requirements Anchor: Markdown Viewer

**Generated:** 2026-01-17  
**Source PRD:** `docs/specs/markdown_viewer_prd.md`

## Feature List

### MVP (Must Have)

- Hierarchical File Tree: Sidebar with folder/file structure, expand/collapse functionality
- Markdown Rendering: High-fidelity GFM rendering with code blocks, tables, math support
- File Selection: Click file → renders in main pane, URL updates to `/admin/markdown-viewer/:filePath`
- Empty State: "Select a file" prompt when no file is active
- File Metadata: Display file size, last modified date in sidebar
- Create New File: Modal/form to create new `.md` file with path specification
- Upload Files: Drag-and-drop or file picker to upload markdown files
- Edit Mode: Toggle between view/edit modes with save functionality
- Text Search: Search across file names and content
- Responsive Layout: Sidebar hidden on mobile (< 768px), becomes bottom sheet/drawer

### V1 (Should Have)

- Tag/Category View: Alternative view mode organized by tags/categories
- Command Palette Integration: Cmd+K search includes markdown files
- Code Block Enhancements: Copy button, line numbers, language badge
- Folder Operations: Create folders, move files between folders
- File Operations: Rename, delete files
- Embedding Search: Semantic search using embeddings (backend integration)
- Recent Files: Quick access to recently viewed files
- Breadcrumb Navigation: Show current file path in header

## 30-Second Audit

| Feature Name                    | Complexity | Scope | Notes                                                        |
| ------------------------------- | ---------- | ----- | ------------------------------------------------------------ |
| Hierarchical File Tree          | M          | New   | Requires tree data structure, virtualization for large lists |
| Markdown Rendering              | L          | Mod   | Extend existing `MarkdownRenderer` component                 |
| File Selection & URL Routing    | L          | New   | Standard React Router pattern                                |
| Empty State                     | L          | New   | Simple conditional rendering                                 |
| File Metadata Display           | L          | New   | Display data from API response                               |
| Create New File Modal           | M          | New   | Form with path validation                                    |
| File Upload (Drag & Drop)       | M          | New   | Follow existing drag-drop patterns                           |
| Edit Mode Toggle                | L          | Mod   | Reuse existing `MarkdownEditor` component                    |
| Text Search                     | M          | New   | Debounced search with API integration                        |
| Responsive Layout               | M          | New   | Mobile drawer pattern similar to AdminLayout                 |
| Tag/Category View               | M          | New   | Alternative view mode implementation                         |
| Command Palette Integration     | L          | Mod   | Extend existing `CommandPalette` component                   |
| Code Block Enhancements         | M          | Mod   | Extend `MarkdownRenderer` code block component               |
| Folder Operations               | M          | New   | Create, move operations with API                             |
| File Operations (Rename/Delete) | L          | New   | Standard CRUD operations                                     |
| Embedding Search                | H          | New   | Requires backend integration, vector search                  |
| Recent Files                    | L          | New   | localStorage-based tracking                                  |
| Breadcrumb Navigation           | L          | New   | Path display component                                       |

**Complexity Legend:** L = Low, M = Medium, H = High  
**Scope Legend:** New = New component/feature, Mod = Modify existing, Refactor = Significant refactoring

## Touchpoint Map

### Files to Create

- `src/pages/admin/MarkdownViewerPage.tsx` - Main page component
- `src/components/organisms/MarkdownFileTree.tsx` - Sidebar file tree
- `src/components/organisms/MarkdownViewer.tsx` - Main viewer/editor container
- `src/components/organisms/MarkdownFileSearch.tsx` - Search component
- `src/components/molecules/MarkdownFileItem.tsx` - File item in tree
- `src/components/molecules/MarkdownFolderItem.tsx` - Folder item in tree
- `src/components/molecules/MarkdownViewerContent.tsx` - Extended renderer wrapper
- `src/components/molecules/FileUploadZone.tsx` - Drag-and-drop upload
- `src/components/molecules/CreateFileModal.tsx` - New file creation modal
- `src/components/atoms/CodeBlockToolbar.tsx` - Copy/line numbers for code blocks
- `src/services/markdown-files.service.ts` - API client for file operations
- `src/hooks/useMarkdownFiles.ts` - React Query hook for file list
- `src/hooks/useMarkdownFile.ts` - React Query hook for single file
- `src/hooks/useFileTree.ts` - Hook for tree structure manipulation
- `src/types/markdown-files.ts` - TypeScript types for markdown files

### Files to Modify

- `src/routes.ts` - Add `markdownViewer` and `markdownViewerFile` routes
- `src/App.tsx` - Add route definitions for markdown viewer
- `src/components/organisms/CommandPalette.tsx` - Add markdown file search results
- `src/components/molecules/MarkdownRenderer.tsx` - Enhance code blocks with toolbar
- `src/components/templates/AdminLayout.tsx` - Add navigation item (optional, may be in separate section)

### Integration Points Verified

- ✅ React Router: Existing pattern for nested routes under `/admin`
- ✅ API Client: `src/lib/api-client.ts` supports all HTTP methods needed
- ✅ Markdown Rendering: `MarkdownRenderer` exists and supports GFM, math, code highlighting
- ✅ Markdown Editor: `MarkdownEditor` exists with view/edit/split modes
- ✅ Command Palette: `CommandPalette` component exists and can be extended
- ✅ Drag & Drop: Patterns documented in `.cursor/rules/drag-drop-patterns.mdc`
- ✅ React Query: `@tanstack/react-query` installed and used throughout
- ✅ Responsive Layout: `AdminLayout` has mobile drawer pattern to follow
- ⚠️ Virtualization: No virtualization library installed (need to add `@tanstack/react-virtual` or `react-window`)

### Potential Blockers

- **Virtualization Library**: PRD recommends virtualization for large file lists, but no library is currently installed. Need to add `@tanstack/react-virtual` or `react-window`.
- **Backend API**: All endpoints (`/api/markdown-files/*`) need to be implemented on backend. Frontend assumes these exist.
- **File Upload**: Multipart form-data upload needs to be handled by API client (may need special handling beyond standard JSON).

### Dependencies to Add

- `@tanstack/react-virtual` (recommended) or `react-window` for file tree virtualization
- Optional: `react-dropzone` for enhanced drag-and-drop (can use native HTML5 drag-drop instead)
