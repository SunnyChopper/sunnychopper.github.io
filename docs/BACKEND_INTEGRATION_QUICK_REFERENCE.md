# Backend Integration Quick Reference

**Purpose:** Quick reference guide for developers integrating the frontend with the backend API.

---

## API Base URLs

| Environment | Base URL | Notes |
|-------------|----------|-------|
| **Local Development** | `http://localhost:8000` | Backend running locally |
| **Production** | `https://api.sunnysingh.tech` | Production API Gateway |
| **Dev Environment** | `https://dev-api.sunnysingh.tech` | Dev API Gateway |

**Environment Variable:** `VITE_API_BASE_URL`

---

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **OpenAPI JSON:** http://localhost:8000/openapi.json
- **ReDoc:** http://localhost:8000/redoc (if available)

---

## Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
```

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

## Authentication

All endpoints (except `/auth/*`) require JWT authentication:

**Header:**
```
Authorization: Bearer {jwt_token}
```

**Token Source:** AWS Cognito User Pool

**Token Storage:** Store in secure location (consider httpOnly cookies or secure storage)

**Token Refresh:** Use `/auth/refresh` endpoint before token expires

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate email) |
| `SERVER_ERROR` | 500 | Internal server error |
| `NETWORK_ERROR` | N/A | Network/connection error (client-side) |

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 50, max: 100)
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

**Response:**
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

**Example:**
```
GET /tasks?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc
```

---

## Key Endpoint Groups

### Authentication (`/auth`)
- `POST /auth/signup` - Create account
- `POST /auth/login` - Authenticate
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `PATCH /auth/me` - Update profile

### Tasks (`/tasks`)
- `GET /tasks` - List tasks (with filters)
- `POST /tasks` - Create task
- `GET /tasks/{id}` - Get task
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `POST /tasks/{id}/complete` - Mark complete
- `GET /tasks/{id}/dependencies` - Get dependencies

### Goals (`/goals`)
- `GET /goals` - List goals
- `POST /goals` - Create goal
- `GET /goals/{id}` - Get goal
- `PATCH /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal
- `GET /goals/{id}/progress` - Get progress (cached)
- `GET /goals/{id}/tasks` - Get linked tasks
- `GET /goals/{id}/metrics` - Get linked metrics

### Metrics (`/metrics`)
- `GET /metrics` - List metrics
- `POST /metrics` - Create metric
- `GET /metrics/{id}` - Get metric
- `PATCH /metrics/{id}` - Update metric
- `DELETE /metrics/{id}` - Delete metric
- `POST /metrics/{id}/logs` - Log metric value
- `GET /metrics/{id}/logs` - Get metric logs
- `GET /metrics/{id}/insights` - Get AI insights
- `GET /metrics/{id}/milestones` - Get milestones

### Habits (`/habits`)
- `GET /habits` - List habits
- `POST /habits` - Create habit
- `GET /habits/{id}` - Get habit
- `PATCH /habits/{id}` - Update habit
- `DELETE /habits/{id}` - Delete habit
- `POST /habits/{id}/logs` - Log completion
- `GET /habits/{id}/logs` - Get completion logs
- `GET /habits/{id}/stats` - Get statistics

### Knowledge Vault (`/knowledge`)
- `GET /knowledge/courses` - List courses
- `POST /knowledge/courses` - Create course
- `GET /knowledge/courses/{id}` - Get course
- `PATCH /knowledge/courses/{id}` - Update course
- `DELETE /knowledge/courses/{id}` - Delete course
- `GET /knowledge/notes` - List notes
- `POST /knowledge/notes` - Create note
- `GET /knowledge/flashcards` - List flashcards
- `POST /knowledge/flashcards` - Create flashcard

### Rewards (`/rewards`)
- `GET /rewards` - List rewards
- `POST /rewards` - Create reward
- `GET /rewards/{id}` - Get reward
- `POST /rewards/{id}/redeem` - Redeem reward
- `GET /rewards/wallet` - Get wallet balance
- `GET /rewards/wallet/transactions` - Get transaction history

### AI Features (`/ai`)
- `POST /ai/tasks/parse` - Parse task from text
- `POST /ai/tasks/breakdown` - Break down task
- `POST /ai/goals/suggest` - Suggest goals
- `POST /ai/metrics/insights` - Get metric insights
- `POST /ai/habits/suggest` - Suggest habits

---

## Integration Pattern

### 1. Update Service Method

**Before (localStorage):**
```typescript
async getAll(): Promise<Task[]> {
  const storage = getStorageAdapter();
  return storage.getAll<Task>('tasks');
}
```

**After (API):**
```typescript
async getAll(filters?: FilterOptions): Promise<ApiListResponse<Task>> {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.status) queryParams.append('status', filters.status);
  
  const response = await apiClient.get<PaginatedResponse<Task>>(
    `/tasks?${queryParams.toString()}`
  );
  
  if (response.success && response.data) {
    return {
      data: response.data.data,
      total: response.data.total,
      success: true,
    };
  }
  
  throw new Error(response.error?.message || 'Failed to fetch tasks');
}
```

### 2. Update Component

**Before:**
```typescript
const { data: tasks } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => tasksService.getAll(),
});
```

**After:**
```typescript
const { data: tasksResponse } = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => tasksService.getAll(filters),
});

const tasks = tasksResponse?.data || [];
const total = tasksResponse?.total || 0;
```

### 3. Error Handling

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ['tasks'],
  queryFn: () => tasksService.getAll(),
  onError: (err) => {
    if (err instanceof ApiError) {
      if (err.isUnauthorized) {
        // Redirect to login
      } else if (err.isNotFound) {
        // Show empty state
      } else {
        // Show error message
        toast.error(err.message);
      }
    }
  },
});
```

---

## Testing Endpoints

### Using Swagger UI
1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter JWT token (get from login endpoint first)
4. Test endpoints directly in the UI

### Using curl
```bash
# Health check (no auth)
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get tasks (with auth)
curl http://localhost:8000/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Browser DevTools
1. Open Network tab
2. Make request in app
3. Inspect request/response
4. Check headers, body, status

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution:** Backend should allow frontend origin. Check CORS configuration in FastAPI.

### Issue: 401 Unauthorized
**Solution:** 
- Verify token is being sent in Authorization header
- Check token hasn't expired
- Verify token format: `Bearer {token}`

### Issue: Type Mismatch
**Solution:**
- Compare frontend types with backend schemas
- Check OpenAPI schema for exact field names/types
- Update frontend types to match backend

### Issue: Pagination Not Working
**Solution:**
- Verify query parameters are correctly formatted
- Check backend expects `page` and `pageSize` (not `pageNumber` or `limit`)
- Ensure response structure matches expected format

---

## Migration Checklist

- [ ] Update `VITE_API_BASE_URL` in `.env`
- [ ] Test health endpoint
- [ ] Integrate authentication (Cognito)
- [ ] Update `ApiClient` to handle response format
- [ ] Update `APIStorageAdapter` if needed
- [ ] Integrate Phase 1 endpoints (verification)
- [ ] Test error handling
- [ ] Integrate remaining endpoints
- [ ] Remove localStorage dependencies
- [ ] Update tests
- [ ] Document API integration

---

**Last Updated:** January 2026