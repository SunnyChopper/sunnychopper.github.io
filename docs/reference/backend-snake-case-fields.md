# Backend snake_case Fields to Update

This document tracks backend API fields that must be fixed to camelCase at the backend layer.

Frontend policy: do not add normalization/mapping logic for snake_case responses. Treat snake_case responses as backend contract bugs and fix them at the source.

## Projects API (`/projects`)

The following fields should be updated to camelCase.

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

**Files to verify after backend fix**:

- `src/types/api/projects.dto.ts` - Keep only canonical camelCase fields
- `src/components/organisms/DebugInspector.tsx` - Remove any legacy snake_case references

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

**Files to verify after backend fix**:

- `src/types/chatbot.ts` - Keep canonical camelCase contracts
- `src/services/chatbot.service.ts` - Keep direct contract usage without mapping
- `src/pages/admin/ChatbotPage.tsx` - Keep camelCase field usage only
- `src/lib/react-query/chatbot-cache.ts` - Keep camelCase sort/access fields only

## Migration Checklist

After backend is updated:

- [ ] Update backend API to return camelCase fields
- [ ] Remove snake_case fields from DTOs
- [ ] Update all service methods to use camelCase directly
- [ ] Update all component references to camelCase only
- [ ] Confirm no frontend normalization/mapping was introduced
- [ ] Verify all tests pass
- [ ] Update this document to mark fields as migrated
