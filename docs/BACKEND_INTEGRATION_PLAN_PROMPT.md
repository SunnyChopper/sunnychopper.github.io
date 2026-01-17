# Backend Integration Plan Prompt

**Purpose:** This prompt is designed to be used in Cursor's Plan mode to generate a comprehensive, phased plan for integrating the frontend with the Personal OS backend API.

**Context:** The backend has been completed and is running locally at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/docs`. The OpenAPI specification is available at `http://localhost:8000/openapi.json`.

---

## Prompt for Plan Mode

```
You are an expert full-stack developer tasked with creating a comprehensive integration plan for connecting the Personal OS frontend (React + TypeScript + Vite) with the newly completed backend API (FastAPI + DynamoDB).

### Current State

**Backend:**
- Running locally at `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- OpenAPI spec: `http://localhost:8000/openapi.json`
- All endpoints are implemented and documented
- Uses AWS Cognito for authentication (JWT tokens)
- Response format: `{ success: boolean, data?: T, error?: { code: string, message: string } }`

**Frontend:**
- React + TypeScript + Vite application
- Currently uses localStorage via `IStorageAdapter` pattern
- Has `APIStorageAdapter` class partially implemented at `src/lib/storage/api-storage-adapter.ts`
- Has `ApiClient` class at `src/lib/api-client.ts` with axios
- Services use `getStorageAdapter()` which can return localStorage or API adapter
- Environment variable: `VITE_API_BASE_URL` (defaults to `/api`)

**Key Files:**
- `src/lib/api-client.ts` - Axios-based API client with interceptors
- `src/lib/storage/api-storage-adapter.ts` - Storage adapter for API calls
- `src/lib/storage/storage-interface.ts` - Interface definition
- `src/services/growth-system/*.service.ts` - Domain services (tasks, goals, metrics, habits, etc.)
- `src/services/knowledge-vault/*.service.ts` - Knowledge vault services
- `src/services/rewards/*.service.ts` - Rewards and wallet services
- `src/contexts/AuthContext.tsx` - Authentication context (needs Cognito integration)

### Integration Requirements

1. **Environment Configuration:**
   - Development: `http://localhost:8000`
   - Production: `https://api.sunnysingh.tech` (or configured via env var)
   - Use `VITE_API_BASE_URL` environment variable
   - Update `.env.example` with proper default

2. **Authentication:**
   - Integrate AWS Cognito authentication
   - Store JWT tokens securely
   - Add token refresh logic
   - Update `AuthContext.tsx` to use Cognito instead of mock auth
   - Ensure `ApiClient` automatically attaches JWT to requests

3. **API Integration Strategy:**
   - Use piecemeal approach: start with 3-5 simple endpoints to verify the pattern
   - Once verified, scale to all endpoints using the same pattern
   - Maintain backward compatibility with localStorage during transition
   - Add feature flag or environment check to switch between storage adapters

4. **Error Handling:**
   - Map backend error codes to frontend error types
   - Handle network errors gracefully
   - Show user-friendly error messages
   - Implement retry logic for transient failures

5. **Type Safety:**
   - Generate or manually create TypeScript types from OpenAPI schema
   - Ensure request/response types match backend schemas
   - Update existing types if they differ from backend

### Phase 1: Verification (Start Here)

**Goal:** Integrate 3-5 simple endpoints to establish the pattern and verify the integration works.

**Recommended Endpoints for Verification:**
1. `GET /health` - Health check (no auth required)
2. `GET /tasks` - List tasks (simple GET)
3. `POST /tasks` - Create task (simple POST)
4. `GET /tasks/{id}` - Get single task (with path param)
5. `PATCH /tasks/{id}` - Update task (with body)

**Tasks:**
1. Update `VITE_API_BASE_URL` in `.env` to `http://localhost:8000`
2. Test health endpoint to verify connectivity
3. Update `ApiClient` to handle the backend's response format
4. Create/update TypeScript types for Task endpoints
5. Update `tasks.service.ts` to use API adapter for these 5 endpoints
6. Test each endpoint manually in the UI
7. Verify error handling works correctly
8. Document any discrepancies between frontend types and backend schemas

### Phase 2: Authentication Integration

**Goal:** Integrate AWS Cognito authentication before proceeding with other endpoints.

**Tasks:**
1. Install AWS Amplify or Cognito SDK
2. Configure Cognito User Pool ID and Client ID (from backend config)
3. Update `AuthContext.tsx`:
   - Replace mock auth with Cognito signup/login
   - Implement token refresh logic
   - Store tokens securely (consider httpOnly cookies or secure storage)
4. Update `ApiClient.setAuthToken()` to be called from AuthContext
5. Test signup, login, logout, and token refresh flows
6. Verify protected endpoints require authentication
7. Handle token expiration and auto-refresh

### Phase 3: Core Domain Services (Tasks, Goals, Metrics, Habits)

**Goal:** Integrate all CRUD operations for core growth system entities.

**Services to Integrate:**
- `src/services/growth-system/tasks.service.ts` - All endpoints
- `src/services/growth-system/goals.service.ts` - All endpoints
- `src/services/growth-system/metrics.service.ts` - All endpoints + metric logs
- `src/services/growth-system/habits.service.ts` - All endpoints + habit logs
- `src/services/growth-system/projects.service.ts` - All endpoints
- `src/services/growth-system/logbook.service.ts` - All endpoints

**Tasks for Each Service:**
1. Review OpenAPI schema for the domain (e.g., `/tasks`, `/goals`)
2. Compare frontend types with backend schemas
3. Update types if needed (create mapping if significant differences)
4. Update service methods to use `APIStorageAdapter` instead of localStorage
5. Handle pagination for list endpoints
6. Handle query parameters for filtering/sorting
7. Test all CRUD operations
8. Test edge cases (empty lists, not found, validation errors)

### Phase 4: Advanced Features

**Goal:** Integrate complex endpoints with relationships and calculations.

**Features:**
- Goal progress calculation (backend-cached)
- Task dependencies and relationships
- Metric milestones and insights
- Habit streaks and statistics
- Goal-task and goal-metric linkages

**Tasks:**
1. Integrate relationship endpoints (e.g., link task to goal)
2. Update progress calculation to use backend-cached values
3. Integrate metric analytics endpoints (trends, predictions)
4. Integrate habit statistics endpoints
5. Test relationship queries and updates
6. Verify cached calculations are used correctly

### Phase 5: Knowledge Vault Integration

**Goal:** Integrate knowledge vault endpoints.

**Services:**
- `src/services/knowledge-vault/courses.service.ts`
- `src/services/knowledge-vault/vault-items.service.ts`
- `src/services/knowledge-vault/spaced-repetition.service.ts`
- `src/services/knowledge-vault/ai-course-generator.service.ts`

**Tasks:**
1. Review knowledge vault endpoints in OpenAPI
2. Update course CRUD operations
3. Integrate flashcard and note endpoints
4. Update AI course generation to use backend endpoints
5. Test course creation, editing, and deletion
6. Test flashcard review system

### Phase 6: Rewards & Wallet Integration

**Goal:** Integrate rewards system and wallet endpoints.

**Services:**
- `src/services/rewards/rewards.service.ts`
- `src/services/rewards/wallet.service.ts`
- `src/services/rewards/point-calculator.service.ts`

**Tasks:**
1. Integrate rewards CRUD
2. Integrate wallet balance and transaction endpoints
3. Update point calculation to use backend logic
4. Test reward redemption flow
5. Test wallet balance updates

### Phase 7: AI/LLM Proxy Integration

**Goal:** Integrate backend LLM proxy endpoints.

**Endpoints:**
- `/ai/tasks/*` - Task AI features
- `/ai/goals/*` - Goal AI features
- `/ai/metrics/*` - Metric AI features
- `/ai/habits/*` - Habit AI features

**Tasks:**
1. Review AI endpoints in OpenAPI
2. Update AI service methods to call backend instead of direct LLM
3. Handle streaming responses if applicable
4. Update error handling for AI-specific errors
5. Test each AI feature endpoint
6. Verify response formats match frontend expectations

### Phase 8: Migration & Cleanup

**Goal:** Complete migration and remove localStorage dependencies.

**Tasks:**
1. Add environment-based storage adapter selection
2. Remove localStorage fallback code
3. Update all services to use API adapter only
4. Remove mock data and storage utilities
5. Update tests to use API mocks
6. Document API integration patterns
7. Create migration guide for existing users (if needed)

### Technical Considerations

1. **Response Format Mapping:**
   - Backend: `{ success: boolean, data?: T, error?: { code, message } }`
   - Frontend `ApiResponse<T>` already matches this format
   - Ensure `APIStorageAdapter` correctly extracts `data` from responses

2. **Pagination:**
   - Backend list endpoints return: `{ data: T[], total: number, page: number, pageSize: number, hasMore: boolean }`
   - Update `ApiListResponse<T>` type if needed
   - Update services to handle paginated responses

3. **Error Codes:**
   - Map backend error codes to frontend error handling
   - Common codes: `NOT_FOUND`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `SERVER_ERROR`
   - Update error handling in components

4. **Type Generation (Optional):**
   - Consider using `openapi-typescript` or similar to generate types from OpenAPI spec
   - Or manually maintain types ensuring they match backend schemas

5. **Testing Strategy:**
   - Start with manual testing in browser
   - Add integration tests for critical flows
   - Mock API responses in unit tests
   - Test error scenarios

6. **Performance:**
   - Implement request caching where appropriate
   - Use React Query or similar for data fetching
   - Optimize list rendering for large datasets

### Deliverables

For each phase, produce:
1. **Detailed task breakdown** with specific file paths and line numbers
2. **Code changes** needed for each file
3. **Testing checklist** for verification
4. **Risk assessment** for each change
5. **Rollback plan** if issues arise

### Success Criteria

- All endpoints integrated and tested
- Authentication working end-to-end
- No localStorage dependencies remaining
- Error handling comprehensive
- Type safety maintained
- Performance acceptable
- User experience unchanged (or improved)

### Notes

- The backend is running and accessible - you can test endpoints during development
- Use Swagger UI at `http://localhost:8000/docs` to explore endpoints
- The OpenAPI JSON at `http://localhost:8000/openapi.json` contains the complete schema
- Maintain the existing service interface patterns where possible
- Prioritize backward compatibility during transition
- Document any API contract changes or discrepancies
```

---

## Usage Instructions

1. **Open Cursor in Plan Mode**
2. **Copy the prompt above** (starting from "You are an expert full-stack developer...")
3. **Paste into Cursor's Plan mode**
4. **Review the generated plan** - it should break down the integration into phases
5. **Start with Phase 1** (verification) to establish the pattern
6. **Once Phase 1 is verified**, proceed with remaining phases using agents

## Verification Checklist for Phase 1

After completing Phase 1, verify:

- [ ] Health endpoint responds correctly
- [ ] Can list tasks from backend
- [ ] Can create a new task
- [ ] Can fetch a single task by ID
- [ ] Can update a task
- [ ] Error handling works (test with invalid ID, network error)
- [ ] Response types match frontend expectations
- [ ] No console errors or warnings

## Next Steps After Verification

Once Phase 1 is complete and verified:

1. Document any learnings or adjustments needed
2. Use the same pattern for remaining endpoints
3. Consider using Cursor agents to automate repetitive integration tasks
4. Create service-specific integration tasks for each domain

---

**Last Updated:** January 2026
