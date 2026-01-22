# Dashboard Summary API Contract

## Overview

The `/api/dashboard/summary` endpoint aggregates all dashboard data into a single response, reducing the number of API calls from 6-8 separate requests to 1.

## Endpoint

```
GET /api/dashboard/summary
```

## Authentication

Requires JWT authentication via `Authorization: Bearer {token}` header.

## Request

### Query Parameters (Optional)

| Parameter          | Type    | Default           | Description                                  |
| ------------------ | ------- | ----------------- | -------------------------------------------- |
| `includeCompleted` | boolean | `false`           | Include completed tasks/goals in response    |
| `taskLimit`        | number  | `undefined` (all) | Limit number of tasks returned               |
| `transactionLimit` | number  | `10`              | Limit number of wallet transactions returned |

### Example Request

```
GET /api/dashboard/summary?includeCompleted=false&taskLimit=50&transactionLimit=10
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task-123",
        "title": "Complete project proposal",
        "status": "In Progress",
        "priority": "P1",
        "area": "DayJob",
        "pointValue": 50,
        "createdAt": "2026-01-15T10:00:00Z",
        "updatedAt": "2026-01-18T14:30:00Z"
      }
    ],
    "goals": [
      {
        "id": "goal-456",
        "title": "Launch new product",
        "status": "Active",
        "area": "DayJob",
        "targetDate": "2026-06-30T00:00:00Z",
        "successCriteria": [
          {
            "description": "Complete MVP",
            "isCompleted": false
          }
        ],
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-18T12:00:00Z"
      }
    ],
    "projects": [
      {
        "id": "project-789",
        "name": "Website Redesign",
        "status": "Active",
        "area": "DayJob",
        "progress": 65,
        "createdAt": "2026-01-10T00:00:00Z",
        "updatedAt": "2026-01-18T15:00:00Z"
      }
    ],
    "habits": [
      {
        "id": "habit-321",
        "title": "Morning Meditation",
        "frequency": "Daily",
        "type": "Build",
        "area": "Health",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-18T08:00:00Z"
      }
    ],
    "metrics": [
      {
        "id": "metric-654",
        "name": "Daily Steps",
        "unit": "count",
        "direction": "Higher",
        "status": "Active",
        "area": "Health",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-18T20:00:00Z"
      }
    ],
    "logbookEntries": [
      {
        "id": "entry-987",
        "date": "2026-01-18",
        "content": "Had a productive day working on the new feature",
        "mood": "good",
        "createdAt": "2026-01-18T22:00:00Z"
      }
    ],
    "rewards": [
      {
        "id": "reward-111",
        "title": "Coffee Break",
        "description": "Take a 15-minute coffee break",
        "category": "Quick Treat",
        "pointCost": 25,
        "status": "Active",
        "redemptions": [],
        "lastRedeemedAt": null,
        "canRedeem": true,
        "cooldownMessage": null,
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z"
      }
    ],
    "wallet": {
      "balance": {
        "userId": "user-123",
        "totalPoints": 1250,
        "lifetimeEarned": 5000,
        "lifetimeSpent": 3750,
        "updatedAt": "2026-01-18T16:00:00Z"
      },
      "recentTransactions": [
        {
          "id": "txn-222",
          "userId": "user-123",
          "amount": 50,
          "type": "earn",
          "source": "task_completion",
          "sourceEntityType": "task",
          "sourceEntityId": "task-123",
          "description": "Completed task: Complete project proposal",
          "createdAt": "2026-01-18T14:30:00Z"
        }
      ]
    }
  }
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

## TypeScript Types

### Request Type

```typescript
interface DashboardSummaryRequest {
  includeCompleted?: boolean;
  taskLimit?: number;
  transactionLimit?: number;
}
```

### Response Type

```typescript
interface DashboardSummaryResponse {
  tasks: Task[];
  goals: Goal[];
  projects: Project[];
  habits: Habit[];
  metrics: Metric[];
  logbookEntries: LogbookEntry[];
  rewards: RewardWithRedemptions[];
  wallet: {
    balance: WalletBalance;
    recentTransactions: WalletTransaction[];
  };
}
```

## Implementation Notes

### Backend Implementation

1. **Parallel Data Fetching**: Fetch all data sources in parallel for optimal performance
2. **Filtering**: Apply `includeCompleted` and `taskLimit` filters before returning
3. **Transaction Limit**: Only return the most recent transactions up to `transactionLimit`
4. **Error Handling**: If any data source fails, return partial data with appropriate error indicators

### Frontend Usage

```typescript
import { apiClient } from '@/lib/api-client';
import type { DashboardSummaryResponse } from '@/types/api-contracts';

// Fetch dashboard summary
const response = await apiClient.getDashboardSummary({
  includeCompleted: false,
  taskLimit: 50,
  transactionLimit: 10,
});

if (response.success && response.data) {
  const { tasks, goals, projects, habits, metrics, logbookEntries, rewards, wallet } =
    response.data;
  // Use the aggregated data
}
```

### React Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useDashboardSummary(options?: DashboardSummaryRequest) {
  return useQuery({
    queryKey: ['dashboard', 'summary', options],
    queryFn: () => apiClient.getDashboardSummary(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
```

## Performance Considerations

- **Caching**: Frontend should cache this response for 2-5 minutes
- **Partial Updates**: Individual mutations (create/update/delete) should invalidate specific query keys, not the entire dashboard summary
- **Fallback**: If this endpoint fails, frontend can fall back to individual endpoint calls
- **Optimization**: Backend should use database joins and efficient queries to minimize response time

## Migration Path

1. **Phase 1**: Implement endpoint alongside existing individual endpoints
2. **Phase 2**: Update `DashboardPage` to use new endpoint
3. **Phase 3**: Keep individual endpoints for detail pages and mutations
4. **Phase 4**: Monitor performance and adjust caching strategies
