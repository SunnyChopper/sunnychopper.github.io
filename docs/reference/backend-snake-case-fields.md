# Backend snake_case Fields to Update

This document tracks all backend API fields that still use snake_case and should be updated to camelCase. Once updated, normalization code can be removed from the frontend.

## Projects API (`/projects`)

The following fields should be updated to camelCase. Note: camelCase versions already exist in the DTO for backwards compatibility during migration.

- `start_date` → `startDate`
- `target_end_date` → `targetEndDate`
- `actual_end_date` → `actualEndDate`
- `sub_category` → `subCategory`
- `user_id` → `userId`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- `task_count` → `taskCount`
- `completed_task_count` → `completedTaskCount`
- `health_score` → `healthScore`

**Files to update after backend migration**:

- `src/types/api/projects.dto.ts` - Remove legacy snake_case fields
- `src/components/organisms/DebugInspector.tsx` - Update `target_end_date` reference

## Chatbot API (`/chatbot/*`)

The following fields should be updated to camelCase:

**ChatThread**:

- `user_id` → `userId`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

**ChatMessage**:

- `thread_id` → `threadId`
- `created_at` → `createdAt`
- `parent_id` → `parentId`
- `metadata.task_id` → `metadata.taskId`
- `metadata.goal_id` → `metadata.goalId`
- `metadata.project_id` → `metadata.projectId`

**CreateMessageRequest**:

- `thread_id` → `threadId`
- `parent_id` → `parentId`

**Files to update after backend migration**:

- `src/types/chatbot.ts` - Update all interfaces to camelCase
- `src/services/chatbot.service.ts` - Update field references (`updated_at` → `updatedAt`, `created_at` → `createdAt`)
- `src/pages/admin/ChatbotPage.tsx` - Update `created_at` reference
- `src/lib/react-query/chatbot-cache.ts` - Update sorting field references

## Migration Checklist

After backend is updated:

- [ ] Update backend API to return camelCase fields
- [ ] Remove snake_case fields from DTOs
- [ ] Update all service methods to use camelCase
- [ ] Update all component references
- [ ] Remove normalization code that maps snake_case → camelCase
- [ ] Verify all tests pass
- [ ] Update this document to mark fields as migrated
