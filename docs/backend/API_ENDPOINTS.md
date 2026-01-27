# API Endpoints Specification

**Version:** 1.0.0  
**Base URL:** `https://api.sunnysingh.tech` (prod) | `https://dev-api.sunnysingh.tech` (dev)

---

## Overview

All endpoints (except `/auth/*`) require JWT authentication via the `Authorization: Bearer {token}` header. The JWT is issued by AWS Cognito and validated by API Gateway.

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found"
  }
}
```

### Pagination

List endpoints support pagination:

```
GET /tasks?page=1&pageSize=50&sortBy=createdAt&sortOrder=desc
```

Response includes:

```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "hasMore": true
}
```

---

## Authentication (`/auth`)

| Method | Endpoint        | Description                 | Auth Required               |
| ------ | --------------- | --------------------------- | --------------------------- |
| POST   | `/auth/signup`  | Create new user account     | No                          |
| POST   | `/auth/login`   | Authenticate and get tokens | No                          |
| POST   | `/auth/refresh` | Refresh access token        | No (requires refresh token) |
| POST   | `/auth/logout`  | Invalidate refresh token    | Yes                         |
| GET    | `/auth/me`      | Get current user profile    | Yes                         |
| PATCH  | `/auth/me`      | Update user profile         | Yes                         |

### POST `/auth/signup`

```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "data": {
    "userId": "cognito-sub-uuid",
    "email": "user@example.com",
    "message": "Verification email sent"
  }
}
```

### POST `/auth/login`

```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJjdHk...",
    "expiresIn": 3600,
    "user": {
      "id": "cognito-sub-uuid",
      "email": "user@example.com"
    }
  }
}
```

---

## Tasks (`/tasks`)

| Method | Endpoint                           | Description                        |
| ------ | ---------------------------------- | ---------------------------------- |
| GET    | `/tasks`                           | List all tasks (with filters)      |
| GET    | `/tasks/{id}`                      | Get single task                    |
| POST   | `/tasks`                           | Create task                        |
| PATCH  | `/tasks/{id}`                      | Update task                        |
| DELETE | `/tasks/{id}`                      | Delete task                        |
| GET    | `/tasks/{id}/dependencies`         | Get task dependencies              |
| POST   | `/tasks/{id}/dependencies`         | Add dependency                     |
| DELETE | `/tasks/{id}/dependencies/{depId}` | Remove dependency                  |
| POST   | `/tasks/{id}/complete`             | Mark task complete (awards points) |

### Query Parameters for GET `/tasks`

| Parameter   | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| `search`    | string | Search in title/description  |
| `status`    | string | Filter by status             |
| `priority`  | string | Filter by priority (P1-P4)   |
| `area`      | string | Filter by life area          |
| `projectId` | string | Filter by linked project     |
| `goalId`    | string | Filter by linked goal        |
| `dueDate`   | string | Filter by due date (ISO)     |
| `page`      | number | Page number (default: 1)     |
| `pageSize`  | number | Items per page (default: 50) |
| `sortBy`    | string | Sort field                   |
| `sortOrder` | string | `asc` or `desc`              |

### POST `/tasks` Request Body

```json
{
  "title": "Review Q1 financials",
  "description": "Analyze quarterly spending patterns",
  "area": "Wealth",
  "subCategory": "Income",
  "priority": "P2",
  "status": "NotStarted",
  "size": 60,
  "dueDate": "2026-01-15",
  "scheduledDate": "2026-01-14",
  "isRecurring": false,
  "recurrenceRule": null,
  "goalIds": ["goal-123"],
  "projectIds": ["project-456"]
}
```

### Task Response Schema

```json
{
  "id": "task-abc123",
  "title": "Review Q1 financials",
  "description": "Analyze quarterly spending patterns",
  "area": "Wealth",
  "subCategory": "Income",
  "priority": "P2",
  "status": "InProgress",
  "size": 60,
  "dueDate": "2026-01-15",
  "scheduledDate": "2026-01-14",
  "completedDate": null,
  "isRecurring": false,
  "recurrenceRule": null,
  "pointValue": 120,
  "pointsAwarded": false,
  "notes": null,
  "userId": "user-123",
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-10T12:30:00Z"
}
```

---

## Goals (`/goals`)

| Method | Endpoint                                     | Description                     |
| ------ | -------------------------------------------- | ------------------------------- |
| GET    | `/goals`                                     | List all goals                  |
| GET    | `/goals/{id}`                                | Get goal with progress          |
| POST   | `/goals`                                     | Create goal                     |
| PATCH  | `/goals/{id}`                                | Update goal                     |
| DELETE | `/goals/{id}`                                | Delete goal                     |
| GET    | `/goals/{id}/progress`                       | Get detailed progress breakdown |
| POST   | `/goals/{id}/criteria/{criteriaId}/complete` | Mark criterion complete         |
| GET    | `/goals/{id}/tasks`                          | Get linked tasks                |
| POST   | `/goals/{id}/tasks`                          | Link tasks to goal              |
| DELETE | `/goals/{id}/tasks/{taskId}`                 | Unlink task                     |
| GET    | `/goals/{id}/metrics`                        | Get linked metrics              |
| POST   | `/goals/{id}/metrics`                        | Link metrics to goal            |
| GET    | `/goals/{id}/habits`                         | Get linked habits               |
| POST   | `/goals/{id}/habits`                         | Link habits to goal             |
| GET    | `/goals/{id}/activity`                       | Get goal activity timeline      |

### Goal Response Schema

```json
{
  "id": "goal-abc123",
  "title": "Lose 10 pounds by June",
  "description": "Focus on sustainable weight loss",
  "area": "Health",
  "subCategory": "Physical",
  "timeHorizon": "Quarterly",
  "priority": "P1",
  "status": "Active",
  "targetDate": "2026-06-01",
  "completedDate": null,
  "successCriteria": [
    {
      "id": "criteria-1",
      "text": "Reach 180 lbs",
      "isCompleted": false,
      "completedAt": null,
      "linkedMetricId": "metric-weight",
      "linkedTaskId": null,
      "targetDate": "2026-06-01",
      "order": 1
    }
  ],
  "progressConfig": {
    "criteriaWeight": 40,
    "tasksWeight": 30,
    "metricsWeight": 20,
    "habitsWeight": 10,
    "manualOverride": null
  },
  "cachedProgress": 42,
  "parentGoalId": "goal-yearly-health",
  "lastActivityAt": "2026-01-10T14:00:00Z",
  "notes": null,
  "userId": "user-123",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T14:00:00Z"
}
```

### GET `/goals/{id}/progress` Response

```json
{
  "overall": 42,
  "criteria": {
    "completed": 2,
    "total": 5,
    "percentage": 40
  },
  "tasks": {
    "completed": 8,
    "total": 12,
    "percentage": 67
  },
  "metrics": {
    "atTarget": 2,
    "total": 3,
    "percentage": 67
  },
  "habits": {
    "streakDays": 14,
    "consistency": 85
  },
  "health": {
    "status": "on_track",
    "daysRemaining": 142,
    "velocityScore": 0.8,
    "momentum": "active"
  }
}
```

---

## Metrics (`/metrics`)

| Method | Endpoint                     | Description                                 |
| ------ | ---------------------------- | ------------------------------------------- |
| GET    | `/metrics`                   | List all metrics                            |
| GET    | `/metrics/{id}`              | Get metric with recent logs                 |
| POST   | `/metrics`                   | Create metric                               |
| PATCH  | `/metrics/{id}`              | Update metric                               |
| DELETE | `/metrics/{id}`              | Delete metric                               |
| GET    | `/metrics/{id}/logs`         | Get metric logs                             |
| POST   | `/metrics/{id}/logs`         | Add metric log (triggers milestone check)   |
| DELETE | `/metrics/{id}/logs/{logId}` | Delete log                                  |
| GET    | `/metrics/{id}/milestones`   | Get metric milestones                       |
| GET    | `/metrics/{id}/analytics`    | Get computed analytics (trend, predictions) |
| GET    | `/metrics/{id}/insights`     | Get cached AI insights                      |

### Metric Response Schema

```json
{
  "id": "metric-abc123",
  "name": "Daily Steps",
  "description": "Track daily walking activity",
  "area": "Health",
  "subCategory": "Exercise",
  "unit": "count",
  "customUnit": null,
  "direction": "Higher",
  "targetValue": 10000,
  "thresholdLow": 5000,
  "thresholdHigh": 15000,
  "source": "Manual",
  "status": "Active",
  "userId": "user-123",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z"
}
```

### POST `/metrics/{id}/logs` Request

```json
{
  "value": 10500,
  "loggedAt": "2026-01-10T18:00:00Z",
  "notes": "Walked to work today"
}
```

### GET `/metrics/{id}/analytics` Response

```json
{
  "trend": {
    "current": 10500,
    "previous": 9800,
    "change": 700,
    "changePercent": 7.14,
    "velocity": 250,
    "acceleration": 50,
    "isImproving": true
  },
  "progress": {
    "current": 10500,
    "target": 10000,
    "percentage": 105,
    "remaining": 0,
    "isOnTrack": true
  },
  "streak": {
    "current": 14,
    "longest": 21
  },
  "prediction": {
    "futureValue": 12000,
    "daysAhead": 30,
    "confidence": 0.75
  }
}
```

---

## Habits (`/habits`)

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/habits`                  | List all habits                  |
| GET    | `/habits/{id}`             | Get habit with streak info       |
| POST   | `/habits`                  | Create habit                     |
| PATCH  | `/habits/{id}`             | Update habit                     |
| DELETE | `/habits/{id}`             | Delete habit                     |
| GET    | `/habits/{id}/logs`        | Get completion logs              |
| POST   | `/habits/{id}/logs`        | Log habit completion             |
| DELETE | `/habits/{id}/logs/{date}` | Remove completion                |
| GET    | `/habits/{id}/heatmap`     | Get calendar heatmap data        |
| GET    | `/habits/today`            | Get habits due today with status |

### Habit Response Schema

```json
{
  "id": "habit-abc123",
  "name": "Morning meditation",
  "description": "10-minute mindfulness practice",
  "area": "Health",
  "subCategory": "Mental",
  "habitType": "Build",
  "frequency": "Daily",
  "trigger": "After morning coffee",
  "action": "Meditate for 10 minutes",
  "reward": "Feel calm and focused",
  "frictionUp": null,
  "frictionDown": "Keep cushion by coffee maker",
  "status": "Active",
  "streak": {
    "current": 14,
    "longest": 30
  },
  "userId": "user-123",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z"
}
```

### GET `/habits/{habitId}/logs` Request

**Path Parameters:**

- `habitId` (string, required): The unique identifier of the habit

**Query Parameters:**

- `startDate` (string, optional): Filter logs from this date (ISO 8601 format: `YYYY-MM-DD`). Defaults to no lower bound.
- `endDate` (string, optional): Filter logs up to this date (ISO 8601 format: `YYYY-MM-DD`). Defaults to no upper bound.
- `page` (number, optional): Page number for pagination (1-indexed). Default: `1`
- `pageSize` (number, optional): Number of logs per page. Default: `50`, Max: `100`
- `sortBy` (string, optional): Field to sort by. Options: `completedAt` (default), `createdAt`
- `sortOrder` (string, optional): Sort direction. Options: `desc` (default), `asc`

**Example Request:**

```
GET /habits/habit-abc123/logs?startDate=2026-01-01&endDate=2026-01-31&page=1&pageSize=50&sortBy=completedAt&sortOrder=desc
```

**Authentication:**

- Requires JWT token in `Authorization` header: `Bearer <token>`
- User must own the habit (habit.userId must match authenticated user)

### GET `/habits/{habitId}/logs` Response

**Success Response (200 OK):**

```json
{
  "data": [
    {
      "id": "log-xyz789",
      "habitId": "habit-abc123",
      "completedAt": "2026-01-15T08:30:00Z",
      "amount": 1,
      "notes": "Felt very focused today",
      "userId": "user-123",
      "createdAt": "2026-01-15T08:30:15Z"
    },
    {
      "id": "log-xyz788",
      "habitId": "habit-abc123",
      "completedAt": "2026-01-14T08:25:00Z",
      "amount": 1,
      "notes": null,
      "userId": "user-123",
      "createdAt": "2026-01-14T08:25:10Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 50,
  "hasMore": false
}
```

**Response Schema:**

| Field      | Type         | Description                                                  |
| ---------- | ------------ | ------------------------------------------------------------ |
| `data`     | `HabitLog[]` | Array of habit log entries                                   |
| `total`    | `number`     | Total number of logs matching the filters (across all pages) |
| `page`     | `number`     | Current page number (1-indexed)                              |
| `pageSize` | `number`     | Number of items per page                                     |
| `hasMore`  | `boolean`    | Whether there are more pages available                       |

**HabitLog Schema:**

| Field         | Type             | Description                                                                 |
| ------------- | ---------------- | --------------------------------------------------------------------------- |
| `id`          | `string`         | Unique log identifier                                                       |
| `habitId`     | `string`         | Parent habit ID                                                             |
| `completedAt` | `string`         | ISO 8601 timestamp when habit was completed                                 |
| `amount`      | `number \| null` | Optional quantity/amount (e.g., for habits like "drink 8 glasses of water") |
| `notes`       | `string \| null` | Optional notes about the completion                                         |
| `userId`      | `string`         | User who created the log                                                    |
| `createdAt`   | `string`         | ISO 8601 timestamp when log was created                                     |

**Error Responses:**

- `400 Bad Request`: Invalid query parameters (e.g., invalid date format, invalid sortBy value)

  ```json
  {
    "error": {
      "message": "Invalid date format. Expected YYYY-MM-DD",
      "code": "VALIDATION_ERROR"
    }
  }
  ```

- `401 Unauthorized`: Missing or invalid JWT token

  ```json
  {
    "error": {
      "message": "Authentication required",
      "code": "UNAUTHORIZED"
    }
  }
  ```

- `403 Forbidden`: User does not have access to this habit

  ```json
  {
    "error": {
      "message": "Access denied",
      "code": "FORBIDDEN"
    }
  }
  ```

- `404 Not Found`: Habit does not exist
  ```json
  {
    "error": {
      "message": "Habit not found",
      "code": "NOT_FOUND"
    }
  }
  ```

**Notes:**

- If no logs exist for the habit, returns empty array with `total: 0`
- Date filters are inclusive (logs on `startDate` and `endDate` are included)
- If `startDate` > `endDate`, returns empty array
- Default sorting is by `completedAt` descending (most recent first)
- The `amount` field is optional and may be `null` for simple completion tracking
- All timestamps are in ISO 8601 format (UTC)

---

## Projects (`/projects`)

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/projects`             | List all projects              |
| GET    | `/projects/{id}`        | Get project with health status |
| POST   | `/projects`             | Create project                 |
| PATCH  | `/projects/{id}`        | Update project                 |
| DELETE | `/projects/{id}`        | Delete project                 |
| GET    | `/projects/{id}/tasks`  | Get linked tasks               |
| POST   | `/projects/{id}/tasks`  | Link tasks                     |
| GET    | `/projects/{id}/goals`  | Get linked goals               |
| GET    | `/projects/{id}/health` | Get computed health status     |

### Project Response Schema

```json
{
  "id": "project-abc123",
  "name": "Website Redesign",
  "description": "Complete overhaul of portfolio site",
  "area": "DayJob",
  "subCategory": "Projects",
  "priority": "P1",
  "status": "Active",
  "impact": 4,
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "completedDate": null,
  "notes": null,
  "health": {
    "status": "green",
    "tasksCompleted": 8,
    "tasksTotal": 15,
    "percentComplete": 53
  },
  "userId": "user-123",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z"
}
```

---

## Logbook (`/logbook`)

| Method | Endpoint              | Description                      |
| ------ | --------------------- | -------------------------------- |
| GET    | `/logbook`            | List entries (paginated by date) |
| GET    | `/logbook/{date}`     | Get entry for specific date      |
| POST   | `/logbook`            | Create entry                     |
| PATCH  | `/logbook/{id}`       | Update entry                     |
| DELETE | `/logbook/{id}`       | Delete entry                     |
| GET    | `/logbook/{id}/links` | Get linked entities              |
| POST   | `/logbook/{id}/links` | Link entities to entry           |

### Logbook Entry Response

```json
{
  "id": "logbook-abc123",
  "date": "2026-01-10",
  "title": "Productive Monday",
  "notes": "Completed 5 tasks, hit 10k steps...",
  "mood": "High",
  "energy": 8,
  "linkedTasks": ["task-1", "task-2"],
  "linkedGoals": ["goal-1"],
  "linkedHabits": ["habit-1"],
  "userId": "user-123",
  "createdAt": "2026-01-10T22:00:00Z",
  "updatedAt": "2026-01-10T22:30:00Z"
}
```

---

## Rewards (`/rewards`)

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/rewards`             | List available rewards         |
| GET    | `/rewards/{id}`        | Get reward details             |
| POST   | `/rewards`             | Create custom reward           |
| PATCH  | `/rewards/{id}`        | Update reward                  |
| DELETE | `/rewards/{id}`        | Delete reward                  |
| POST   | `/rewards/{id}/redeem` | Redeem reward (deduct points)  |
| GET    | `/wallet`              | Get wallet balance and history |
| POST   | `/wallet/add`          | Manually add points            |

### Wallet Response

```json
{
  "balance": 2500,
  "lifetimeEarned": 15000,
  "lifetimeSpent": 12500,
  "recentTransactions": [
    {
      "id": "txn-1",
      "amount": 200,
      "type": "earned",
      "reason": "Completed task: Review Q1 financials",
      "taskId": "task-abc",
      "createdAt": "2026-01-10T14:00:00Z"
    }
  ]
}
```

---

## Knowledge Vault (`/knowledge`)

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/knowledge/courses`                    | List courses                 |
| GET    | `/knowledge/courses/{id}`               | Get course with lessons      |
| POST   | `/knowledge/courses`                    | Create course (AI-generated) |
| GET    | `/knowledge/flashcards`                 | List flashcard decks         |
| POST   | `/knowledge/flashcards/{deckId}/review` | Submit review session        |
| GET    | `/knowledge/skills`                     | Get skill tree               |
| POST   | `/knowledge/skills/{id}/progress`       | Update skill progress        |

---

## AI Features (`/ai`)

All AI endpoints proxy to LLM providers using stored API keys.

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| POST   | `/ai/tasks/parse`          | Parse natural language → task |
| POST   | `/ai/tasks/breakdown`      | Break task into subtasks      |
| POST   | `/ai/tasks/prioritize`     | Get priority recommendation   |
| POST   | `/ai/tasks/estimate`       | Estimate effort               |
| POST   | `/ai/tasks/categorize`     | Auto-categorize task          |
| POST   | `/ai/tasks/dependencies`   | Detect dependencies           |
| POST   | `/ai/goals/refine`         | Refine goal text              |
| POST   | `/ai/goals/criteria`       | Generate success criteria     |
| POST   | `/ai/goals/cascade`        | Break goal into sub-goals     |
| POST   | `/ai/goals/forecast`       | Predict achievement           |
| POST   | `/ai/metrics/patterns`     | Analyze metric patterns       |
| POST   | `/ai/metrics/anomalies`    | Detect anomalies              |
| POST   | `/ai/metrics/correlations` | Find correlations             |
| POST   | `/ai/metrics/predict`      | Predict trajectory            |
| POST   | `/ai/habits/design`        | Optimize habit loop           |
| POST   | `/ai/habits/stack`         | Suggest habit stacking        |
| POST   | `/ai/logbook/prompts`      | Generate reflection prompts   |
| POST   | `/ai/logbook/digest`       | Generate daily digest         |
| POST   | `/ai/weekly-review`        | Generate weekly review        |

### AI Request Format

```json
// POST /ai/tasks/parse
{
  "input": "Review Q1 financials by next Friday"
}

// POST /ai/goals/criteria
{
  "goalId": "goal-123",
  "goalTitle": "Lose 10 pounds by June",
  "goalDescription": "Focus on sustainable weight loss"
}

// POST /ai/metrics/patterns
{
  "metricId": "metric-123"
}
```

### AI Response Format

```json
{
  "success": true,
  "data": {
    "result": { ... },  // Feature-specific output
    "confidence": 0.92,
    "reasoning": "Based on the analysis...",
    "provider": "anthropic",
    "model": "claude-sonnet-4-20250514",
    "cached": false
  }
}
```

---

## Error Codes

| Code                 | HTTP Status | Description             |
| -------------------- | ----------- | ----------------------- |
| `VALIDATION_ERROR`   | 400         | Invalid request body    |
| `UNAUTHORIZED`       | 401         | Missing or invalid JWT  |
| `FORBIDDEN`          | 403         | Access denied           |
| `NOT_FOUND`          | 404         | Resource not found      |
| `CONFLICT`           | 409         | Resource already exists |
| `RATE_LIMITED`       | 429         | Too many requests       |
| `INTERNAL_ERROR`     | 500         | Server error            |
| `LLM_ERROR`          | 502         | LLM provider error      |
| `LLM_NOT_CONFIGURED` | 503         | LLM API key not set     |

---

## Rate Limits

| Endpoint Type  | Limit       |
| -------------- | ----------- |
| Auth endpoints | 10 req/min  |
| CRUD endpoints | 100 req/min |
| AI endpoints   | 20 req/min  |

Rate limit headers included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704931200
```
